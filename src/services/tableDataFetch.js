import axios from 'axios';
import { plateVistaConfig } from '../Config/plateVista.config';

const apiUrl = plateVistaConfig.VITE_VERCEL_API_URL;

export const fetchTables = () => {
  return axios.get(`${apiUrl}/table`);
};
