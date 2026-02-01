import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = {
    totalUsers: 1250,
    totalVolunteers: 85,
    activeAlerts: 3,
    resolvedToday: 12,
    avgResponseTime: '3.5 min',
    successRate: '94%'
  };

  const recentAlerts = [
    { id: 1, user: 'User #1234', location: 'MG Road', status: 'active', time: '2 min ago', volunteer: 'Pending' },
    { id: 2, user: 'User #1189', location: 'Koramangala', status: 'responding', time: '5 min ago', volunteer: 'John D.' },
    { id: 3, user: 'User #1156', location: 'BTM Layout', status: 'resolved', time: '15 min ago', volunteer: 'Sarah S.' },
    { id: 4, user: 'User #1098', location: 'Indiranagar', status: 'resolved', time: '1 hour ago', volunteer: 'Mike R.' }
  ];

  const pendingVerifications = [
    { id: 1, name: 'Amit Kumar', type: 'Volunteer', submitted: '2 days ago' },
    { id: 2, name: 'Priya Sharma', type: 'Volunteer', submitted: '3 days ago' },
    { id: 3, name: 'Rahul Singh', type: 'Volunteer', submitted: '5 days ago' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'danger';
      case 'responding': return 'warning';
      case 'resolved': return 'success';
      default: return 'info';
    }
  };

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
              🔔 {stats.activeAlerts} Active Alerts
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats" style={{ marginTop: '20px' }}>
        <div className="stat-card">
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#7c4dff' }}>{stats.totalVolunteers}</div>
          <div className="stat-label">Active Volunteers</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#f44336' }}>{stats.activeAlerts}</div>
          <div className="stat-label">Active Alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#4caf50' }}>{stats.resolvedToday}</div>
          <div className="stat-label">Resolved Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.avgResponseTime}</div>
          <div className="stat-label">Avg Response</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#4caf50' }}>{stats.successRate}</div>
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
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Location</th>
                <th>Status</th>
                <th>Volunteer</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <div>{alert.user}</div>
                    <small style={{ color: '#666' }}>{alert.time}</small>
                  </td>
                  <td>{alert.location}</td>
                  <td>
                    <span className={`badge badge-${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td>{alert.volunteer}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
              {pendingVerifications.map((item) => (
                <div
                  key={item.id}
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
                    <strong>{item.name}</strong>
                    <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                      {item.type} • Submitted {item.submitted}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-sm btn-success">Approve</button>
                    <button className="btn btn-sm btn-outline">Review</button>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <Link to="/admin/users" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
            👥 Manage Users
          </Link>
          <Link to="/admin/volunteers" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
            🤝 Manage Volunteers
          </Link>
          <Link to="/admin/alerts" className="btn btn-danger" style={{ justifyContent: 'flex-start' }}>
            🚨 Monitor Alerts
          </Link>
          <Link to="/admin/reports" className="btn btn-success" style={{ justifyContent: 'flex-start' }}>
            📊 View Reports
          </Link>
        </div>
      </div>

      {/* System Health */}
      <div className="card" style={{ marginTop: '20px', background: '#e8f5e9' }}>
        <h3 style={{ marginBottom: '15px' }}>System Health</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Server Status</span>
              <span style={{ color: '#4caf50' }}>● Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Database</span>
              <span style={{ color: '#4caf50' }}>● Healthy</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>API Response</span>
              <span style={{ color: '#4caf50' }}>45ms</span>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>SMS Service</span>
              <span style={{ color: '#4caf50' }}>● Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Location Service</span>
              <span style={{ color: '#4caf50' }}>● Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Last Backup</span>
              <span>2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
