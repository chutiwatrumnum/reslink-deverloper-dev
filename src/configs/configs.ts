// src/utils/config.ts

const MODE = import.meta.env.VITE_MODE as "dev" | "uat" | "prod";

const API_URL_MAP = {
  dev: import.meta.env.VITE_DEV_API_URL,
  uat: import.meta.env.VITE_UAT_API_URL,
  prod: import.meta.env.VITE_PROD_API_URL,
};

const APP_VERSION_MAP = {
  dev: import.meta.env.VITE_DEV_APP_VERSION,
  uat: import.meta.env.VITE_UAT_APP_VERSION,
  prod: import.meta.env.VITE_PROD_APP_VERSION,
};

const GOOGLE_API_KEY_MAP = {
  dev: import.meta.env.VITE_DEV_GOOGLE_API_KEY,
  uat: import.meta.env.VITE_UAT_GOOGLE_API_KEY,
  prod: import.meta.env.VITE_PROD_GOOGLE_API_KEY,
};

export const API_URL = API_URL_MAP[MODE];
export const APP_VERSION = APP_VERSION_MAP[MODE];
export const NEXRES_GOOGLE_API_KEY = GOOGLE_API_KEY_MAP[MODE];

export { MODE };
