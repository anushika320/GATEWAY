// src/components/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import logo from '../assets/vau-logo.png';

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [fullName, setFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('officer');
  const [message, setMessage] = useState('');
  const [createdCreds, setCreatedCreds] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const loadDashboard = async () => {
    const res = await axios.get('http://localhost:5000/api/users/dashboard', authHeader);
    setData(res.data);
  };

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/');
      return;
    }

    loadDashboard().catch(() => navigate('/'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role, navigate]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setMessage('');
    setCreatedCreds(null);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/users',
        {
          fullName,
          username: newUsername,
          email,
          telephone,
          password: newPassword,
          role: newRole,
        },
        authHeader
      );

      setMessage('User created and credentials emailed successfully.');
      setCreatedCreds(res.data.credentials);

      setFullName('');
      setNewUsername('');
      setEmail('');
      setTelephone('');
      setNewPassword('');
      setNewRole('officer');

      await loadDashboard();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user ${username}?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, authHeader);
      await loadDashboard();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <img src={logo} alt="University of Vavuniya" className="admin-logo-image" />
            <div className="admin-text-block">
              <div className="admin-logo-text">UNIVERSITY OF VAVUNIYA</div>
              <div className="admin-subtitle">Security Admin Dashboard</div>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-summary-card">
          <h2>Overview</h2>
          {data ? (
            <>
              <p>
                Total officers: <strong>{data.totalOfficers}</strong>
              </p>
              <p>
                Total admins (DB): <strong>{data.totalAdmins}</strong>
              </p>
              <p>Manage all security users and their access to the system.</p>
            </>
          ) : (
            <p>Loading dashboard...</p>
          )}
        </section>

        <section className="admin-grid">
          <div className="admin-panel">
            <h3>Current Users</h3>
            {data && data.users && data.users.length > 0 ? (
              <ul className="admin-officer-list">
                {data.users.map((u) => (
                  <li key={u._id} className="admin-officer-item">
                    <span>
                      {u.fullName} ({u.username}) – {u.email} [{u.role}]
                    </span>
                    <button
                      type="button"
                      className="admin-delete-btn"
                      onClick={() => handleDelete(u._id, u.username)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No users found.</p>
            )}
          </div>

          <div className="admin-panel">
            <h3>Add New User</h3>
            <form onSubmit={handleAddUser} className="admin-add-form">
              <div className="admin-form-group">
                <label>Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Telephone</label>
                <input
                  type="text"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="admin-select"
                  required
                >
                  <option value="officer">Security Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="admin-btn-primary">
                Add User
              </button>
            </form>

            {message && <p className="admin-message">{message}</p>}

            {createdCreds && (
              <div className="admin-creds-box">
                <h4>New user credentials</h4>
                <p>Role: <strong>{createdCreds.role}</strong></p>
                <p>Username: <strong>{createdCreds.username}</strong></p>
                <p>Password: <strong>{createdCreds.password}</strong></p>
                <p className="admin-creds-note">
                  These credentials have also been emailed to the user.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;