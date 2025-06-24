import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';
import AdminDashboard from './components/dashboard/AdminDashboard';
import VendorDashboard from './components/dashboard/VendorDashboard';
import UserDashboard from './components/dashboard/UserDashboard';
import ViewBookings from './components/vendor/ViewBookings';
import BookingPage from './components/user/BookingPage';
import Header from './components/layout/Header';
import ProfilePage from './components/shared/ProfilePage';
import Home from './components/shared/Home';
import ValidateTicket from './components/vendor/ValidateTicket';

import './styles/App.css';
import './styles/Form.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('user_id');

    if (token && role && userId) {
      setUser({ token, role, user_id: userId });
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('user_id', userData.user_id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_id');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Router>
      <div className="App">
        <Header user={user} logout={logout} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" replace /> : <LoginForm setUser={handleLoginSuccess} />}
            />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/dashboard"
              element={
                user ? (
                  user.role === 'admin' ? (
                    <AdminDashboard />
                  ) : user.role === 'vendor' ? (
                    <VendorDashboard />
                  ) : (
                    <UserDashboard />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/vendor/bookings/:eventId"
              element={
                user && user.role === 'vendor' ? <ViewBookings /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/vendor/validate/:ticketId"
              element={
                user && user.role === 'vendor' ? <ValidateTicket /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/book/:eventId"
              element={user ? <BookingPage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/profile"
              element={user ? <ProfilePage /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

