import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StarRating = ({ rating, onRate, disabled }) => {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onRate(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: disabled ? 'default' : 'pointer',
            fontSize: '1.8rem',
            padding: '2px',
            transition: 'transform 0.15s ease',
            transform: (hover === star || (!hover && rating === star)) ? 'scale(1.2)' : 'scale(1)',
            color: (hover || rating) >= star ? '#ff9800' : '#ddd',
            filter: (hover || rating) >= star ? 'none' : 'grayscale(1)',
          }}
        >
          &#9733;
        </button>
      ))}
    </div>
  );
};

const FeedbackBanner = () => {
  const [pendingAlerts, setPendingAlerts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingFeedback();
  }, []);

  const fetchPendingFeedback = async () => {
    try {
      const response = await api.getPendingFeedback();
      if (response.success && response.data.length > 0) {
        setPendingAlerts(response.data);
      }
    } catch (err) {
      // Silently fail - feedback banner is non-critical
      console.error('Failed to fetch pending feedback:', err);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const alert = pendingAlerts[currentIndex];
      await api.submitAlertFeedback(alert._id, { rating, feedback });
      setSubmitted(true);

      // After a brief success message, move to next or hide
      setTimeout(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < pendingAlerts.length) {
          setCurrentIndex(nextIndex);
          setRating(0);
          setFeedback('');
          setSubmitted(false);
        } else {
          setPendingAlerts([]);
        }
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < pendingAlerts.length) {
      setCurrentIndex(nextIndex);
      setRating(0);
      setFeedback('');
    } else {
      setPendingAlerts([]);
    }
  };

  if (pendingAlerts.length === 0 || currentIndex >= pendingAlerts.length) {
    return null;
  }

  const alert = pendingAlerts[currentIndex];
  const volunteerName = alert.respondingVolunteer?.volunteer?.user?.name || 'the volunteer';
  const alertDate = new Date(alert.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Success state
  if (submitted) {
    return (
      <div className="card" style={{
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
        border: '2px solid #4caf50',
        textAlign: 'center',
        padding: '24px'
      }}>
        <span style={{ fontSize: '2.5rem' }}>&#10003;</span>
        <h3 style={{ color: '#2e7d32', margin: '8px 0 4px' }}>Thank you for your feedback!</h3>
        <p style={{ color: '#555', fontSize: '0.9rem' }}>Your rating helps improve our volunteer network.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{
      marginBottom: '20px',
      background: 'linear-gradient(135deg, #fff8e1, #fff3e0)',
      border: '2px solid #ff9800',
      position: 'relative'
    }}>
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          color: '#999',
          padding: '4px',
          lineHeight: 1
        }}
        title="Dismiss"
      >
        &#10005;
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff9800, #f57c00)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          color: '#fff',
          flexShrink: 0
        }}>
          &#9734;
        </div>
        <div style={{ flex: 1, paddingRight: '20px' }}>
          <h3 style={{ color: '#e65100', margin: '0 0 4px', fontSize: '1.05rem' }}>How was your experience?</h3>
          <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>
            <strong>{volunteerName}</strong> helped you on {alertDate}. Rate your experience to help us improve.
          </p>
        </div>
      </div>

      {/* Star Rating */}
      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#333', fontSize: '0.9rem' }}>
          Rate the volunteer
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StarRating rating={rating} onRate={setRating} disabled={submitting} />
          {rating > 0 && (
            <span style={{ color: '#666', fontSize: '0.85rem' }}>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          )}
        </div>
      </div>

      {/* Feedback Text */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', color: '#333', fontSize: '0.9rem' }}>
          Comments (optional)
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your experience..."
          disabled={submitting}
          rows="2"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '0.9rem',
            resize: 'vertical',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#ff9800'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
      </div>

      {error && (
        <p style={{ color: '#c62828', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="btn btn-primary"
          style={{
            opacity: (submitting || rating === 0) ? 0.6 : 1,
            cursor: (submitting || rating === 0) ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
        <button
          onClick={handleDismiss}
          disabled={submitting}
          className="btn btn-outline"
          style={{ fontSize: '0.9rem' }}
        >
          Skip
        </button>
      </div>

      {/* Badge for multiple pending */}
      {pendingAlerts.length > 1 && (
        <p style={{ color: '#999', fontSize: '0.75rem', marginTop: '12px', textAlign: 'right' }}>
          {currentIndex + 1} of {pendingAlerts.length} pending reviews
        </p>
      )}
    </div>
  );
};

export default FeedbackBanner;
