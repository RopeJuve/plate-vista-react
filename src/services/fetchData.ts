import api from "./api";

export const fetchData = (url, config?) => api.get(url, config);

export const postData = (url, data, config?) => api.post(url, data, config);

export const fetchUserData = (url, config?) => api.get(url, config);
