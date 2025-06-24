import axios from 'axios';

const commonApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/common',
  headers: { 'Content-Type': 'application/json' },
});

commonApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getProfile = async () => {
  const res = await commonApi.get('/me');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await commonApi.post('/me/update', data);
  return res.data;
};

export const updatePassword = async (payload) => {
  const res = await commonApi.post('/me/password', payload);
  return res.data;
};