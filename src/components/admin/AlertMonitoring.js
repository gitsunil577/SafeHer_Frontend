import React, { useState } from 'react';

const AlertMonitoring = () => {
  const [alerts] = useState([
    { id: 1, userId: 'U1234', userName: 'Priya S.', location: 'MG Road, Bangalore', coordinates: { lat: 12.9716, lng: 77.5946 }, status: 'active', priority: 'high', time: '2 min ago', volunteer: null },
    { id: 2, userId: 'U1189', userName: 'Anjali G.', location: 'Koramangala 5th Block', coordinates: { lat: 12.9352, lng: 77.6245 }, status: 'responding', priority: 'high', time: '5 min ago', volunteer: 'John D.' },
    { id: 3, userId: 'U1156', userName: 'Meera P.', location: 'BTM Layout', coordinates: { lat: 12.9165, lng: 77.6101 }, status: 'resolved', priority: 'medium', time: '15 min ago', volunteer: 'Sarah S.' },
    { id: 4, userId: 'U1098', userName: 'Kavya R.', location: 'Indiranagar', coordinates: { lat: 12.9784, lng: 77.6408 }, status: 'resolved', priority: 'high', time: '1 hour ago', volunteer: 'Mike J.' },
    { id: 5, userId: 'U1045', userName: 'Divya S.', location: 'Whitefield', coordinates: { lat: 12.9698, lng: 77.7500 }, status: 'cancelled', priority: 'low', time: '2 hours ago', volunteer: null }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const filteredAlerts = alerts.filter(alert =>
    filterStatus === 'all' || alert.status === filterStatus
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'danger';
      case 'responding': return 'warning';
      case 'resolved': return 'success';
      case 'cancelled': return 'info';
      default: return 'info';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#666';
    }
  };

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const respondingCount = alerts.filter(a => a.status === 'responding').length;

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      {/* Header with Stats */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <div>
            <h2>Alert Monitoring</h2>
            <p style={{ color: '#666' }}>Real-time emergency alert monitoring</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeCount > 0 && (
              <span className="badge badge-danger" style={{ fontSize: '1rem', padding: '10px 20px' }}>
                🚨 {activeCount} Active
              </span>
            )}
            {respondingCount > 0 && (
              <span className="badge badge-warning" style={{ fontSize: '1rem', padding: '10px 20px' }}>
                🚶 {respondingCount} Responding
              </span>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'active', 'responding', 'resolved', 'cancelled'].map((status) => (
            <button
              key={status}
              className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span style={{ marginLeft: '5px' }}>
                  ({alerts.filter(a => a.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedAlert ? '1fr 400px' : '1fr', gap: '20px', marginTop: '20px' }}>
        {/* Alerts List */}
        <div className="card" style={{ margin: 0 }}>
          <h3 style={{ marginBottom: '20px' }}>Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                style={{
                  padding: '20px',
                  background: selectedAlert?.id === alert.id ? '#f3e5f5' : '#f8f9fa',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${getPriorityColor(alert.priority)}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div className="flex-between" style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {alert.status === 'active' ? '🆘' : alert.status === 'responding' ? '🚶' : '✅'}
                    </span>
                    <div>
                      <strong>{alert.userName}</strong>
                      <span style={{ color: '#666', marginLeft: '10px' }}>#{alert.userId}</span>
                    </div>
                  </div>
                  <span className={`badge badge-${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0' }}>
                    <span>📍</span> {alert.location}
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0', color: '#666', fontSize: '0.875rem' }}>
                    <span>🕒</span> {alert.time}
                  </p>
                </div>

                {alert.volunteer && (
                  <p style={{ color: '#4caf50', fontSize: '0.875rem' }}>
                    👤 Volunteer: {alert.volunteer}
                  </p>
                )}

                {alert.status === 'active' && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button className="btn btn-sm btn-secondary">Assign Volunteer</button>
                    <button className="btn btn-sm btn-danger">Escalate</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredAlerts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</p>
              <p>No alerts matching the selected filter.</p>
            </div>
          )}
        </div>

        {/* Alert Details Panel */}
        {selectedAlert && (
          <div className="card" style={{ margin: 0, position: 'sticky', top: '80px', alignSelf: 'start' }}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h3>Alert Details</h3>
              <button
                className="modal-close"
                onClick={() => setSelectedAlert(null)}
              >
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div className="flex-between" style={{ marginBottom: '10px' }}>
                <strong>{selectedAlert.userName}</strong>
                <span className={`badge badge-${getStatusColor(selectedAlert.status)}`}>
                  {selectedAlert.status}
                </span>
              </div>
              <p style={{ color: '#666' }}>User ID: {selectedAlert.userId}</p>
            </div>

            {/* Map Placeholder */}
            <div className="map-container" style={{ height: '200px', marginBottom: '20px' }}>
              <div className="map-placeholder">
                <p>🗺️ Live Location</p>
                <p style={{ fontSize: '0.75rem' }}>
                  {selectedAlert.coordinates.lat}, {selectedAlert.coordinates.lng}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Location</span>
                <strong>{selectedAlert.location}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Priority</span>
                <span style={{ color: getPriorityColor(selectedAlert.priority), fontWeight: 'bold' }}>
                  {selectedAlert.priority.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Time</span>
                <strong>{selectedAlert.time}</strong>
              </div>
              {selectedAlert.volunteer && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#e8f5e9', borderRadius: '8px' }}>
                  <span>Volunteer</span>
                  <strong>{selectedAlert.volunteer}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedAlert.status === 'active' && (
                <>
                  <button className="btn btn-secondary">Assign Nearest Volunteer</button>
                  <button className="btn btn-danger">Escalate to Authorities</button>
                </>
              )}
              <button className="btn btn-outline">Contact User</button>
              <button className="btn btn-outline">View User Profile</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertMonitoring;
