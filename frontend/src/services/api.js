import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/auth',
  headers: { 'Content-Type': 'application/json' },
});

export const registerUser = async (email, password, role) => {
  try {
    const response = await api.post('/register', { email, password, role });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    localStorage.setItem('token', response.data.token); // Save the token 
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
