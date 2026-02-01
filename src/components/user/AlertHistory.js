import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AlertHistory = ({ limit }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await api.getMyAlerts();
        if (response.success) {
          setAlerts(response.data);
        }
      } catch (err) {
        setError('Failed to load alert history');
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const displayAlerts = limit ? alerts.slice(0, limit) : alerts;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="badge badge-success">Resolved</span>;
      case 'responding':
        return <span className="badge badge-info">Responding</span>;
      case 'cancelled':
        return <span className="badge badge-warning">Cancelled</span>;
      case 'active':
        return <span className="badge badge-danger">Active</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'sos':
        return { icon: '🆘', class: 'danger' };
      case 'medical':
        return { icon: '🏥', class: 'danger' };
      case 'harassment':
        return { icon: '⚠️', class: 'warning' };
      case 'accident':
        return { icon: '🚗', class: 'warning' };
      default:
        return { icon: '📢', class: 'info' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatResponseTime = (seconds) => {
    if (!seconds) return null;
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    return `${Math.floor(seconds / 3600)} hours`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>Loading alert history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#f44336' }}>
        <p>{error}</p>
      </div>
    );
  }

  if (displayAlerts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p style={{ fontSize: '3rem', marginBottom: '10px' }}>📋</p>
        <p>No alerts yet.</p>
        <p>Your emergency alert history will appear here.</p>
      </div>
    );
  }

  return (
    <ul className="alert-list">
      {displayAlerts.map((alert) => {
        const iconData = getAlertIcon(alert.type);
        const volunteerName = alert.respondingVolunteer?.volunteer?.user?.name;

        return (
          <li key={alert._id} className="alert-item">
            <div className={`alert-icon ${iconData.class}`}>
              {iconData.icon}
            </div>
            <div className="alert-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span className="alert-title">
                  {alert.type === 'sos' ? 'SOS Alert' : alert.type.charAt(0).toUpperCase() + alert.type.slice(1) + ' Alert'}
                </span>
                {getStatusBadge(alert.status)}
              </div>
              <p style={{ color: '#666', fontSize: '0.875rem', margin: '4px 0' }}>
                {alert.message || 'Emergency alert triggered'}
              </p>
              {alert.location?.address && (
                <p style={{ color: '#888', fontSize: '0.8rem', margin: '2px 0' }}>
                  📍 {alert.location.address}
                </p>
              )}
              {volunteerName && (
                <p style={{ color: '#4caf50', fontSize: '0.8rem', margin: '2px 0' }}>
                  👤 Volunteer: {volunteerName}
                </p>
              )}
              {alert.responseTime && (
                <p style={{ color: '#2196f3', fontSize: '0.8rem', margin: '2px 0' }}>
                  ⏱️ Response time: {formatResponseTime(alert.responseTime)}
                </p>
              )}
              {alert.locationHistory && alert.locationHistory.length > 0 && (
                <p style={{ color: '#9c27b0', fontSize: '0.8rem', margin: '2px 0' }}>
                  📡 {alert.locationHistory.length} location updates shared
                </p>
              )}
              <span className="alert-time">{formatDate(alert.createdAt)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

// Full page version
export const AlertHistoryPage = () => {
  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Alert History</h2>
          <p style={{ color: '#666', marginTop: '5px' }}>View all your past emergency alerts and activities</p>
        </div>
        <AlertHistory />
      </div>
    </div>
  );
};

export default AlertHistory;
