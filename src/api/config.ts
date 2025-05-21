import axios from 'axios';

// API Gateway configuration
const API_GATEWAY_URL = 'http://localhost:8760';
const API_PREFIX = '/api';

// Create axios instance with custom config
const api = axios.create({
  baseURL: API_GATEWAY_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token to request if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // // Add user role and id headers for announcements
    // if (config.url?.includes('/announcements')) {
    //   const user = JSON.parse(localStorage.getItem('user') || '{}');
    //   if (user.role) {
    //     config.headers['X-User-Role'] = user.role;
    //   }
    //   if (user.id) {
    //     config.headers['X-User-Id'] = user.id;
    //   }
    //   if (user.departmentCode) {
    //     config.headers['X-User-Department'] = user.departmentCode;
    //   }
    // }

    // Add API prefix to all requests
    if (config.url && !config.url.startsWith(API_PREFIX)) {
      config.url = `${API_PREFIX}${config.url}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors here
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 404:
          // Handle not found
          console.error('Resource not found');
          break;
        default:
          console.error('An error occurred:', error.response.data);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 