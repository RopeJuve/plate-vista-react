import axios from 'axios';

const apiUrl = import.meta.env.VITE_VERCEL_API_URL;

export const fetchEmployees = () => {
  return axios.get(`${apiUrl}/employee`);
};