import axios from "axios";
import { plateVistaConfig } from "../Config/plateVista.config";
import { notify, triggerUnauthorized } from "../utils/notify";

const PUBLIC_REQUESTS = [
  { method: "get", match: (url) => url.includes("/menu-items") },
  { method: "post", match: (url) => /\/users\/?$/.test(url) },
  { method: "post", match: (url) => /\/auth\/(employee\/)?login/.test(url) },
  { method: "post", match: (url) => /\/auth\/table\//.test(url) },
];

const isPublicRequest = (config) => {
  const url = config.url || "";
  const method = (config.method || "get").toLowerCase();
  return PUBLIC_REQUESTS.some(
    (rule) => rule.method === method && rule.match(url)
  );
};

const shouldSkipAuthRedirect = (config) => {
  const url = config?.url || "";
  return (
    /\/auth\/(employee\/)?login/.test(url) || /\/auth\/table\//.test(url)
  );
};

const api = axios.create({
  baseURL: plateVistaConfig.VITE_VERCEL_API_URL,
});

export const getAuthToken = () => localStorage.getItem("authToken");

api.interceptors.request.use((config) => {
  if (!isPublicRequest(config)) {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;
    const config = error.config;

    if (status === 401 && !shouldSkipAuthRedirect(config)) {
      triggerUnauthorized();
    } else if (status === 403) {
      notify("Not allowed");
    } else if (status === 429) {
      notify(serverMessage || "Too many attempts, please try again later");
    }

    return Promise.reject(error);
  }
);

export default api;
