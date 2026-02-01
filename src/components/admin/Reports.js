import React, { useState } from 'react';

const Reports = () => {
  const [dateRange, setDateRange] = useState('month');

  const stats = {
    totalAlerts: 156,
    resolvedAlerts: 147,
    avgResponseTime: '3.5 min',
    successRate: '94.2%',
    newUsers: 89,
    newVolunteers: 12,
    activeVolunteers: 45
  };

  const monthlyData = [
    { month: 'Aug', alerts: 98, resolved: 92 },
    { month: 'Sep', alerts: 112, resolved: 105 },
    { month: 'Oct', alerts: 125, resolved: 118 },
    { month: 'Nov', alerts: 145, resolved: 138 },
    { month: 'Dec', alerts: 132, resolved: 127 },
    { month: 'Jan', alerts: 156, resolved: 147 }
  ];

  const topVolunteers = [
    { name: 'John Doe', responses: 45, rating: 4.9, avgTime: '2.8 min' },
    { name: 'Sarah Smith', responses: 38, rating: 4.8, avgTime: '3.1 min' },
    { name: 'Mike Johnson', responses: 32, rating: 4.7, avgTime: '3.5 min' },
    { name: 'Emily Brown', responses: 28, rating: 4.9, avgTime: '2.5 min' },
    { name: 'David Wilson', responses: 25, rating: 4.6, avgTime: '3.8 min' }
  ];

  const alertsByLocation = [
    { location: 'MG Road', count: 28, percentage: '18%' },
    { location: 'Koramangala', count: 24, percentage: '15%' },
    { location: 'BTM Layout', count: 22, percentage: '14%' },
    { location: 'Indiranagar', count: 19, percentage: '12%' },
    { location: 'Whitefield', count: 15, percentage: '10%' }
  ];

  const maxAlerts = Math.max(...monthlyData.map(d => d.alerts));

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      {/* Header */}
      <div className="card">
        <div className="flex-between">
          <div>
            <h2>Reports & Analytics</h2>
            <p style={{ color: '#666' }}>Platform performance and incident reports</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              className="form-control"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
            </select>
            <button className="btn btn-primary">Export Report</button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="dashboard-stats" style={{ marginTop: '20px' }}>
        <div className="stat-card">
          <div className="stat-number">{stats.totalAlerts}</div>
          <div className="stat-label">Total Alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#4caf50' }}>{stats.resolvedAlerts}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.avgResponseTime}</div>
          <div className="stat-label">Avg Response</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#4caf50' }}>{stats.successRate}</div>
          <div className="stat-label">Success Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#e91e63' }}>{stats.newUsers}</div>
          <div className="stat-label">New Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#7c4dff' }}>{stats.newVolunteers}</div>
          <div className="stat-label">New Volunteers</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '20px' }}>
        {/* Alerts Trend Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Alerts Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', height: '200px', padding: '20px 0' }}>
            {monthlyData.map((data, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '150px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: `${(data.alerts / maxAlerts) * 150}px`,
                      background: '#e91e63',
                      borderRadius: '4px 4px 0 0'
                    }}
                    title={`Alerts: ${data.alerts}`}
                  />
                  <div
                    style={{
                      width: '20px',
                      height: `${(data.resolved / maxAlerts) * 150}px`,
                      background: '#4caf50',
                      borderRadius: '4px 4px 0 0'
                    }}
                    title={`Resolved: ${data.resolved}`}
                  />
                </div>
                <span style={{ marginTop: '10px', fontSize: '0.875rem', color: '#666' }}>{data.month}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', background: '#e91e63', borderRadius: '2px' }} />
              Total Alerts
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', background: '#4caf50', borderRadius: '2px' }} />
              Resolved
            </span>
          </div>
        </div>

        {/* Alerts by Location */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Alerts by Location</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {alertsByLocation.map((item, index) => (
              <div key={index}>
                <div className="flex-between" style={{ marginBottom: '5px' }}>
                  <span>{item.location}</span>
                  <span style={{ fontWeight: '500' }}>{item.count} ({item.percentage})</span>
                </div>
                <div style={{ background: '#eee', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: item.percentage,
                      height: '100%',
                      background: `hsl(${340 - index * 20}, 70%, 50%)`,
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Volunteers */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '20px' }}>Top Performing Volunteers</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Volunteer</th>
              <th>Responses</th>
              <th>Rating</th>
              <th>Avg Response Time</th>
            </tr>
          </thead>
          <tbody>
            {topVolunteers.map((volunteer, index) => (
              <tr key={index}>
                <td>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#eee',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </span>
                </td>
                <td style={{ fontWeight: '500' }}>{volunteer.name}</td>
                <td>{volunteer.responses}</td>
                <td>⭐ {volunteer.rating}</td>
                <td>{volunteer.avgTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* KPIs Summary */}
      <div className="card" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #e8f5e9, #e3f2fd)' }}>
        <h3 style={{ marginBottom: '20px' }}>Key Performance Indicators</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
            <h4 style={{ color: '#e91e63', marginBottom: '10px' }}>User Growth</h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>+7.2%</p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>vs last month</p>
          </div>
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
            <h4 style={{ color: '#7c4dff', marginBottom: '10px' }}>Volunteer Retention</h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>92%</p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>active volunteers</p>
          </div>
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
            <h4 style={{ color: '#4caf50', marginBottom: '10px' }}>Response Improvement</h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>-15%</p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>response time reduced</p>
          </div>
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
            <h4 style={{ color: '#ff9800', marginBottom: '10px' }}>User Satisfaction</h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>4.7/5</p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>average rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
