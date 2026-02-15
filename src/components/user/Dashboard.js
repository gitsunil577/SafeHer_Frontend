import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import SOSButton from './SOSButton';
import NearbySupport from './NearbySupport';
import AlertHistory from './AlertHistory';
import FeedbackBanner from './FeedbackBanner';

const Dashboard = () => {
  const { user } = useAuth();
  const { on, off, isConnected } = useSocket();
  const [activeAlert, setActiveAlert] = useState(null);
  const [alertStats, setAlertStats] = useState(null);
  const [respondingVolunteer, setRespondingVolunteer] = useState(null);

  // Listen for real-time volunteer response notifications
  useEffect(() => {
    const handleVolunteerResponding = (data) => {
      console.log('Volunteer responding:', data);
      setRespondingVolunteer({
        name: data.volunteerName,
        estimatedTime: data.estimatedTime,
        alertId: data.alertId
      });
    };

    on('volunteer_responding', handleVolunteerResponding);
    return () => off('volunteer_responding', handleVolunteerResponding);
  }, [on, off]);

  const handleSOSTrigger = (alertData) => {
    setActiveAlert(alertData);
    setAlertStats({
      volunteersNotified: alertData.volunteersNotified,
      contactsNotified: alertData.contactsNotified
    });
  };

  const handleAlertUpdate = (alertData) => {
    setActiveAlert(alertData);
    if (alertData.status === 'resolved' || alertData.status === 'cancelled') {
      setActiveAlert(null);
      setAlertStats(null);
    }
  };

  const quickActions = [
    { title: 'Emergency Contacts', icon: '📞', link: '/contacts', color: '#e91e63' },
    { title: 'Safety Profile', icon: '👤', link: '/profile', color: '#7c4dff' },
    { title: 'Safe Zones', icon: '📍', link: '/safe-zones', color: '#4caf50' },
    { title: 'Alert History', icon: '📋', link: '/history', color: '#ff9800' }
  ];

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      {/* Welcome Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="flex-between">
          <div>
            <h2>Welcome, {user?.name || 'User'}!</h2>
            <p style={{ color: '#666' }}>Stay safe. Help is just one tap away.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isConnected && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 8px', borderRadius: '10px',
                background: '#e8f5e9', fontSize: '0.7rem', fontWeight: '700', color: '#2e7d32'
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#4caf50', display: 'inline-block',
                  animation: 'pulse 2s infinite'
                }}></span>
                LIVE
              </div>
            )}
            <div className={`status-badge ${activeAlert ? 'status-alert' : 'status-safe'}`}>
              {activeAlert ? 'Alert Active' : 'All Safe'}
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Responding Banner - Real-time */}
      {respondingVolunteer && (
        <div className="card" style={{
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
          border: '2px solid #4caf50'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#4caf50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: '#fff'
            }}>
              &#x1F64B;
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#2e7d32', marginBottom: '5px' }}>Help is on the way!</h3>
              <p style={{ color: '#333', fontSize: '0.875rem', margin: 0 }}>
                <strong>{respondingVolunteer.name}</strong> is responding to your alert
                {respondingVolunteer.estimatedTime && ` (ETA: ${respondingVolunteer.estimatedTime})`}
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: '#fff', padding: '4px 10px', borderRadius: '12px'
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#4caf50', display: 'inline-block',
                animation: 'pulse 1.5s infinite'
              }}></span>
              <span style={{ color: '#2e7d32', fontSize: '0.75rem', fontWeight: '700' }}>LIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Alert Banner */}
      {activeAlert && alertStats && (
        <div className="card" style={{
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #ffebee, #fce4ec)',
          border: '2px solid #e91e63'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#e91e63',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              animation: 'pulse 1.5s infinite'
            }}>
              🚨
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#c62828', marginBottom: '5px' }}>Emergency Alert Active</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>
                {alertStats.volunteersNotified} volunteers notified • {alertStats.contactsNotified} contacts notified
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Banner - shows when resolved alerts need rating */}
      <FeedbackBanner />

      <div className="dashboard-grid">
        {/* SOS Section */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div className="card-header">
            <h3 className="card-title">Emergency SOS</h3>
          </div>
          <SOSButton
            onTrigger={handleSOSTrigger}
            onAlertUpdate={handleAlertUpdate}
          />
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#333',
                  transition: 'transform 0.2s'
                }}
              >
                <span style={{ fontSize: '2rem', marginBottom: '10px' }}>{action.icon}</span>
                <span style={{ fontWeight: '500', textAlign: 'center' }}>{action.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Nearby Support Section */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">Nearby Support</h3>
        </div>
        <NearbySupport />
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header flex-between">
          <h3 className="card-title">Recent Activity</h3>
          <Link to="/history" className="btn btn-sm btn-outline">View All</Link>
        </div>
        <AlertHistory limit={3} />
      </div>

      {/* Safety Tips */}
      <div className="card" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #e8f5e9, #f3e5f5)' }}>
        <h3 style={{ marginBottom: '15px' }}>Safety Tips</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>✅</span> Keep your emergency contacts updated
          </li>
          <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>✅</span> Enable location services for accurate help
          </li>
          <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>✅</span> Live location is shared automatically during SOS
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>✅</span> Know your nearest safe zones
          </li>
        </ul>
      </div>

      {/* Inline styles for animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .status-alert {
          background: #ffebee;
          color: #c62828;
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
