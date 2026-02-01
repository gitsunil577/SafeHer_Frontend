import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VolunteerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    idType: '',
    idNumber: '',
    occupation: '',
    experience: '',
    availability: '',
    skills: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { registerVolunteer } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Phone number validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    // ID validation based on type
    if (formData.idType === 'aadhar') {
      const aadharRegex = /^[0-9]{12}$/;
      if (!aadharRegex.test(formData.idNumber)) {
        setError('Aadhaar number must be exactly 12 digits');
        return;
      }
    } else if (formData.idType === 'passport') {
      const passportRegex = /^[A-Z][0-9]{7}$/;
      if (!passportRegex.test(formData.idNumber.toUpperCase())) {
        setError('Passport number must be 1 letter followed by 7 digits (e.g., A1234567)');
        return;
      }
    } else if (formData.idType === 'driving') {
      const drivingRegex = /^[A-Z]{2}[0-9]{13}$/;
      if (!drivingRegex.test(formData.idNumber.toUpperCase())) {
        setError('Driving License must be 2 letters followed by 13 digits (e.g., DL1420110012345)');
        return;
      }
    } else if (formData.idType === 'voter') {
      const voterRegex = /^[A-Z]{3}[0-9]{7}$/;
      if (!voterRegex.test(formData.idNumber.toUpperCase())) {
        setError('Voter ID must be 3 letters followed by 7 digits (e.g., ABC1234567)');
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await registerVolunteer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
        idType: formData.idType,
        idNumber: formData.idNumber,
        occupation: formData.occupation,
        experience: formData.experience,
        availability: formData.availability,
        skills: formData.skills
      });

      navigate('/volunteer/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '550px' }}>
        <div className="auth-header">
          <div className="auth-logo">SafeHer</div>
          <h1 className="auth-title">Volunteer Registration</h1>
          <p className="auth-subtitle">Join our network of verified responders</p>
        </div>

        {error && (
          <div style={{
            color: '#c62828',
            background: '#ffebee',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Email <span style={{ color: 'red' }}>*</span></label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone <span style={{ color: 'red' }}>*</span></label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit phone number"
                maxLength="10"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your full address"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">ID Type <span style={{ color: 'red' }}>*</span></label>
              <select
                name="idType"
                className="form-control"
                value={formData.idType}
                onChange={handleChange}
                required
              >
                <option value="">Select ID Type</option>
                <option value="aadhar">Aadhar Card</option>
                <option value="passport">Passport</option>
                <option value="driving">Driving License</option>
                <option value="voter">Voter ID</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">ID Number <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                name="idNumber"
                className="form-control"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder={
                  formData.idType === 'aadhar' ? '12-digit Aadhaar (e.g., 123456789012)' :
                  formData.idType === 'passport' ? 'Passport (e.g., A1234567)' :
                  formData.idType === 'driving' ? 'DL (e.g., DL1420110012345)' :
                  formData.idType === 'voter' ? 'Voter ID (e.g., ABC1234567)' :
                  'Select ID type first'
                }
                maxLength={
                  formData.idType === 'aadhar' ? '12' :
                  formData.idType === 'passport' ? '8' :
                  formData.idType === 'driving' ? '15' :
                  formData.idType === 'voter' ? '10' : '20'
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Occupation</label>
            <input
              type="text"
              name="occupation"
              className="form-control"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="Your occupation"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Relevant Experience</label>
            <textarea
              name="experience"
              className="form-control"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Any relevant experience (first aid, self-defense, etc.)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Skills (comma-separated)</label>
            <input
              type="text"
              name="skills"
              className="form-control"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., First Aid, CPR, Self Defense"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Availability <span style={{ color: 'red' }}>*</span></label>
            <select
              name="availability"
              className="form-control"
              value={formData.availability}
              onChange={handleChange}
              required
            >
              <option value="">Select Availability</option>
              <option value="fulltime">Full Time (24/7)</option>
              <option value="daytime">Day Time Only</option>
              <option value="nighttime">Night Time Only</option>
              <option value="weekends">Weekends Only</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Password <span style={{ color: 'red' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  style={{ paddingRight: '40px' }}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#666'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password <span style={{ color: 'red' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-control"
                  style={{ paddingRight: '40px' }}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#666'
                  }}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px', fontSize: '0.875rem', color: '#666' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <input type="checkbox" required />
              <span>I agree to undergo verification and background check. I understand that providing false information may result in legal action.</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-secondary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already registered? <Link to="/login">Sign in here</Link></p>
          <p>Need help as a user? <Link to="/register">Register as User</Link></p>
        </div>
      </div>
    </div>
  );
};

export default VolunteerRegister;
