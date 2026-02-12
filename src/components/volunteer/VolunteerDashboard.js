import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import AlertNotifications from './AlertNotifications';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const { isConnected, emit } = useSocket();
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [dutyLoading, setDutyLoading] = useState(false);
  const [stats, setStats] = useState({
    totalResponses: 0,
    successfulAssists: 0,
    avgResponseTime: 0,
    rating: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [locationWatchId, setLocationWatchId] = useState(null);

  // Fetch real dashboard data from API
  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.getVolunteerDashboard();
      if (response.success) {
        const { volunteer, stats: apiStats, recentHistory, activeAlerts: alerts } = response.data;
        setIsVerified(volunteer.isVerified);
        setIsOnDuty(volunteer.isOnDuty);
        setStats({
          totalResponses: apiStats.totalResponses || 0,
          successfulAssists: apiStats.successfulAssists || 0,
          avgResponseTime: apiStats.avgResponseTime
            ? `${(apiStats.avgResponseTime / 60).toFixed(1)} min`
            : '0 min',
          rating: apiStats.rating || 0
        });
        setActiveAlerts(alerts || 0);

        // Format recent history
        const formatted = (recentHistory || []).map((entry, idx) => ({
          id: entry._id || idx,
          action: entry.action === 'accepted' ? 'Responded to SOS' :
                  entry.action === 'declined' ? 'Alert Declined' :
                  entry.action || 'Response',
          location: entry.alert?.location?.address || 'Unknown location',
          time: getTimeAgo(entry.timestamp),
          status: entry.action === 'accepted' ? 'resolved' :
                  entry.action === 'declined' ? 'declined' : 'resolved'
        }));
        setRecentActivity(formatted);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Start/stop location tracking when duty changes
  useEffect(() => {
    if (isOnDuty && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Update location via API
          api.updateVolunteerLocation({ latitude, longitude }).catch(() => {});
          // Also broadcast via socket for real-time map updates
          emit('volunteer_location_update', {
            volunteerId: user?._id || user?.id,
            latitude,
            longitude
          });
        },
        (err) => console.error('Location error:', err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      setLocationWatchId(watchId);
    } else if (locationWatchId) {
      navigator.geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
    }

    return () => {
      if (locationWatchId) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnDuty]);

  // Toggle duty via real API
  const handleDutyToggle = async () => {
    setDutyLoading(true);
    try {
      const response = await api.toggleVolunteerDuty();
      if (response.success) {
        setIsOnDuty(response.data.isOnDuty);
        // Broadcast status change via socket
        emit('volunteer_status', {
          volunteerId: user?._id || user?.id,
          volunteerName: user?.name,
          isOnDuty: response.data.isOnDuty
        });
      }
    } catch (err) {
      console.error('Error toggling duty:', err);
    } finally {
      setDutyLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (dashboardLoading) {
    return (
      <div className="container" style={{ padding: '20px 0', textAlign: 'center' }}>
        <div className="card" style={{ padding: '60px 20px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '15px' }}>Loading Dashboard...</div>
          <p style={{ color: '#666' }}>Fetching your volunteer data</p>
        </div>
      </div>
    );
  }

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
            {/* Live Connection Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '12px',
              background: isConnected ? '#e8f5e9' : '#ffebee',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isConnected ? '#4caf50' : '#f44336',
                display: 'inline-block',
                animation: isConnected ? 'pulse 2s infinite' : 'none'
              }}></span>
              <span style={{ color: isConnected ? '#2e7d32' : '#c62828' }}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>

            {isVerified ? (
              <span className="badge badge-success">Verified</span>
            ) : (
              <span className="badge badge-warning">Pending Verification</span>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <span style={{ fontWeight: '500' }}>
                {dutyLoading ? 'Switching...' : (isOnDuty ? 'On Duty' : 'Off Duty')}
              </span>
              <div
                onClick={dutyLoading ? undefined : handleDutyToggle}
                style={{
                  width: '50px',
                  height: '26px',
                  background: isOnDuty ? '#4caf50' : '#ccc',
                  borderRadius: '13px',
                  position: 'relative',
                  transition: 'all 0.3s',
                  cursor: dutyLoading ? 'wait' : 'pointer',
                  opacity: dutyLoading ? 0.6 : 1
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
          <div className="stat-number" style={{ color: '#ff9800' }}>
            {stats.rating > 0 ? `${stats.rating.toFixed(1)}` : '-'}
          </div>
          <div className="stat-label">Rating</div>
        </div>
      </div>

      {/* Active Alerts Count Banner */}
      {activeAlerts > 0 && (
        <div className="card" style={{
          marginTop: '20px',
          background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
          border: '2px solid #ff9800'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>&#x1F6A8;</span>
            <div>
              <strong style={{ color: '#e65100' }}>You have {activeAlerts} active response{activeAlerts > 1 ? 's' : ''}</strong>
              <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>Check the alerts section below</p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid" style={{ marginTop: '20px' }}>
        {/* Active Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Alerts Nearby</h3>
            {isConnected && isOnDuty && (
              <span style={{
                fontSize: '0.75rem',
                color: '#4caf50',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#4caf50', display: 'inline-block',
                  animation: 'pulse 2s infinite'
                }}></span>
                Listening for alerts
              </span>
            )}
          </div>
          {isOnDuty ? (
            <AlertNotifications onStatsUpdate={fetchDashboard} />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p style={{ fontSize: '3rem', marginBottom: '10px' }}>&#x1F515;</p>
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
          {recentActivity.length > 0 ? (
            <ul className="alert-list">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="alert-item">
                  <div className={`alert-icon ${activity.status === 'resolved' ? 'success' : 'warning'}`}>
                    {activity.status === 'resolved' ? '\u2713' : '\u2717'}
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
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
              <p>No recent activity yet.</p>
              <p style={{ fontSize: '0.875rem' }}>Your response history will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Guidelines */}
      <div className="card" style={{ marginTop: '20px', background: '#e3f2fd' }}>
        <h3 style={{ marginBottom: '15px' }}>Volunteer Guidelines</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ marginBottom: '10px' }}>When Responding</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>Respond quickly but safely</li>
              <li style={{ marginBottom: '8px' }}>Keep the user informed of your ETA</li>
              <li style={{ marginBottom: '8px' }}>Contact authorities if needed</li>
              <li>Document the incident after resolution</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '10px' }}>Safety First</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}>Never put yourself in danger</li>
              <li style={{ marginBottom: '8px' }}>Call police for violent situations</li>
              <li style={{ marginBottom: '8px' }}>Stay in well-lit public areas</li>
              <li>Keep your own location shared</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VolunteerDashboard;
