import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export const BASE_URL = 'http://localhost:8080/api/v1';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This ensures cookies (including token) are sent with requests
});

export const axiosLoginInstance = axios.create({
  baseURL: `${BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }[] = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Interceptor for handling token refresh and retrying requests
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Log the error for debugging
    console.error('Interceptor Error:', error);

    // If the request is for the refresh endpoint, reject immediately
    if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Handle network error
    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          return await axiosInstance(originalRequest);
        } catch (err) {
          return await Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        console.log('Attempting to refresh token...');
        axiosInstance
          .get('/auth/refresh') // Exclude this from retry logic
          .then(() => {
            console.log('Token refreshed successfully');
            processQueue(null);
            resolve(axiosInstance(originalRequest));
          })
          .catch((err: AxiosError) => {
            console.error('Token refresh failed:', err);
            processQueue(err);
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  },
);
