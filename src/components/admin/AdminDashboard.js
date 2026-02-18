import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const response = await api.getAdminDashboard();
      setStats(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    }
  }, []);

  const fetchPendingVerifications = useCallback(async () => {
    try {
      const response = await api.getAdminVolunteers(1, 5, 'pending', 'false');
      setPendingVerifications(response.data || []);
    } catch (err) {
      console.error('Failed to fetch pending verifications:', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchPendingVerifications()]);
      setLoading(false);
    };
    loadData();
  }, [fetchDashboard, fetchPendingVerifications]);

  const handleApprove = async (volunteerId) => {
    setActionLoading(volunteerId);
    try {
      await api.verifyVolunteer(volunteerId);
      await Promise.all([fetchDashboard(), fetchPendingVerifications()]);
    } catch (err) {
      alert(err.message || 'Failed to approve volunteer');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'danger';
      case 'responding': return 'warning';
      case 'resolved': return 'success';
      default: return 'info';
    }
  };

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

  if (loading) {
    return (
      <div className="container" style={{ padding: '20px 0', textAlign: 'center' }}>
        <div className="card"><p>Loading dashboard...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '20px 0' }}>
        <div className="card" style={{ background: '#ffebee', textAlign: 'center' }}>
          <p style={{ color: '#c62828' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => { setLoading(true); fetchDashboard().finally(() => setLoading(false)); }}>
            Retry
          </button>
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
            <h2>Admin Dashboard</h2>
            <p style={{ color: '#666' }}>Welcome back, {user?.name || 'Admin'}!</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/reports" className="btn btn-outline">Generate Report</Link>
            <Link to="/admin/alerts" className="btn btn-danger">
              {stats?.alerts?.active || 0} Active Alerts
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats" style={{ marginTop: '20px' }}>
        <div className="stat-card">
          <div className="stat-number">{stats?.users?.total || 0}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#7c4dff' }}>{stats?.volunteers?.active || 0}</div>
          <div className="stat-label">Active Volunteers</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#f44336' }}>{stats?.alerts?.active || 0}</div>
          <div className="stat-label">Active Alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#4caf50' }}>{stats?.alerts?.resolvedToday || 0}</div>
          <div className="stat-label">Resolved Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {stats?.alerts?.avgResponseTime ? `${Math.round(stats.alerts.avgResponseTime / 60)} min` : 'N/A'}
          </div>
          <div className="stat-label">Avg Response</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#4caf50' }}>{stats?.alerts?.successRate || 0}%</div>
          <div className="stat-label">Success Rate</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Alerts */}
        <div className="card">
          <div className="card-header flex-between">
            <h3 className="card-title">Recent Alerts</h3>
            <Link to="/admin/alerts" className="btn btn-sm btn-outline">View All</Link>
          </div>
          {stats?.recentAlerts?.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAlerts.slice(0, 5).map((alert) => (
                    <tr key={alert._id}>
                      <td>
                        <div>{alert.user?.name || 'Unknown'}</div>
                        <small style={{ color: '#666' }}>{getTimeAgo(alert.createdAt)}</small>
                      </td>
                      <td>{alert.location?.address || 'Unknown location'}</td>
                      <td>
                        <span className={`badge badge-${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                      </td>
                      <td>{alert.type || 'SOS'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No recent alerts</p>
          )}
        </div>

        {/* Pending Verifications */}
        <div className="card">
          <div className="card-header flex-between">
            <h3 className="card-title">Pending Verifications</h3>
            <Link to="/admin/volunteers" className="btn btn-sm btn-outline">View All</Link>
          </div>
          {pendingVerifications.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No pending verifications
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingVerifications.map((vol) => (
                <div
                  key={vol._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    background: '#fff3e0',
                    borderRadius: '8px'
                  }}
                >
                  <div>
                    <strong>{vol.user?.name || 'Unknown'}</strong>
                    <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                      Volunteer {vol.user?.email ? `- ${vol.user.email}` : ''} - Applied {getTimeAgo(vol.createdAt)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleApprove(vol._id)}
                      disabled={actionLoading === vol._id}
                    >
                      {actionLoading === vol._id ? 'Approving...' : 'Approve'}
                    </button>
                    <Link to="/admin/volunteers" className="btn btn-sm btn-outline">Review</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
        <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Link to="/admin/users" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
            Manage Users
          </Link>
          <Link to="/admin/volunteers" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
            Manage Volunteers
          </Link>
          <Link to="/admin/alerts" className="btn btn-danger" style={{ justifyContent: 'flex-start' }}>
            Monitor Alerts
          </Link>
          <Link to="/admin/reports" className="btn btn-success" style={{ justifyContent: 'flex-start' }}>
            View Reports
          </Link>
          <Link to="/admin/safezones" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            Manage Safe Zones
          </Link>
        </div>
      </div>

      {/* System Health */}
      <div className="card" style={{ marginTop: '20px', background: '#e8f5e9' }}>
        <h3 style={{ marginBottom: '15px' }}>System Health</h3>
        <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Server Status</span>
              <span style={{ color: '#4caf50' }}>Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>On-Duty Volunteers</span>
              <strong>{stats?.volunteers?.onDuty || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pending Verifications</span>
              <strong>{stats?.volunteers?.pendingVerification || 0}</strong>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Total Alerts</span>
              <strong>{stats?.alerts?.total || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Users Today</span>
              <strong>{stats?.users?.newToday || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Volunteers</span>
              <strong>{stats?.volunteers?.total || 0}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
