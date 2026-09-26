import type { InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { plateVistaConfig } from "../../Config/plateVista.config";
import { notify, triggerUnauthorized } from "../../utils/notify";

const PUBLIC_REQUESTS = [
  { method: "get", match: (url: string) => url.includes("/menu-items") },
  { method: "post", match: (url: string) => /\/users\/?$/.test(url) },
  { method: "post", match: (url: string) => /\/auth\/(employee\/)?login/.test(url) },
  { method: "post", match: (url: string) => /\/auth\/register/.test(url) },
  { method: "post", match: (url: string) => /\/auth\/table\//.test(url) },
];

const isPublicRequest = (config: InternalAxiosRequestConfig) => {
  const url = config.url || "";
  const method = (config.method || "get").toLowerCase();
  return PUBLIC_REQUESTS.some((rule) => rule.method === method && rule.match(url));
};

const shouldSkipAuthRedirect = (config?: InternalAxiosRequestConfig) => {
  const url = config?.url || "";
  return /\/auth\/(employee\/)?login/.test(url) || /\/auth\/table\//.test(url);
};

/**
 * REST client for the Vercel deployment (reads, auth, admin CRUD,
 * `GET /staff/board`, `POST /ws-ticket`, `POST /sessions/:id/close`).
 * All order writes go through `shared/realtime`, never through this client.
 */
const apiClient = axios.create({
  baseURL: plateVistaConfig.VITE_VERCEL_API_URL,
});

export const getAuthToken = () => localStorage.getItem("authToken");

apiClient.interceptors.request.use((config) => {
  if (!isPublicRequest(config)) {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
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

export default apiClient;
