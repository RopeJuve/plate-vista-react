const requiredProd = [
  "VITE_VERCEL_API_URL",
  "VITE_WS_API_URL",
  "VITE_PLATE_VISTA_URL",
];

if (!import.meta.env.DEV) {
  const missing = requiredProd.filter((key) => !import.meta.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

const toSecureWsUrl = (url) => {
  if (!url) {
    return url;
  }
  if (typeof window !== "undefined" && window.location.protocol === "https:" && url.startsWith("ws://")) {
    return `wss://${url.slice(5)}`;
  }
  return url;
};

export const plateVistaConfig = {
  VITE_VERCEL_API_URL: import.meta.env.DEV
    ? import.meta.env.VITE_DEVELOPMENT_URL || import.meta.env.VITE_VERCEL_API_URL
    : import.meta.env.VITE_VERCEL_API_URL,
  VITE_WS_API_URL: toSecureWsUrl(
    import.meta.env.DEV
      ? import.meta.env.VITE_DEVELOPMENT_WS_URL || import.meta.env.VITE_WS_API_URL
      : import.meta.env.VITE_WS_API_URL
  ),
};
