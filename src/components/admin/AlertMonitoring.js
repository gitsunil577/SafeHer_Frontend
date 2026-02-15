import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';

const getTimeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const AlertMonitoring = () => {
  const [alerts, setAlerts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCount, setActiveCount] = useState(0);
  const [respondingCount, setRespondingCount] = useState(0);
  const refreshRef = useRef(null);

  const fetchAlerts = useCallback(async (currentPage, status) => {
    try {
      setError(null);
      const response = await api.getAdminAlerts(currentPage, 20, status);
      setAlerts(response.data || []);
      setTotalPages(response.pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load alerts');
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const [activeRes, respondingRes] = await Promise.all([
        api.getAdminAlerts(1, 1, 'active'),
        api.getAdminAlerts(1, 1, 'responding')
      ]);
      setActiveCount(activeRes.total || 0);
      setRespondingCount(respondingRes.total || 0);
    } catch (err) {
      console.error('Failed to fetch counts:', err);
    }
  }, []);

  const loadData = useCallback(async (currentPage, status) => {
    setLoading(true);
    await Promise.all([fetchAlerts(currentPage, status), fetchCounts()]);
    setLoading(false);
  }, [fetchAlerts, fetchCounts]);

  useEffect(() => {
    loadData(page, filterStatus);
  }, [page, filterStatus, loadData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    refreshRef.current = setInterval(() => {
      fetchAlerts(page, filterStatus);
      fetchCounts();
    }, 30000);
    return () => clearInterval(refreshRef.current);
  }, [page, filterStatus, fetchAlerts, fetchCounts]);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'danger';
      case 'responding': return 'warning';
      case 'resolved': return 'success';
      case 'cancelled': return 'info';
      default: return 'info';
    }
  };

  if (error && alerts.length === 0) {
    return (
      <div className="container" style={{ padding: '20px 0' }}>
        <div className="card" style={{ background: '#ffebee', textAlign: 'center' }}>
          <p style={{ color: '#c62828' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => loadData(1, 'all')}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      {/* Header with Stats */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <div>
            <h2>Alert Monitoring</h2>
            <p style={{ color: '#666' }}>Real-time emergency alert monitoring (auto-refreshes every 30s)</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeCount > 0 && (
              <span className="badge badge-danger" style={{ fontSize: '1rem', padding: '10px 20px' }}>
                {activeCount} Active
              </span>
            )}
            {respondingCount > 0 && (
              <span className="badge badge-warning" style={{ fontSize: '1rem', padding: '10px 20px' }}>
                {respondingCount} Responding
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
              onClick={() => handleFilterChange(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Loading alerts...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedAlert ? '1fr 400px' : '1fr', gap: '20px', marginTop: '20px' }}>
          {/* Alerts List */}
          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ marginBottom: '20px' }}>Alerts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  onClick={() => setSelectedAlert(alert)}
                  style={{
                    padding: '20px',
                    background: selectedAlert?._id === alert._id ? '#f3e5f5' : '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${
                      alert.status === 'active' ? '#f44336' :
                      alert.status === 'responding' ? '#ff9800' :
                      alert.status === 'resolved' ? '#4caf50' : '#666'
                    }`,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div className="flex-between" style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div>
                        <strong>{alert.user?.name || 'Unknown User'}</strong>
                      </div>
                    </div>
                    <span className={`badge badge-${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0' }}>
                      <span>Location:</span> {alert.location?.address || 'Unknown location'}
                    </p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0', color: '#666', fontSize: '0.875rem' }}>
                      <span>Time:</span> {getTimeAgo(alert.createdAt)}
                    </p>
                  </div>

                  {alert.respondingVolunteer?.volunteer?.user?.name && (
                    <p style={{ color: '#4caf50', fontSize: '0.875rem' }}>
                      Volunteer: {alert.respondingVolunteer.volunteer.user.name}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {alerts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No alerts matching the selected filter.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <button
                  className="btn btn-sm btn-outline"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-sm btn-outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
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
                  <strong>{selectedAlert.user?.name || 'Unknown'}</strong>
                  <span className={`badge badge-${getStatusColor(selectedAlert.status)}`}>
                    {selectedAlert.status}
                  </span>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="map-container" style={{ height: '200px', marginBottom: '20px' }}>
                <div className="map-placeholder">
                  <p>Live Location</p>
                  <p style={{ fontSize: '0.75rem' }}>
                    {selectedAlert.location?.coordinates?.[1]?.toFixed(4)}, {selectedAlert.location?.coordinates?.[0]?.toFixed(4)}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <span>Location</span>
                  <strong>{selectedAlert.location?.address || 'Unknown'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <span>Type</span>
                  <strong>{selectedAlert.type || 'SOS'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <span>Time</span>
                  <strong>{getTimeAgo(selectedAlert.createdAt)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <span>Phone</span>
                  <strong>{selectedAlert.user?.phone || 'N/A'}</strong>
                </div>
                {selectedAlert.respondingVolunteer?.volunteer?.user?.name && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#e8f5e9', borderRadius: '8px' }}>
                    <span>Volunteer</span>
                    <strong>{selectedAlert.respondingVolunteer.volunteer.user.name}</strong>
                  </div>
                )}
                {selectedAlert.responseTime && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <span>Response Time</span>
                    <strong>{Math.round(selectedAlert.responseTime / 60)} min</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertMonitoring;
