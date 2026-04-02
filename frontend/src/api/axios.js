import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost';

const API = axios.create({
  baseURL: isLocalhost 
    ? 'http://localhost:5000/api' 
    : 'https://week03-hackathon.vercel.app/api', 
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;