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

  // gate pass form (period)
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ownerType, setOwnerType] = useState('university');
  const [ownerName, setOwnerName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // records by date
  const [recordDate, setRecordDate] = useState('');
  const [records, setRecords] = useState([]);
  const [recordsMsg, setRecordsMsg] = useState('');

  // active passes for dashboard
  const [activePasses, setActivePasses] = useState([]);

  const [activeSection, setActiveSection] = useState('users');

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

  const loadActivePasses = async () => {
    const res = await axios.get('http://localhost:5000/api/gatepasses/active', authHeader);
    setActivePasses(res.data.passes);
  };

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/');
      return;
    }

    Promise.all([loadDashboard(), loadActivePasses()]).catch(() => navigate('/'));
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

  // Admin: issue gate pass with period
  const handleCreateGatePass = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await axios.post(
        'http://localhost:5000/api/gatepasses',
        {
          vehicleNumber,
          ownerType,
          ownerName,
          purpose,
          validUntil, // YYYY-MM-DD
        },
        authHeader
      );

      setMessage('Gate pass issued successfully.');
      setVehicleNumber('');
      setOwnerType('university');
      setOwnerName('');
      setPurpose('');
      setValidUntil('');

      await loadActivePasses();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to issue gate pass');
    }
  };

  // Admin: check records by date
  const handleCheckRecords = async (e) => {
    e.preventDefault();
    setRecords([]);
    setRecordsMsg('');

    if (!recordDate) {
      setRecordsMsg('Please select a date.');
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/gatepasses/by-date?date=${recordDate}`,
        authHeader
      );
      if (res.data.passes.length === 0) {
        setRecordsMsg('No gate passes found for this date.');
      }
      setRecords(res.data.passes);
    } catch (err) {
      setRecordsMsg(err.response?.data?.message || 'Failed to load records');
    }
  };

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

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
              <p>Manage users and vehicle gate passes for the university.</p>
            </>
          ) : (
            <p>Loading dashboard...</p>
          )}
        </section>

        <div className="admin-section-tabs">
          <button
            type="button"
            className={activeSection === 'users' ? 'admin-tab active' : 'admin-tab'}
            onClick={() => setActiveSection('users')}
          >
            Security Users
          </button>
          <button
            type="button"
            className={activeSection === 'gatepass' ? 'admin-tab active' : 'admin-tab'}
            onClick={() => setActiveSection('gatepass')}
          >
            Issue Gate Pass
          </button>
          <button
            type="button"
            className={activeSection === 'records' ? 'admin-tab active' : 'admin-tab'}
            onClick={() => setActiveSection('records')}
          >
            Check Vehicle Records
          </button>
        </div>

        {/* USERS SECTION */}
        {activeSection === 'users' && (
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

              {message && activeSection === 'users' && (
                <p className="admin-message">{message}</p>
              )}

              {createdCreds && activeSection === 'users' && (
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
        )}

        {/* GATE PASS SECTION */}
        {activeSection === 'gatepass' && (
          <section className="admin-grid">
            <div className="admin-panel">
              <h3>Issue Vehicle Gate Pass</h3>
              <form onSubmit={handleCreateGatePass} className="admin-add-form">
                <div className="admin-form-group">
                  <label>Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Owner Type</label>
                  <select
                    value={ownerType}
                    onChange={(e) => setOwnerType(e.target.value)}
                    className="admin-select"
                  >
                    <option value="university">University</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Owner / Department Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Purpose</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Issue Date</label>
                  <input type="date" value={today} disabled />
                </div>
                <div className="admin-form-group">
                  <label>Valid Until</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="admin-btn-primary">
                  Issue Gate Pass
                </button>
              </form>
              {message && activeSection === 'gatepass' && (
                <p className="admin-message">{message}</p>
              )}
            </div>

            <div className="admin-panel">
              <h3>Active Gate Passes</h3>
              {activePasses.length === 0 ? (
                <p>No active gate passes.</p>
              ) : (
                <ul className="admin-officer-list">
                  {activePasses.map((p) => (
                    <li key={p._id} className="admin-officer-item">
                      <span>
                        {p.vehicleNumber} – {p.ownerName} ({p.ownerType}) – valid until{' '}
                        {new Date(p.validUntil).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* RECORDS SECTION */}
        {activeSection === 'records' && (
          <section className="admin-grid">
            <div className="admin-panel">
              <h3>Check Vehicle Records by Date</h3>
              <form onSubmit={handleCheckRecords} className="admin-add-form">
                <div className="admin-form-group">
                  <label>Select Date (Valid Until)</label>
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="admin-btn-primary">
                  Load Records
                </button>
              </form>
              {recordsMsg && <p className="admin-message">{recordsMsg}</p>}
            </div>

            <div className="admin-panel">
              <h3>Gate Passes for Selected Date</h3>
              {records.length === 0 ? (
                <p>No records to display.</p>
              ) : (
                <ul className="admin-officer-list">
                  {records.map((p) => (
                    <li key={p._id} className="admin-officer-item">
                      <span>
                        {p.vehicleNumber} – {p.ownerName} ({p.ownerType}) – {p.purpose}{' '}
                        (Issued: {new Date(p.issueDate).toLocaleDateString()} – Valid until:{' '}
                        {new Date(p.validUntil).toLocaleDateString()})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;