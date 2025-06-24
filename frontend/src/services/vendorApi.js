import axios from 'axios';

const vendorApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/vendor',
  headers: { 'Content-Type': 'application/json' },
});

vendorApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const createEvent = async (eventData) => {
  const res = await vendorApi.post('/events', eventData);
  return res.data;
};

export const getMyEvents = async () => {
  const res = await vendorApi.get('/events');
  return res.data;
};

export const getVendorEventBookings = async (eventId) => {
  const res = await vendorApi.get(`/events/bookings/${eventId}`);
  return res.data;
};

export const deleteEvent = async (eventId) => {
  const res = await vendorApi.delete(`/events/${eventId}`);
  return res.data;
};