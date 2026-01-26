// src/components/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import logo from '../assets/vau-logo.png';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/users/login', {
        username,
        password,
      });

      const { token, role } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'officer') {
        navigate('/officer');
      } else {
        setError('Unknown role');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-header-inner">
          <div className="login-brand">
            <img src={logo} alt="University of Vavuniya" className="login-logo-image" />
            <div className="login-text-block">
              <div className="login-logo-text">UNIVERSITY OF VAVUNIYA</div>
              <div className="login-subtitle">
                Security Gate Pass Management System
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="login-wrapper">
        <div className="login-card">
          <h2 className="login-title">Security Login</h2>
          <p className="login-desc">
            Please sign in using your security admin or officer credentials.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="login-form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="login-error-msg">{error}</div>}

            <button type="submit" className="login-btn-primary">
              Login
            </button>
          </form>

          <div className="login-footer-text">
            Only security staff are authorized to use this system.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;