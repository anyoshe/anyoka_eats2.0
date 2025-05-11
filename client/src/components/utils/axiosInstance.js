import axios from 'axios';
import config from '../../config';

const axiosInstance = axios.create({
  baseURL: `${config.backendUrl}`,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('driverToken'); // Retrieve the token from localStorage
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;