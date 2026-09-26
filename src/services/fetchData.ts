import type { AxiosRequestConfig } from "axios";
import api from "./api";

export const fetchData = (url: string, config?: AxiosRequestConfig) => api.get(url, config);

export const postData = (url: string, data?: unknown, config?: AxiosRequestConfig) =>
  api.post(url, data, config);

export const fetchUserData = (url: string, config?: AxiosRequestConfig) => api.get(url, config);
