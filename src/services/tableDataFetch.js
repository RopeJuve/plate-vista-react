import axios from 'axios';

const apiUrl = import.meta.env.VITE_VERCEL_API_URL;

export const fetchTables = () => {
  return axios.get(`${apiUrl}/table`);
};
