export const plateVistaConfig = {
  VITE_VERCEL_API_URL: import.meta.env.DEV
    ? import.meta.env.VITE_DEVELOPMENT_URL
    : import.meta.env.VITE_VERCEL_API_URL,
  VITE_WS_API_URL: import.meta.env.DEV
    ? import.meta.env.VITE_DEVELOPMENT_WS_URL
    : import.meta.env.VITE_WS_API_URL,
};
