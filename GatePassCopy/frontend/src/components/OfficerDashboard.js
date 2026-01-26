import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/OfficerDashboard.css';
import logo from '../assets/vau-logo.png';

function OfficerDashboard() {
  const [data, setData] = useState(null);          // basic dashboard text
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [entryMsg, setEntryMsg] = useState('');
  const [todayPasses, setTodayPasses] = useState([]);
  const [todayMsg, setTodayMsg] = useState('');

  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const loadToday = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/gatepasses/today', authHeader);
      setTodayPasses(res.data.passes);
      if (res.data.passes.length === 0) {
        setTodayMsg('No vehicle entries recorded yet for today.');
      } else {
        setTodayMsg('');
      }
    } catch (err) {
      setTodayMsg(err.response?.data?.message || 'Failed to load today entries');
    }
  };

  useEffect(() => {
    if (!token || role !== 'officer') {
      navigate('/');
      return;
    }

    axios
      .get('http://localhost:5000/api/users/officer/dashboard', authHeader)
      .then((res) => setData(res.data))
      .catch(() => navigate('/'));

    loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleRecordEntry = async (e) => {
    e.preventDefault();
    setEntryMsg('');

    try {
      await axios.post(
        'http://localhost:5000/api/gatepasses/entries',
        { vehicleNumber },
        authHeader
      );
      setEntryMsg('Vehicle entry recorded successfully.');
      setVehicleNumber('');
      await loadToday();
    } catch (err) {
      setEntryMsg(err.response?.data?.message || 'Failed to record entry');
    }
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
            <h3>Record Vehicle Entry</h3>
            <p>Enter the vehicle number of a vehicle with a valid gate pass for today.</p>
            <form onSubmit={handleRecordEntry} className="officer-entry-form">
              <div className="officer-form-group">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="officer-entry-btn">
                Log Entry
              </button>
            </form>
            {entryMsg && <p className="officer-message">{entryMsg}</p>}
          </div>

          <div className="officer-panel">
            <h3>Today&apos;s Vehicle Entries</h3>
            {todayMsg && <p className="officer-note">{todayMsg}</p>}
            {!todayMsg && todayPasses.length === 0 && (
              <p className="officer-note">No entries yet.</p>
            )}
            {todayPasses.length > 0 && (
              <ul className="officer-list">
                {todayPasses.map((p) => (
                  <li key={p._id}>
                    {p.vehicleNumber} – {p.ownerName} ({p.ownerType}) –{' '}
                    {p.entries.length} entry/entries today.
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default OfficerDashboard;