import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AlertNotifications from './AlertNotifications';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [isOnDuty, setIsOnDuty] = useState(true);

  const stats = {
    totalResponses: 24,
    successfulAssists: 22,
    avgResponseTime: '4.2 min',
    rating: 4.8
  };

  const recentActivity = [
    { id: 1, action: 'Responded to SOS', location: 'MG Road', time: '2 hours ago', status: 'resolved' },
    { id: 2, action: 'Alert Declined', location: 'Too far away', time: '5 hours ago', status: 'declined' },
    { id: 3, action: 'Responded to SOS', location: 'Koramangala', time: '1 day ago', status: 'resolved' },
    { id: 4, action: 'Responded to SOS', location: 'BTM Layout', time: '2 days ago', status: 'resolved' }
  ];

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      {/* Header */}
      <div className="card">
        <div className="flex-between">
          <div>
            <h2>Volunteer Dashboard</h2>
            <p style={{ color: '#666' }}>Welcome back, {user?.name || 'Volunteer'}!</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {user?.verified ? (
              <span className="badge badge-success">Verified</span>
            ) : (
              <span className="badge badge-warning">Pending Verification</span>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <span style={{ fontWeight: '500' }}>{isOnDuty ? 'On Duty' : 'Off Duty'}</span>
              <div
                onClick={() => setIsOnDuty(!isOnDuty)}
                style={{
                  width: '50px',
                  height: '26px',
                  background: isOnDuty ? '#4caf50' : '#ccc',
                  borderRadius: '13px',
                  position: 'relative',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: isOnDuty ? '26px' : '2px',
                    transition: 'all 0.3s'
                  }}
                />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-stats" style={{ marginTop: '20px' }}>
        <div className="stat-card">
          <div className="stat-number">{stats.totalResponses}</div>
          <div className="stat-label">Total Responses</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.successfulAssists}</div>
          <div className="stat-label">Successful Assists</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.avgResponseTime}</div>
          <div className="stat-label">Avg Response Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#ff9800' }}>⭐ {stats.rating}</div>
          <div className="stat-label">Rating</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Active Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Alerts Nearby</h3>
          </div>
          {isOnDuty ? (
            <AlertNotifications />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p style={{ fontSize: '3rem', marginBottom: '10px' }}>🔕</p>
              <p>You are currently off duty.</p>
              <p>Toggle on duty to receive alerts.</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <ul className="alert-list">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="alert-item">
                <div className={`alert-icon ${activity.status === 'resolved' ? 'success' : 'warning'}`}>
                  {activity.status === 'resolved' ? '✓' : '✗'}
                </div>
                <div className="alert-content">
                  <div className="alert-title">{activity.action}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>{activity.location}</div>
                  <span className="alert-time">{activity.time}</span>
                </div>
                <span className={`badge badge-${activity.status === 'resolved' ? 'success' : 'warning'}`}>
                  {activity.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Guidelines */}
      <div className="card" style={{ marginTop: '20px', background: '#e3f2fd' }}>
        <h3 style={{ marginBottom: '15px' }}>Volunteer Guidelines</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ marginBottom: '10px' }}>When Responding</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>✅ Respond quickly but safely</li>
              <li style={{ marginBottom: '8px' }}>✅ Keep the user informed of your ETA</li>
              <li style={{ marginBottom: '8px' }}>✅ Contact authorities if needed</li>
              <li>✅ Document the incident after resolution</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '10px' }}>Safety First</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>⚠️ Never put yourself in danger</li>
              <li style={{ marginBottom: '8px' }}>⚠️ Call police for violent situations</li>
              <li style={{ marginBottom: '8px' }}>⚠️ Stay in well-lit public areas</li>
              <li>⚠️ Keep your own location shared</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
