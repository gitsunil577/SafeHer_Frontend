import React, { useState } from 'react';

const AlertNotifications = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      userName: 'Anonymous User',
      timestamp: '2 minutes ago',
      distance: '0.5 km',
      location: 'MG Road, Near Metro Station',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      status: 'pending',
      priority: 'high',
      message: 'Need immediate help!'
    },
    {
      id: 2,
      userName: 'Anonymous User',
      timestamp: '5 minutes ago',
      distance: '1.2 km',
      location: 'Koramangala 5th Block',
      coordinates: { lat: 12.9352, lng: 77.6245 },
      status: 'pending',
      priority: 'medium',
      message: 'Feeling unsafe, need assistance'
    }
  ]);

  const [selectedAlert, setSelectedAlert] = useState(null);

  const acceptAlert = (alertId) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId ? { ...alert, status: 'accepted' } : alert
    ));
    setSelectedAlert(alerts.find(a => a.id === alertId));
  };

  const declineAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const completeAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    setSelectedAlert(null);
  };

  if (selectedAlert) {
    return (
      <div>
        <div style={{ background: '#ffebee', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '15px' }}>
            <h4 style={{ color: '#c62828' }}>🚨 Active Response</h4>
            <span className="badge badge-danger">In Progress</span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p><strong>Location:</strong> {selectedAlert.location}</p>
            <p><strong>Distance:</strong> {selectedAlert.distance}</p>
            <p><strong>Message:</strong> {selectedAlert.message}</p>
          </div>

          {/* Map Placeholder */}
          <div className="map-container" style={{ height: '200px', marginBottom: '15px' }}>
            <div className="map-placeholder">
              <p>🗺️ Navigation to User</p>
              <p style={{ fontSize: '0.875rem' }}>
                Lat: {selectedAlert.coordinates.lat}, Lng: {selectedAlert.coordinates.lng}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-success"
              onClick={() => completeAlert(selectedAlert.id)}
              style={{ flex: 1 }}
            >
              ✓ Mark as Resolved
            </button>
            <button className="btn btn-outline">
              📞 Call User
            </button>
            <button className="btn btn-danger">
              🚔 Call Police
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#666' }}>
          <p>Stay safe and keep the user informed of your arrival.</p>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</p>
        <p>No active alerts in your area.</p>
        <p>You will be notified when someone nearby needs help.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="card volunteer-alert-card"
          style={{ margin: 0, padding: '20px' }}
        >
          <div className="flex-between" style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>🆘</span>
              <div>
                <strong>{alert.userName}</strong>
                <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>{alert.timestamp}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="distance-badge">{alert.distance}</span>
              <p style={{ fontSize: '0.75rem', color: alert.priority === 'high' ? '#c62828' : '#e65100', margin: '5px 0 0' }}>
                {alert.priority === 'high' ? '🔴 High Priority' : '🟡 Medium Priority'}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <span>📍</span> {alert.location}
            </p>
            {alert.message && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>"{alert.message}"</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-success"
              onClick={() => acceptAlert(alert.id)}
              style={{ flex: 1 }}
            >
              Accept & Respond
            </button>
            <button
              className="btn btn-outline"
              onClick={() => declineAlert(alert.id)}
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertNotifications;
