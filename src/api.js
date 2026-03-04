import axios from 'axios';

const api = axios.create({ baseURL: '/v1', withCredentials: true });

// No request interceptor needed — cookies are sent automatically

let isRefreshing = false;
let failedQueue = [];

function processQueue(error) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
}

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    const status = err.response?.status;

    // Don't intercept auth routes
    if (status !== 401 || originalRequest?.url?.includes('/auth/')) {
      return Promise.reject(err);
    }

    // Already retried — give up
    if (originalRequest._retry) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
      window.location.href = '/login';
      return Promise.reject(err);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post('/auth/refresh');
      processQueue(null);
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
      window.location.href = '/login';
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
