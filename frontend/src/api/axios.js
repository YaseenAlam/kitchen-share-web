import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry/invalidity
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear bad tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Only redirect to login if the user was on a page that requires auth.
      // Public pages (/, /login, /register, /listings/:id, /cook/:username)
      // should let the failure pass through silently.
      const publicPaths = ['/', '/login', '/register'];
      const path = window.location.pathname;
      const isPublic =
        publicPaths.includes(path) ||
        path.startsWith('/listings/') ||
        path.startsWith('/cook/');

      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;