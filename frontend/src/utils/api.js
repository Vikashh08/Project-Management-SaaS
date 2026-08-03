import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // During dev. Use relative for prod if served together
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
