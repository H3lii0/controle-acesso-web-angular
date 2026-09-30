const browserHost = typeof window !== 'undefined' && window.location.hostname
  ? window.location.hostname
  : 'localhost';
const API_ORIGIN = `http://${browserHost}:8000`;

export const API_BASE_URL = `${API_ORIGIN}/api`;
export const SANCTUM_CSRF_URL = `${API_ORIGIN}/sanctum/csrf-cookie`;


