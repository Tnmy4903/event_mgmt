import axios from 'axios';

const adminApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/admin',
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchAllUsers = async () => {
  const res = await adminApi.get('/users');
  return res.data;
};

export const approveEvent = async (eventId) => {
  const res = await adminApi.put(`/events/${eventId}`);
  return res.data;
};

export const deleteEvent = async (eventId) => {
  const res = await adminApi.delete(`/events/${eventId}`);
  return res.data;
};

export const getPendingEvents = async () => {
  const res = await adminApi.get('/events');
  return res.data;
};
