export const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

// API URL Configuration:
// - Set VITE_API_URL in .env for production API endpoint
// - Use empty string '' for same-domain deployment (relative URLs)
// - Defaults to localhost:4000 for development
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If VITE_API_URL is set, use it
  if (envUrl !== undefined) {
    return envUrl;
  }
  
  // Production: use VPS API (temporary until Heroku is set up)
  if (import.meta.env.PROD) {
    return 'http://72.61.229.21:4000';
  }
  
  // Default to localhost for development
  return 'http://localhost:4000';
};

export const API_BASE_URL = getApiBaseUrl();

export const APP_COLORS = {
  coffee: {
    brown: '#6F4E37',
    dark: '#4E3626',
    light: '#EBE3D5',
    cream: '#F5EFE6',
    bg: '#F8F5F2',
  },
  green: {
    primary: '#3A7D44',
  },
} as const;

export const USER_ROLES = {
  FARMER: 'farmer',
  ROASTER: 'roaster',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

