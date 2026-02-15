import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    aadharNumber: '',
    password: '',
    confirmPassword: '',
    address: '',
    bloodGroup: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
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

    // Aadhaar card validation (12 digits)
    const aadharRegex = /^[0-9]{12}$/;
    if (!aadharRegex.test(formData.aadharNumber)) {
      setError('Aadhaar number must be exactly 12 digits');
      return;
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
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        aadharNumber: formData.aadharNumber,
        password: formData.password,
        address: formData.address,
        bloodGroup: formData.bloodGroup
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <div className="auth-logo">SafeHer</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join our safety network today</p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{
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

        <div className="form-group">
          <label className="form-label">Email Address <span style={{ color: 'red' }}>*</span></label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number <span style={{ color: 'red' }}>*</span></label>
          <input
            type="tel"
            name="phone"
            className="form-control"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter 10-digit phone number"
            maxLength="10"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Aadhaar Card Number <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            name="aadharNumber"
            className="form-control"
            value={formData.aadharNumber}
            onChange={handleChange}
            placeholder="Enter 12-digit Aadhaar number"
            maxLength="12"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            type="text"
            name="address"
            className="form-control"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Blood Group</label>
          <select
            name="bloodGroup"
            className="form-control"
            value={formData.bloodGroup}
            onChange={handleChange}
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
              placeholder="Create a password"
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
              placeholder="Confirm your password"
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

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        <p>Want to help others? <Link to="/volunteer/register">Register as Volunteer</Link></p>
      </div>
    </AuthLayout>
  );
};

export default Register;
