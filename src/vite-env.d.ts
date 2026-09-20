/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VERCEL_API_URL?: string;
  readonly VITE_RENDER_API_URL?: string;
  readonly VITE_PLATE_VISTA_URL?: string;
  readonly VITE_WS_API_URL?: string;
  readonly VITE_DEVELOPMENT_URL?: string;
  readonly VITE_DEVELOPMENT_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.jpg";
declare module "*.svg";
declare module "*.png";
declare module "*.webp";
