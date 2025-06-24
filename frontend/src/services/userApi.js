import axios from 'axios';

const userApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/customer',
  headers: { 'Content-Type': 'application/json' },
});

userApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getApprovedEvents = async () => {
  const res = await userApi.get('/events');
  return res.data;
};

export const bookEventWithDetails = async (payload) => {
  const res = await userApi.post('/events/book', payload);
  return res.data;
};

export const getMyBookings = async () => {
  const res = await userApi.get('/bookings');
  return res.data;
};
