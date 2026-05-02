import axios from 'axios';

// For Android emulator, 10.0.2.2 maps to host machine's localhost
// For physical device, use your machine's local IP address
const API_URL = 'http://10.0.2.2:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  config => {
    if (__DEV__) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server responded with error status
      const message =
        error.response.data?.error ||
        error.response.data?.errors?.[0]?.msg ||
        'Error del servidor';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(
        new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
      );
    }
    return Promise.reject(error);
  }
);
