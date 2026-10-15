import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/** While true, services return built-in dummy data instead of calling the backend. */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const TOKEN_KEY = 'algonest-token';
export const USER_KEY = 'algonest-user';
export const UNAUTHORIZED_EVENT = 'algonest:unauthorized';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  },
);

/** Turns any thrown value (axios, FastAPI validation, plain Error) into a user-facing message. */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string' && detail) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((item) => item?.msg).filter(Boolean).join(' ') || fallback;
  }
  if (error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED') {
    return 'Cannot reach the server. Check your connection and try again.';
  }
  if (!error?.response && error?.message) return error.message;
  return fallback;
}

export default api;
