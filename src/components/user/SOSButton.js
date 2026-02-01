import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';

const SOSButton = ({ onTrigger, onAlertUpdate }) => {
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [alertId, setAlertId] = useState(null);
  const [alertStatus, setAlertStatus] = useState(null);
  const [respondingVolunteer, setRespondingVolunteer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liveLocationEnabled, setLiveLocationEnabled] = useState(true);
  const [locationUpdateCount, setLocationUpdateCount] = useState(0);

  const locationWatchRef = useRef(null);
  const locationIntervalRef = useRef(null);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setLocationError('Unable to get location. Please enable location services.');
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Check for existing active alert on mount
  useEffect(() => {
    const checkActiveAlert = async () => {
      try {
        const response = await api.getActiveAlert();
        if (response.success && response.data) {
          setAlertId(response.data._id);
          setAlertStatus(response.data.status);
          setIsActive(true);
          if (response.data.respondingVolunteer?.volunteer?.user) {
            setRespondingVolunteer(response.data.respondingVolunteer.volunteer.user);
          }
          // Start live location sharing if alert is active
          if (liveLocationEnabled) {
            startLiveLocationSharing(response.data._id);
          }
        }
      } catch (err) {
        // No active alert, that's fine
      }
    };
    checkActiveAlert();

    return () => {
      stopLiveLocationSharing();
    };
  }, []);

  // Start live location sharing
  const startLiveLocationSharing = useCallback((activeAlertId) => {
    const alertIdToUse = activeAlertId || alertId;
    if (!alertIdToUse || !liveLocationEnabled) return;

    // Clear any existing watchers
    stopLiveLocationSharing();

    // Use watchPosition for real-time updates
    if (navigator.geolocation) {
      locationWatchRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLocation);
        },
        (error) => {
          console.error('Location watch error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      // Send location updates to server every 10 seconds
      locationIntervalRef.current = setInterval(async () => {
        if (location && alertIdToUse) {
          try {
            await api.updateAlertLocation(alertIdToUse, {
              latitude: location.lat,
              longitude: location.lng
            });
            setLocationUpdateCount(prev => prev + 1);
          } catch (err) {
            console.error('Failed to update location:', err);
          }
        }
      }, 10000);
    }
  }, [alertId, location, liveLocationEnabled]);

  // Stop live location sharing
  const stopLiveLocationSharing = () => {
    if (locationWatchRef.current) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    setLocationUpdateCount(0);
  };

  // Trigger SOS - Create alert in backend
  const triggerSOS = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get fresh location
      const currentLocation = await new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => {
              // Use last known location if fresh one fails
              resolve(location);
            },
            { enableHighAccuracy: true, timeout: 5000 }
          );
        } else {
          resolve(location);
        }
      });

      setLocation(currentLocation);

      // Create alert in backend
      const response = await api.createAlert({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        type: 'sos',
        message: 'Emergency SOS Alert'
      });

      if (response.success) {
        setAlertId(response.data.alertId);
        setAlertStatus('active');
        setIsActive(true);
        setCountdown(null);

        // Start live location sharing
        if (liveLocationEnabled) {
          startLiveLocationSharing(response.data.alertId);
        }

        // Callback to parent
        if (onTrigger) {
          onTrigger({
            alertId: response.data.alertId,
            timestamp: new Date().toISOString(),
            location: currentLocation,
            status: 'active',
            volunteersNotified: response.data.volunteersNotified,
            contactsNotified: response.data.contactsNotified
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to send SOS. Please try again.');
      setIsActive(false);
      setCountdown(null);
    } finally {
      setLoading(false);
    }
  }, [location, liveLocationEnabled, startLiveLocationSharing, onTrigger]);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      triggerSOS();
    }
    return () => clearTimeout(timer);
  }, [countdown, triggerSOS]);

  // Poll for alert status updates
  useEffect(() => {
    let pollInterval;
    if (isActive && alertId) {
      pollInterval = setInterval(async () => {
        try {
          const response = await api.getAlert(alertId);
          if (response.success) {
            setAlertStatus(response.data.status);

            if (response.data.respondingVolunteer?.volunteer?.user) {
              setRespondingVolunteer(response.data.respondingVolunteer.volunteer.user);
            }

            if (onAlertUpdate) {
              onAlertUpdate(response.data);
            }

            // Stop polling if alert is resolved or cancelled
            if (response.data.status === 'resolved' || response.data.status === 'cancelled') {
              setIsActive(false);
              stopLiveLocationSharing();
            }
          }
        } catch (err) {
          console.error('Failed to fetch alert status:', err);
        }
      }, 5000); // Poll every 5 seconds
    }
    return () => clearInterval(pollInterval);
  }, [isActive, alertId, onAlertUpdate]);

  const handlePress = () => {
    if (loading) return;

    if (isActive) {
      // If active, don't start new countdown
      return;
    }

    if (countdown !== null) {
      // Cancel countdown
      setCountdown(null);
    } else {
      // Start 3 second countdown
      setCountdown(3);
    }
  };

  const cancelSOS = async () => {
    if (!alertId) {
      setIsActive(false);
      setCountdown(null);
      return;
    }

    setLoading(true);
    try {
      const response = await api.cancelAlert(alertId);
      if (response.success) {
        setIsActive(false);
        setAlertId(null);
        setAlertStatus(null);
        setRespondingVolunteer(null);
        stopLiveLocationSharing();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel alert');
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (alertStatus) {
      case 'active':
        return 'Searching for nearby volunteers...';
      case 'responding':
        return `${respondingVolunteer?.name || 'A volunteer'} is on the way!`;
      case 'resolved':
        return 'Emergency resolved';
      case 'cancelled':
        return 'Alert cancelled';
      default:
        return 'Alert sent';
    }
  };

  return (
    <div className="sos-container">
      {/* SOS Button */}
      <button
        className={`sos-button ${isActive ? 'active' : ''} ${loading ? 'loading' : ''}`}
        onClick={handlePress}
        disabled={loading}
        style={loading ? { opacity: 0.7, cursor: 'wait' } : {}}
      >
        {loading ? (
          <>
            <span style={{ fontSize: '1.5rem' }}>Sending...</span>
          </>
        ) : countdown !== null ? (
          <>
            <span style={{ fontSize: '3rem' }}>{countdown}</span>
            <span className="sos-text">TAP TO CANCEL</span>
          </>
        ) : isActive ? (
          <>
            <span>SOS</span>
            <span className="sos-text">ALERT ACTIVE</span>
          </>
        ) : (
          <>
            <span>SOS</span>
            <span className="sos-text">TAP FOR HELP</span>
          </>
        )}
      </button>

      {/* Status Section */}
      <div className="sos-status">
        {/* Error Display */}
        {error && (
          <div style={{
            color: '#c62828',
            background: '#ffebee',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        {/* Location Status */}
        {locationError ? (
          <p style={{ color: '#ff9800' }}>{locationError}</p>
        ) : location ? (
          <span className="status-badge status-safe">
            Location Enabled
          </span>
        ) : (
          <span className="status-badge status-warning">Getting Location...</span>
        )}

        {/* Countdown Message */}
        {countdown !== null && (
          <p style={{ marginTop: '20px', color: '#666' }}>
            SOS will be sent in <strong>{countdown}</strong> seconds. Tap again to cancel.
          </p>
        )}

        {/* Active Alert Status */}
        {isActive && (
          <div style={{ marginTop: '20px' }}>
            <div style={{
              background: alertStatus === 'responding' ? '#e8f5e9' : '#ffebee',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <p style={{
                color: alertStatus === 'responding' ? '#2e7d32' : '#c62828',
                fontWeight: 'bold',
                marginBottom: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {alertStatus === 'responding' ? '🚶' : '🚨'}
                {getStatusMessage()}
              </p>

              {alertStatus === 'active' && (
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  Nearby volunteers and emergency contacts have been notified.
                </p>
              )}

              {alertStatus === 'responding' && respondingVolunteer && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ color: '#666', fontSize: '0.875rem' }}>
                    Volunteer: <strong>{respondingVolunteer.name}</strong>
                  </p>
                  {respondingVolunteer.phone && (
                    <a
                      href={`tel:${respondingVolunteer.phone}`}
                      style={{
                        display: 'inline-block',
                        marginTop: '10px',
                        padding: '8px 16px',
                        background: '#4caf50',
                        color: '#fff',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.875rem'
                      }}
                    >
                      📞 Call Volunteer
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Live Location Sharing Status */}
            {liveLocationEnabled && (
              <div style={{
                background: '#e3f2fd',
                padding: '10px 15px',
                borderRadius: '8px',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#4caf50',
                    animation: 'pulse 1.5s infinite'
                  }}></span>
                  <span style={{ fontSize: '0.875rem', color: '#1565c0' }}>
                    Live location sharing active
                  </span>
                </div>
                {locationUpdateCount > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>
                    Updates: {locationUpdateCount}
                  </span>
                )}
              </div>
            )}

            {/* Location Display */}
            {location && (
              <div style={{
                background: '#f5f5f5',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '0.875rem',
                color: '#666'
              }}>
                <strong>Your Location:</strong><br />
                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
              </div>
            )}

            {/* Cancel Button */}
            <button
              className="btn btn-outline"
              onClick={cancelSOS}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Cancelling...' : 'Cancel Emergency'}
            </button>
          </div>
        )}

        {/* Live Location Toggle (when not active) */}
        {!isActive && (
          <div style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#666'
            }}>
              <input
                type="checkbox"
                checked={liveLocationEnabled}
                onChange={(e) => setLiveLocationEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              Enable live location sharing during emergency
            </label>
          </div>
        )}
      </div>

      {/* Inline CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SOSButton;
