import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import AlertNotifications from './AlertNotifications';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const { isConnected, emit, on, off } = useSocket();
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
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentAlertsLoading, setRecentAlertsLoading] = useState(false);
  const [toastNotifications, setToastNotifications] = useState([]);

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

  // Fetch recent alerts for dashboard
  const fetchRecentAlerts = useCallback(async () => {
    if (!isOnDuty) {
      setRecentAlerts([]);
      return;
    }
    setRecentAlertsLoading(true);
    try {
      const response = await api.getRecentAlerts();
      if (response.success) {
        setRecentAlerts(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching recent alerts:', err);
    } finally {
      setRecentAlertsLoading(false);
    }
  }, [isOnDuty]);

  // Fetch recent alerts when duty status changes
  useEffect(() => {
    fetchRecentAlerts();
  }, [fetchRecentAlerts]);

  // Request browser notification permission when going on duty
  useEffect(() => {
    if (isOnDuty && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isOnDuty]);

  // Show browser notification (works even when tab is in background)
  const showBrowserNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'safeher-alert',
          requireInteraction: true
        });
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (e) {
        // Notification API not available
      }
    }
  }, []);

  // Play urgent notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      // Play two-tone urgent beep
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.value = 0.4;
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      // Beep pattern: high-low-high
      playTone(880, ctx.currentTime, 0.15);
      playTone(660, ctx.currentTime + 0.2, 0.15);
      playTone(880, ctx.currentTime + 0.4, 0.15);
      setTimeout(() => ctx.close(), 1000);
    } catch (e) {
      // Audio not supported
    }
  }, []);

  // Dismiss a toast notification
  const dismissToast = useCallback((toastId) => {
    setToastNotifications(prev => prev.filter(t => t.id !== toastId));
  }, []);

  // Listen for new alerts in real-time and add to recent alerts list + show toast
  useEffect(() => {
    if (!isOnDuty) return;

    const handleNewAlert = (data) => {
      const newAlert = {
        _id: data.alertId,
        userName: data.userName || 'Unknown User',
        type: data.type || 'sos',
        priority: data.priority || 'high',
        status: 'active',
        message: data.message || '',
        location: data.location?.address || 'Location shared',
        coordinates: data.location?.coordinates
          ? { lat: data.location.coordinates[1], lng: data.location.coordinates[0] }
          : null,
        respondingVolunteerName: null,
        createdAt: new Date().toISOString()
      };
      setRecentAlerts(prev => [newAlert, ...prev.filter(a => a._id !== data.alertId)]);

      // Show toast notification
      const toastId = `toast_${data.alertId}_${Date.now()}`;
      const toast = {
        id: toastId,
        alertId: data.alertId,
        userName: data.userName || 'Someone',
        type: data.type || 'sos',
        priority: data.priority || 'high',
        message: data.message || 'Emergency SOS Alert',
        location: data.location?.address || 'Nearby location',
        time: new Date()
      };
      setToastNotifications(prev => [toast, ...prev]);
      playNotificationSound();
      showBrowserNotification(
        'SOS Alert - SafeHer',
        `${toast.userName} needs help! ${toast.message}`
      );

      // Auto-dismiss after 15 seconds
      setTimeout(() => {
        setToastNotifications(prev => prev.filter(t => t.id !== toastId));
      }, 15000);
    };

    const handleAlertCancelled = (data) => {
      setRecentAlerts(prev =>
        prev.map(a => a._id === data.alertId ? { ...a, status: 'cancelled' } : a)
      );
      // Remove toast for cancelled alert
      setToastNotifications(prev => prev.filter(t => t.alertId !== data.alertId));
    };

    on('new_alert', handleNewAlert);
    on('alert_cancelled', handleAlertCancelled);

    return () => {
      off('new_alert', handleNewAlert);
      off('alert_cancelled', handleAlertCancelled);
    };
  }, [isOnDuty, on, off, playNotificationSound, showBrowserNotification]);

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
      {/* Toast Notifications - Fixed at top */}
      {toastNotifications.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '15px',
          gap: '10px',
          pointerEvents: 'none'
        }}>
          {toastNotifications.map((toast, index) => (
            <div
              key={toast.id}
              className="volunteer-toast"
              style={{
                pointerEvents: 'auto',
                width: '100%',
                maxWidth: '500px',
                background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px 20px',
                boxShadow: '0 8px 32px rgba(211, 47, 47, 0.4)',
                animation: 'slideDown 0.4s ease-out',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {/* Toast Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#ff5252',
                    display: 'inline-block',
                    animation: 'alertPulse 0.8s infinite',
                    boxShadow: '0 0 8px rgba(255,82,82,0.8)'
                  }}></span>
                  <span style={{ fontWeight: '700', fontSize: '1rem', letterSpacing: '0.5px' }}>
                    NEW SOS ALERT
                  </span>
                  <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {toast.type}
                  </span>
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: '#fff',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Toast Body */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0
                }}>
                  &#x1F198;
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                    {toast.userName} needs help!
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '2px' }}>
                    {toast.message}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '2px' }}>
                    {toast.location}
                  </div>
                </div>
              </div>

              {/* Toast Action */}
              <div style={{
                fontSize: '0.8rem',
                opacity: 0.8,
                textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.2)',
                paddingTop: '8px',
                marginTop: '4px'
              }}>
                Scroll down to Active Alerts to respond
              </div>
            </div>
          ))}
        </div>
      )}

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

        {/* Recent Alerts (last 24h) */}
        {isOnDuty && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Alerts (Last 24h)</h3>
              <button
                onClick={fetchRecentAlerts}
                style={{
                  background: 'none',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: '#666'
                }}
              >
                Refresh
              </button>
            </div>
            {recentAlertsLoading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                Loading recent alerts...
              </div>
            ) : recentAlerts.length > 0 ? (
              <ul className="alert-list">
                {recentAlerts.map((alert) => (
                  <li key={alert._id} className="alert-item" style={{
                    borderLeft: `4px solid ${
                      alert.status === 'active' ? '#f44336' :
                      alert.status === 'responding' ? '#ff9800' :
                      alert.status === 'resolved' ? '#4caf50' :
                      '#9e9e9e'
                    }`
                  }}>
                    <div className={`alert-icon ${
                      alert.status === 'active' ? 'danger' :
                      alert.status === 'responding' ? 'warning' :
                      alert.status === 'resolved' ? 'success' : ''
                    }`}>
                      {alert.status === 'active' ? '!' :
                       alert.status === 'responding' ? '...' :
                       alert.status === 'resolved' ? '\u2713' : '\u2717'}
                    </div>
                    <div className="alert-content" style={{ flex: 1 }}>
                      <div className="alert-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{alert.userName}</span>
                        <span style={{
                          background: alert.type === 'sos' ? '#ffebee' : '#fff3e0',
                          color: alert.type === 'sos' ? '#c62828' : '#e65100',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {alert.type}
                        </span>
                      </div>
                      {alert.message && (
                        <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '2px' }}>
                          {alert.message}
                        </div>
                      )}
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                        {alert.location}
                      </div>
                      {alert.respondingVolunteerName && (
                        <div style={{ fontSize: '0.8rem', color: '#2e7d32', marginTop: '2px' }}>
                          Responded by: {alert.respondingVolunteerName}
                        </div>
                      )}
                      <span className="alert-time">{getTimeAgo(alert.createdAt)}</span>
                    </div>
                    <span className={`badge badge-${
                      alert.status === 'active' ? 'danger' :
                      alert.status === 'responding' ? 'warning' :
                      alert.status === 'resolved' ? 'success' : 'secondary'
                    }`} style={{
                      background:
                        alert.status === 'active' ? '#f44336' :
                        alert.status === 'responding' ? '#ff9800' :
                        alert.status === 'resolved' ? '#4caf50' :
                        alert.status === 'cancelled' ? '#9e9e9e' : '#666',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {alert.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                <p>No alerts in the last 24 hours.</p>
                <p style={{ fontSize: '0.875rem' }}>New SOS alerts will appear here in real-time.</p>
              </div>
            )}
          </div>
        )}

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

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes alertPulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default VolunteerDashboard;
