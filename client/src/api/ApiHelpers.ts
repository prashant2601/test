import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  //baseURL: 'http://localhost:5000',
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Required for cookies (refresh token)
});

// Helper function to refresh token
const refreshToken = async () => {
  try {
    const res = await axiosInstance.post('/api/auth/refresh-token');
    localStorage.setItem('appToken', res.data.accessToken);
    return res.data.accessToken;
  } catch (error) {
    localStorage.removeItem('appToken');
    window.location.href = '/login'; // Redirect to login on failure
    throw error;
  }
};

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('appToken');

    // Cast config to InternalAxiosRequestConfig to ensure compatibility
    const internalConfig = config as InternalAxiosRequestConfig;

    if (token) {
      internalConfig.headers = internalConfig.headers || {}; // Ensure headers is not undefined
      internalConfig.headers['Authorization'] = `Bearer ${token}`;
    }

    return internalConfig;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // ✅ Extract 'X-Last-Active' from response headers
    const userLastActive = response.headers['x-last-active'];

    if (userLastActive) {
      localStorage.setItem('userLastActive', userLastActive);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 (Unauthorized), try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite loop

      try {
        const newToken = await refreshToken();

        if (newToken) {
          axiosInstance.defaults.headers.common['Authorization'] =
            `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          // Retry the original request
          return axiosInstance(originalRequest);
        } else {
          localStorage.removeItem('appToken');
        }
      } catch (refreshError) {
        localStorage.removeItem('appToken');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const ApiHelpers = {
  GET: (url: string, config: AxiosRequestConfig = {}) =>
    axiosInstance.get(url, config),
  POST: (
    url: string,
    data?: FormData | JSON | Record<string, any>,
    config: AxiosRequestConfig = {}
  ) => {
    if (data instanceof FormData) {
      config.headers = {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      };
    } else {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
      };
    }
    return axiosInstance.post(url, data, config);
  },
  PUT: (url: string, data: any, config: AxiosRequestConfig = {}) =>
    axiosInstance.put(url, data, config),
  DELETE: (url: string, config: AxiosRequestConfig = {}) =>
    axiosInstance.delete(url, config),
  PATCH: (url: string, data: any, config: AxiosRequestConfig = {}) =>
    axiosInstance.patch(url, data, config),
};

export default ApiHelpers;
