import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const VolunteerProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    availability: 'flexible',
    skills: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, dashboardRes] = await Promise.all([
        api.getVolunteerProfile(),
        api.getVolunteerDashboard()
      ]);

      const vol = profileRes.data;
      setProfile(vol);
      setStats(dashboardRes.data.stats);
      setBadges(dashboardRes.data.badges || []);

      setFormData({
        name: vol.user?.name || user?.name || '',
        email: vol.user?.email || user?.email || '',
        phone: vol.user?.phone || user?.phone || '',
        address: user?.address || '',
        availability: vol.availability || 'flexible',
        skills: Array.isArray(vol.skills) ? vol.skills.join(', ') : vol.skills || ''
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      // Fallback to auth context user data
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        availability: user?.availability || 'flexible',
        skills: user?.skills || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateVolunteerProfile({
        availability: formData.availability,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      updateUser({ ...user, ...formData });
      setIsEditing(false);
      fetchProfileData();
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatResponseTime = (seconds) => {
    if (!seconds || seconds === 0) return '--';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${(seconds / 60).toFixed(1)} min`;
  };

  // All possible badges with their lock/unlock logic
  const allBadgeDefinitions = [
    { name: 'First Responder', icon: '🏅' },
    { name: '10 Assists', icon: '⭐' },
    { name: '25 Assists', icon: '🌟' },
    { name: 'Quick Responder', icon: '⚡' },
    { name: '50 Assists', icon: '🏆' },
    { name: 'Community Hero', icon: '🦸' }
  ];

  const getBadgesWithStatus = () => {
    return allBadgeDefinitions.map(def => {
      const earned = badges.find(b => b.name === def.name);
      return {
        ...def,
        earned: !!earned,
        earnedAt: earned?.earnedAt
      };
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  const memberSince = profile?.createdAt || user?.createdAt;
  const isVerified = profile?.isVerified ?? user?.verified;

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <div className="card">
        <div className="profile-header">
          <div className="profile-avatar" style={{ background: 'linear-gradient(135deg, #7c4dff, #536dfe)' }}>
            {formData.name?.charAt(0).toUpperCase() || 'V'}
          </div>
          <div className="profile-info">
            <h2>{formData.name || 'Volunteer'}</h2>
            <p>{formData.email}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              {isVerified ? (
                <span className="badge badge-success">Verified Volunteer</span>
              ) : (
                <span className="badge badge-warning">Pending Verification</span>
              )}
              {memberSince && (
                <span className="badge badge-info">Member since {formatDate(memberSince)}</span>
              )}
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
          {getBadgesWithStatus().map((badge, index) => (
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
              {badge.earned && badge.earnedAt && (
                <p style={{ fontSize: '0.75rem', color: '#666' }}>
                  Earned {formatDate(badge.earnedAt)}
                </p>
              )}
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
            <div className="stat-number">{stats?.totalResponses ?? 0}</div>
            <div className="stat-label">Total Responses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats?.successfulAssists ?? 0}</div>
            <div className="stat-label">Successful Assists</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{formatResponseTime(stats?.avgResponseTime)}</div>
            <div className="stat-label">Avg Response Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#ff9800' }}>
              {stats?.totalRatings > 0 ? `⭐ ${stats.rating.toFixed(1)}` : 'No ratings'}
            </div>
            <div className="stat-label">User Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;
