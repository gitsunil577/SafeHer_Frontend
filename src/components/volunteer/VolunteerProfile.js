import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const VolunteerProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    availability: user?.availability || 'flexible',
    skills: user?.skills || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({ ...user, ...formData });
    setIsEditing(false);
  };

  const badges = [
    { name: 'First Responder', icon: '🏅', earned: true },
    { name: '10 Assists', icon: '⭐', earned: true },
    { name: '25 Assists', icon: '🌟', earned: true },
    { name: 'Quick Responder', icon: '⚡', earned: true },
    { name: '50 Assists', icon: '🏆', earned: false },
    { name: 'Community Hero', icon: '🦸', earned: false }
  ];

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <div className="card">
        <div className="profile-header">
          <div className="profile-avatar" style={{ background: 'linear-gradient(135deg, #7c4dff, #536dfe)' }}>
            {user?.name?.charAt(0).toUpperCase() || 'V'}
          </div>
          <div className="profile-info">
            <h2>{user?.name || 'Volunteer'}</h2>
            <p>{user?.email}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              {user?.verified ? (
                <span className="badge badge-success">Verified Volunteer</span>
              ) : (
                <span className="badge badge-warning">Pending Verification</span>
              )}
              <span className="badge badge-info">Member since Jan 2024</span>
            </div>
          </div>
        </div>

        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <h3>Profile Information</h3>
          <button
            className={`btn ${isEditing ? 'btn-outline' : 'btn-secondary'}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Availability</label>
              <select
                name="availability"
                className="form-control"
                value={formData.availability}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="fulltime">Full Time (24/7)</option>
                <option value="daytime">Day Time Only</option>
                <option value="nighttime">Night Time Only</option>
                <option value="weekends">Weekends Only</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              rows="2"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Skills & Training</label>
            <textarea
              name="skills"
              className="form-control"
              value={formData.skills}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="First aid, self-defense training, etc."
              rows="2"
            />
          </div>

          {isEditing && (
            <button type="submit" className="btn btn-secondary btn-lg">
              Save Changes
            </button>
          )}
        </form>
      </div>

      {/* Badges & Achievements */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '20px' }}>Badges & Achievements</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          {badges.map((badge, index) => (
            <div
              key={index}
              style={{
                textAlign: 'center',
                padding: '20px',
                background: badge.earned ? '#f3e5f5' : '#f5f5f5',
                borderRadius: '12px',
                opacity: badge.earned ? 1 : 0.5
              }}
            >
              <span style={{ fontSize: '2rem' }}>{badge.icon}</span>
              <p style={{ marginTop: '10px', fontWeight: '500' }}>{badge.name}</p>
              {!badge.earned && <p style={{ fontSize: '0.75rem', color: '#666' }}>Locked</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '20px' }}>Your Statistics</h3>
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">24</div>
            <div className="stat-label">Total Responses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">22</div>
            <div className="stat-label">Successful Assists</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">4.2 min</div>
            <div className="stat-label">Avg Response Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#ff9800' }}>⭐ 4.8</div>
            <div className="stat-label">User Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;
