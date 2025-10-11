export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
};

export default API_CONFIG;
