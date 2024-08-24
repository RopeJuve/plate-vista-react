import axios from 'axios';

const apiUrl = import.meta.env.VITE_VERCEL_API_URL;

export const fetchMenuItems = () => {
  return axios.get(`${apiUrl}/menu-items`);
};

export const updateMenuItem = (id, item) => {
  return axios.put(`${apiUrl}/menu-items/${id}`, item);
};

export const addMenuItem = (item) => {
  return axios.post(`${apiUrl}/menu-items`, item);
};

export const deleteMenuItem = (id) => {
  return axios.delete(`${apiUrl}/menu-items/${id}`);
};

export const fetchCategories = () => {
  return axios.get(`${apiUrl}/menu-items/category`);
};
