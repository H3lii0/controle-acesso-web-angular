const browserHost = typeof window !== 'undefined' && window.location.hostname
  ? window.location.hostname
  : 'localhost';
const isAngularDevServer = typeof window !== 'undefined' && window.location.port === '4200';
const API_ORIGIN = isAngularDevServer ? '' : `http://${browserHost}:8000`;

export const API_BASE_URL = `${API_ORIGIN}/api`;
export const SANCTUM_CSRF_URL = `${API_ORIGIN}/sanctum/csrf-cookie`;


