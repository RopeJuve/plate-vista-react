import axios from 'axios';
import { plateVistaConfig } from '../Config/plateVista.config';

const apiUrl = plateVistaConfig.VITE_VERCEL_API_URL;

export const fetchMenuItems = (restaurantId) => {
  return axios.get(`${apiUrl}/menu-items`,{
    headers:{
      "x-restaurant-id": restaurantId,
    },
  });
};

export const updateMenuItem = (id, item, restaurantId) => {
  return axios.put(`${apiUrl}/menu-items/${id}`, item, {
    headers:{
      "x-restaurant-id": restaurantId,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const addMenuItem = (item, restaurantId) => {
  return axios.post(`${apiUrl}/menu-items`, item, {
    headers:{
      "x-restaurant-id": restaurantId,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteMenuItem = (id, restaurantId) => {
  return axios.delete(`${apiUrl}/menu-items/${id}`, {
    headers:{
      "x-restaurant-id": restaurantId,
    },
  });
};

export const fetchCategories = (restaurantId) => {
  return axios.get(`${apiUrl}/menu-items/category`,{
    headers:{
      "x-restaurant-id": restaurantId,
    },
  });
};
