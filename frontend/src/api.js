import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Expired / invalid token: clear session and go to login
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('hs_token');
      localStorage.removeItem('hs_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (err, fallback = 'Something went wrong') => {
  if (!err.response) {
    return 'Cannot reach the backend. Start it and check http://localhost:8080/api/auth/health shows {"status":"ok"}.';
  }
  return err.response.data?.message || `${fallback} (server returned ${err.response.status})`;
};

export default api;
