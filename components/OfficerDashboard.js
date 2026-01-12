// src/components/OfficerDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/OfficerDashboard.css';
import logo from '../assets/vau-logo.png';

function OfficerDashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!token || role !== 'officer') {
      navigate('/');
      return;
    }

    axios
      .get('http://localhost:5000/api/users/officer/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch(() => navigate('/'));
  }, [token, role, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="officer-page">
      <header className="officer-header">
        <div className="officer-header-inner">
          <div className="officer-brand">
            <img src={logo} alt="University of Vavuniya" className="officer-logo-image" />
            <div className="officer-text-block">
              <div className="officer-logo-text">UNIVERSITY OF VAVUNIYA</div>
              <div className="officer-subtitle">Security Officer Dashboard</div>
            </div>
          </div>
          <button className="officer-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="officer-main">
        <section className="officer-welcome-card">
          <h2>Welcome</h2>
          {data ? (
            <>
              <p>
                Logged in as: <strong>{data.user}</strong>
              </p>
              <p>{data.message}</p>
            </>
          ) : (
            <p>Loading your dashboard...</p>
          )}
        </section>

        <section className="officer-grid">
          <div className="officer-panel">
            <h3>Today&apos;s Summary</h3>
            <p>This is dummy content. Later you can show:</p>
            <ul className="officer-list">
              <li>Number of gate passes approved today.</li>
              <li>Number of visitors currently inside.</li>
              <li>Recent gate pass requests handled by you.</li>
            </ul>
          </div>

          <div className="officer-panel">
            <h3>Quick Actions</h3>
            <ul className="officer-list">
              <li>Register visitor entry.</li>
              <li>Approve or reject gate pass.</li>
              <li>View recent passes assigned to you.</li>
            </ul>
            <p className="officer-note">
              These are placeholders; connect them to real pages later.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default OfficerDashboard;