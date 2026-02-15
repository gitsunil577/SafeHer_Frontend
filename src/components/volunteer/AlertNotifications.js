import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

const AlertNotifications = ({ onStatsUpdate }) => {
  const { on, off, isConnected } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [newAlertFlash, setNewAlertFlash] = useState(null);

  // Fetch nearby active alerts from API on mount
  const fetchNearbyAlerts = useCallback(async () => {
    try {
      setLoading(true);

      // Try to get volunteer's location for distance calculation
      let url = '/alerts/nearby/active';
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        url += `?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}`;
      } catch (locErr) {
        // Location unavailable, fetch without it (backend will return all active alerts)
      }

      const response = await api.request(url);
      if (response.success) {
        setAlerts(response.data.map(alert => ({
          id: alert._id,
          userName: alert.user?.name || 'Anonymous User',
          timestamp: getTimeAgo(alert.createdAt),
          distance: alert.distance ? `${(alert.distance / 1000).toFixed(1)} km` : 'Nearby',
          location: alert.location?.address || 'Unknown location',
          coordinates: alert.location?.coordinates ? {
            lat: alert.location.coordinates[1],
            lng: alert.location.coordinates[0]
          } : null,
          status: alert.status,
          priority: alert.priority || 'high',
          message: alert.message || 'SOS - Needs help!',
          type: alert.type || 'sos'
        })));
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNearbyAlerts();
  }, [fetchNearbyAlerts]);

  // Re-fetch alerts when socket reconnects (handles missed alerts during disconnect)
  useEffect(() => {
    if (isConnected) {
      fetchNearbyAlerts();
    }
  }, [isConnected, fetchNearbyAlerts]);

  // Listen for real-time new alerts via Socket.IO
  useEffect(() => {
    const handleNewAlert = (data) => {
      console.log('New alert received:', data);

      // Distance from backend is in meters - convert to km for display
      const distanceMeters = data.distance;
      const distanceDisplay = distanceMeters
        ? `${(distanceMeters / 1000).toFixed(1)} km`
        : 'Nearby';

      const newAlert = {
        id: data.alertId,
        userName: data.userName || 'Anonymous User',
        timestamp: 'Just now',
        distance: distanceDisplay,
        location: data.location?.address || 'Unknown location',
        coordinates: data.location?.coordinates ? {
          lat: data.location.coordinates[1],
          lng: data.location.coordinates[0]
        } : null,
        status: 'pending',
        priority: data.priority || 'high',
        message: data.message || 'SOS - Needs help!',
        type: data.type || 'sos'
      };

      setAlerts(prev => {
        // Don't add duplicate
        if (prev.find(a => a.id === newAlert.id)) return prev;
        return [newAlert, ...prev];
      });

      // Flash effect for new alert
      setNewAlertFlash(newAlert.id);
      setTimeout(() => setNewAlertFlash(null), 3000);

      // Play notification sound
      playAlertSound();
    };

    const handleAlertCancelled = (data) => {
      console.log('Alert cancelled:', data);
      setAlerts(prev => prev.filter(a => a.id !== data.alertId));
      if (selectedAlert?.id === data.alertId) {
        setSelectedAlert(null);
      }
    };

    on('new_alert', handleNewAlert);
    on('alert_cancelled', handleAlertCancelled);

    return () => {
      off('new_alert', handleNewAlert);
      off('alert_cancelled', handleAlertCancelled);
    };
  }, [on, off, selectedAlert]);

  // Listen for live location updates when responding to an alert
  useEffect(() => {
    if (!selectedAlert) return;

    const handleLocationUpdate = (data) => {
      setLiveLocation({
        lat: data.latitude,
        lng: data.longitude,
        timestamp: data.timestamp
      });
    };

    const eventName = `alert_${selectedAlert.id}_location`;
    on(eventName, handleLocationUpdate);

    return () => {
      off(eventName, handleLocationUpdate);
    };
  }, [selectedAlert, on, off]);

  const playAlertSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 300);
    } catch (e) {
      // Audio not supported or blocked
    }
  };

  const acceptAlert = async (alertId) => {
    setActionLoading(alertId);
    try {
      const response = await api.request(`/alerts/${alertId}/accept`, { method: 'PUT' });
      if (response.success) {
        const accepted = alerts.find(a => a.id === alertId);
        setAlerts(prev => prev.map(a =>
          a.id === alertId ? { ...a, status: 'responding' } : a
        ));
        setSelectedAlert({ ...accepted, status: 'responding' });
        if (onStatsUpdate) onStatsUpdate();
      }
    } catch (err) {
      console.error('Error accepting alert:', err);
      alert('Failed to accept alert: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const declineAlert = async (alertId) => {
    setActionLoading(alertId);
    try {
      const response = await api.request(`/alerts/${alertId}/decline`, { method: 'PUT' });
      if (response.success) {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      }
    } catch (err) {
      console.error('Error declining alert:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const resolveAlert = async (alertId) => {
    setActionLoading('resolve');
    try {
      const response = await api.resolveAlert(alertId, {
        notes: 'Resolved by volunteer'
      });
      if (response.success) {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        setSelectedAlert(null);
        setLiveLocation(null);
        if (onStatsUpdate) onStatsUpdate();
      }
    } catch (err) {
      console.error('Error resolving alert:', err);
      alert('Failed to resolve: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
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
    return `${Math.floor(hours / 24)} day(s) ago`;
  };

  // Active response view
  if (selectedAlert) {
    const displayLocation = liveLocation || selectedAlert.coordinates;

    return (
      <div>
        <div style={{
          background: '#ffebee',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div className="flex-between" style={{ marginBottom: '15px' }}>
            <h4 style={{ color: '#c62828' }}>Active Response</h4>
            <span className="badge badge-danger">In Progress</span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p><strong>Location:</strong> {selectedAlert.location}</p>
            <p><strong>Distance:</strong> {selectedAlert.distance}</p>
            <p><strong>Message:</strong> {selectedAlert.message}</p>
            <p><strong>Type:</strong> {selectedAlert.type?.toUpperCase()}</p>
          </div>

          {/* Live Location Display */}
          {displayLocation && (
            <div style={{
              background: '#fff',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px',
              border: liveLocation ? '2px solid #4caf50' : '1px solid #ddd'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {liveLocation && (
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#4caf50', display: 'inline-block',
                    animation: 'pulse 1.5s infinite'
                  }}></span>
                )}
                <strong style={{ color: liveLocation ? '#2e7d32' : '#666' }}>
                  {liveLocation ? 'Live Location Tracking' : 'Last Known Location'}
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
                Lat: {displayLocation.lat?.toFixed(6)}, Lng: {displayLocation.lng?.toFixed(6)}
              </p>
              {liveLocation?.timestamp && (
                <p style={{ margin: '5px 0 0', fontSize: '0.75rem', color: '#999' }}>
                  Updated: {new Date(liveLocation.timestamp).toLocaleTimeString()}
                </p>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${displayLocation.lat},${displayLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary"
                style={{ marginTop: '10px', display: 'inline-block', textDecoration: 'none' }}
              >
                Open in Google Maps
              </a>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-success"
              onClick={() => resolveAlert(selectedAlert.id)}
              disabled={actionLoading === 'resolve'}
              style={{ flex: 1, opacity: actionLoading === 'resolve' ? 0.6 : 1 }}
            >
              {actionLoading === 'resolve' ? 'Resolving...' : 'Mark as Resolved'}
            </button>
            <a href="tel:100" className="btn btn-danger" style={{ textDecoration: 'none' }}>
              Call Police
            </a>
          </div>
        </div>

        <button
          className="btn btn-outline"
          onClick={() => { setSelectedAlert(null); setLiveLocation(null); }}
          style={{ width: '100%' }}
        >
          Back to Alerts List
        </button>

        <div style={{ textAlign: 'center', color: '#666', marginTop: '15px' }}>
          <p>Stay safe and keep the user informed of your arrival.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>Loading nearby alerts...</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p style={{ fontSize: '3rem', marginBottom: '10px' }}>&#x2705;</p>
        <p>No active alerts in your area.</p>
        <p style={{ fontSize: '0.875rem' }}>
          {isConnected
            ? 'You will be notified instantly when someone nearby needs help.'
            : 'Reconnecting to live alerts...'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="card volunteer-alert-card"
          style={{
            margin: 0,
            padding: '20px',
            animation: newAlertFlash === alert.id ? 'flashNew 0.5s ease 3' : 'none',
            border: newAlertFlash === alert.id ? '2px solid #f44336' : undefined
          }}
        >
          <div className="flex-between" style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>&#x1F198;</span>
              <div>
                <strong>{alert.userName}</strong>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>{alert.timestamp}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="distance-badge">{alert.distance}</span>
              <p style={{
                fontSize: '0.75rem',
                color: alert.priority === 'high' || alert.priority === 'critical' ? '#c62828' : '#e65100',
                margin: '5px 0 0'
              }}>
                {alert.priority === 'critical' ? 'CRITICAL' :
                 alert.priority === 'high' ? 'High Priority' : 'Medium Priority'}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <span>&#x1F4CD;</span> {alert.location}
            </p>
            {alert.message && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>"{alert.message}"</p>
            )}
            {alert.type && alert.type !== 'sos' && (
              <span style={{
                background: '#fff3e0',
                color: '#e65100',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {alert.type.toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-success"
              onClick={() => acceptAlert(alert.id)}
              disabled={actionLoading === alert.id}
              style={{ flex: 1, opacity: actionLoading === alert.id ? 0.6 : 1 }}
            >
              {actionLoading === alert.id ? 'Accepting...' : 'Accept & Respond'}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => declineAlert(alert.id)}
              disabled={actionLoading === alert.id}
            >
              Decline
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes flashNew {
          0% { background: #fff; }
          50% { background: #ffebee; }
          100% { background: #fff; }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AlertNotifications;
