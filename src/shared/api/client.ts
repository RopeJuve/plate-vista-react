import type { InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { plateVistaConfig } from "../../Config/plateVista.config";
import { notify, triggerUnauthorized } from "../../utils/notify";
import { decodeJwt, readRestaurantId } from "./jwt";
import { getAccessToken, getRefreshToken, refreshSession, SessionExpiredError } from "./tokens";

declare module "axios" {
  interface AxiosRequestConfig {
    /** The caller shows the error itself, so skip the global 403/429 toast. */
    skipErrorToast?: boolean;
    /** Internal: set on the one retry after a token refresh. */
    retriedAfterRefresh?: boolean;
  }
}

const PUBLIC_REQUESTS = [
  { method: "get", match: (url: string) => /\/r\/[^/]+\/menu-items/.test(url) },
  { method: "post", match: (url: string) => /\/users\/?$/.test(url) },
  { method: "post", match: (url: string) => /\/auth\/(employee\/)?login/.test(url) },
  { method: "post", match: (url: string) => /\/auth\/register/.test(url) },
  { method: "post", match: (url: string) => /\/auth\/(refresh|logout)/.test(url) },
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

export const getAuthToken = getAccessToken;

const readStoredRestaurantId = (token: string | null) => {
  const stored = localStorage.getItem("restaurantId");
  if (stored) {
    return stored;
  }
  return token ? readRestaurantId(decodeJwt(token)) : null;
};

apiClient.interceptors.request.use(async (config) => {
  if (!isPublicRequest(config)) {
    // After a reload only the refresh token survives; trade it in first.
    if (!getAccessToken() && getRefreshToken()) {
      await refreshSession().catch(() => undefined);
    }
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const restaurantId = readStoredRestaurantId(token);
    if (restaurantId) {
      config.headers["x-restaurant-id"] = restaurantId;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;
    const config = error.config as InternalAxiosRequestConfig | undefined;

    if (status === 401 && config && !shouldSkipAuthRedirect(config) && !isPublicRequest(config)) {
      if (!config.retriedAfterRefresh && getRefreshToken()) {
        try {
          await refreshSession();
          return apiClient({ ...config, retriedAfterRefresh: true });
        } catch (refreshError) {
          if (!(refreshError instanceof SessionExpiredError)) {
            return Promise.reject(error);
          }
        }
      }
      triggerUnauthorized();
    } else if (config?.skipErrorToast) {
      // The caller shows its own message.
    } else if (status === 403) {
      notify(serverMessage || "Not allowed");
    } else if (status === 429) {
      notify(serverMessage || "Too many attempts, please try again later");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
