import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const Reports = () => {
  const [dateRange, setDateRange] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDaysFromRange = (range) => {
    switch (range) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 30;
    }
  };

  const fetchReports = useCallback(async (range) => {
    try {
      setError(null);
      setLoading(true);
      const days = getDaysFromRange(range);
      const response = await api.getAdminReports(days);
      setReportData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(dateRange);
  }, [dateRange, fetchReports]);

  const handleDateRangeChange = (value) => {
    setDateRange(value);
  };

  // Compute derived metrics
  const alertsByDay = reportData?.alertsByDay || [];
  const alertsByLocation = reportData?.alertsByLocation || [];
  const topVolunteers = reportData?.topVolunteers || [];
  const responseTimeStats = reportData?.responseTimeStats || {};

  const totalAlerts = alertsByDay.reduce((sum, d) => sum + d.total, 0);
  const totalResolved = alertsByDay.reduce((sum, d) => sum + d.resolved, 0);
  const successRate = totalAlerts > 0 ? ((totalResolved / totalAlerts) * 100).toFixed(1) : 0;
  const avgResponseMin = responseTimeStats.avgTime ? (responseTimeStats.avgTime / 60).toFixed(1) : 'N/A';

  const maxAlertCount = alertsByDay.length > 0
    ? Math.max(...alertsByDay.map(d => d.total))
    : 1;

  const maxLocationCount = alertsByLocation.length > 0
    ? Math.max(...alertsByLocation.map(d => d.count))
    : 1;

  if (error && !reportData) {
    return (
      <div className="container" style={{ padding: '20px 0' }}>
        <div className="card" style={{ background: '#ffebee', textAlign: 'center' }}>
          <p style={{ color: '#c62828' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchReports(dateRange)}>Retry</button>
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
            <h2>Reports & Analytics</h2>
            <p style={{ color: '#666' }}>Platform performance and incident reports</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              className="form-control"
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Loading reports...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="dashboard-stats" style={{ marginTop: '20px' }}>
            <div className="stat-card">
              <div className="stat-number">{totalAlerts}</div>
              <div className="stat-label">Total Alerts</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#4caf50' }}>{totalResolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{avgResponseMin}{avgResponseMin !== 'N/A' ? ' min' : ''}</div>
              <div className="stat-label">Avg Response</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#4caf50' }}>{successRate}%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {responseTimeStats.minTime ? `${(responseTimeStats.minTime / 60).toFixed(1)} min` : 'N/A'}
              </div>
              <div className="stat-label">Fastest Response</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#ff9800' }}>
                {responseTimeStats.maxTime ? `${(responseTimeStats.maxTime / 60).toFixed(1)} min` : 'N/A'}
              </div>
              <div className="stat-label">Slowest Response</div>
            </div>
          </div>

          <div className="dashboard-grid" style={{ marginTop: '20px' }}>
            {/* Alerts Trend Chart */}
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Alerts Trend</h3>
              {alertsByDay.length > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '200px', padding: '20px 0', overflowX: 'auto' }}>
                    {alertsByDay.map((data, index) => (
                      <div key={index} style={{ flex: '0 0 auto', minWidth: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '150px' }}>
                          <div
                            style={{
                              width: '12px',
                              height: `${Math.max((data.total / maxAlertCount) * 150, 4)}px`,
                              background: '#e91e63',
                              borderRadius: '2px 2px 0 0'
                            }}
                            title={`Total: ${data.total}`}
                          />
                          <div
                            style={{
                              width: '12px',
                              height: `${Math.max((data.resolved / maxAlertCount) * 150, 4)}px`,
                              background: '#4caf50',
                              borderRadius: '2px 2px 0 0'
                            }}
                            title={`Resolved: ${data.resolved}`}
                          />
                        </div>
                        <span style={{ marginTop: '5px', fontSize: '0.7rem', color: '#666', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                          {data._id?.slice(5) || ''}
                        </span>
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
                </>
              ) : (
                <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No alert data for this period</p>
              )}
            </div>

            {/* Alerts by Location */}
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Alerts by Location</h3>
              {alertsByLocation.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {alertsByLocation.map((item, index) => {
                    const percentage = ((item.count / maxLocationCount) * 100).toFixed(0);
                    return (
                      <div key={index}>
                        <div className="flex-between" style={{ marginBottom: '5px' }}>
                          <span>{item._id || 'Unknown'}</span>
                          <span style={{ fontWeight: '500' }}>{item.count}</span>
                        </div>
                        <div style={{ background: '#eee', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: '100%',
                              background: `hsl(${340 - index * 20}, 70%, 50%)`,
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No location data for this period</p>
              )}
            </div>
          </div>

          {/* Top Volunteers */}
          <div className="card" style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Top Performing Volunteers</h3>
            {topVolunteers.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Volunteer</th>
                    <th>Successful Assists</th>
                    <th>Total Alerts</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topVolunteers.map((volunteer, index) => (
                    <tr key={volunteer._id}>
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
                      <td style={{ fontWeight: '500' }}>{volunteer.user?.name || 'Unknown'}</td>
                      <td>{volunteer.stats?.successfulAssists || 0}</td>
                      <td>{volunteer.stats?.totalAlerts || 0}</td>
                      <td>{volunteer.stats?.rating > 0 ? volunteer.stats.rating.toFixed(1) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No volunteer data available</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
