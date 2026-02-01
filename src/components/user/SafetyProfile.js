import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const SafetyProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bloodGroup: user?.bloodGroup || '',
    medicalConditions: user?.medicalConditions || '',
    allergies: user?.allergies || '',
    emergencyMessage: user?.emergencyMessage || 'I need help! This is an emergency.'
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

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <div className="card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-info">
            <h2>{user?.name || 'User'}</h2>
            <p>{user?.email}</p>
            <span className="badge badge-success">Verified User</span>
          </div>
        </div>

        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <h3>Safety Profile</h3>
          <button
            className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'}`}
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
              <label className="form-label">Blood Group</label>
              <select
                name="bloodGroup"
                className="form-control"
                value={formData.bloodGroup}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
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
            <label className="form-label">Medical Conditions (Optional)</label>
            <textarea
              name="medicalConditions"
              className="form-control"
              value={formData.medicalConditions}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Any medical conditions responders should know about"
              rows="2"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Allergies (Optional)</label>
            <input
              type="text"
              name="allergies"
              className="form-control"
              value={formData.allergies}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Any known allergies"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Default Emergency Message</label>
            <textarea
              name="emergencyMessage"
              className="form-control"
              value={formData.emergencyMessage}
              onChange={handleChange}
              disabled={!isEditing}
              rows="2"
              placeholder="This message will be sent to your contacts during an emergency"
            />
          </div>

          {isEditing && (
            <button type="submit" className="btn btn-primary btn-lg">
              Save Changes
            </button>
          )}
        </form>
      </div>

      {/* Safety Settings */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '20px' }}>Safety Settings</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div>
              <strong>Auto-share Location</strong>
              <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>Automatically share location when SOS is triggered</p>
            </div>
            <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div>
              <strong>Notify Emergency Contacts</strong>
              <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>Send SMS to emergency contacts during alert</p>
            </div>
            <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div>
              <strong>Silent SOS Mode</strong>
              <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>Trigger SOS without sound or visible confirmation</p>
            </div>
            <input type="checkbox" style={{ width: '20px', height: '20px' }} />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div>
              <strong>Shake to SOS</strong>
              <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>Shake phone vigorously to trigger SOS</p>
            </div>
            <input type="checkbox" style={{ width: '20px', height: '20px' }} />
          </label>
        </div>
      </div>
    </div>
  );
};

export default SafetyProfile;
