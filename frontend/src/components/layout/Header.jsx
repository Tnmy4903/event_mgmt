import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Header.css';

const Header = ({ user, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home after logout
  };

  return (
    <header>
      <h1>Event Management System</h1>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          {!user ? (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/profile" className="header-link">Manage Profile</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'blue' }}>Logout</button></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
