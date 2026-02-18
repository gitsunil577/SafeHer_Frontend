import React, { useState, useEffect, useCallback } from 'react';
import LocationMap from '../common/GoogleMap';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

const NearbySupport = () => {
  const { on, off, isConnected } = useSocket();
  const [userLocation, setUserLocation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Delhi coordinates
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    }
  }, []);

  // Fetch nearby volunteers when user location is available
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setLoading(true);
        setError(null);
        let response;

        if (userLocation) {
          try {
            response = await api.getNearbyVolunteers(userLocation.lat, userLocation.lng, 10000);
          } catch (nearbyErr) {
            // Geospatial query can fail, fallback to list
            console.warn('Nearby query failed, falling back to list:', nearbyErr);
            response = await api.getVolunteersList();
          }
        } else {
          response = await api.getVolunteersList();
        }

        if (response.success) {
          // Format for map - include volunteers even without position
          const formattedVolunteers = response.data.map(vol => ({
            ...vol,
            type: 'Volunteer',
            phone: vol.phone || 'N/A'
          }));
          setVolunteers(formattedVolunteers);
        }
      } catch (err) {
        console.error('Error fetching volunteers:', err);
        setError('Unable to fetch volunteers');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();

    // Fallback polling every 60 seconds (socket handles instant updates)
    const interval = setInterval(fetchVolunteers, 60000);
    return () => clearInterval(interval);
  }, [userLocation]);

  // Real-time volunteer status updates via Socket.IO
  useEffect(() => {
    const handleVolunteerStatusUpdate = (data) => {
      console.log('Volunteer status update received:', data);
      setVolunteers(prev => {
        if (data.isOnDuty) {
          // Volunteer went on-duty: update existing or add new
          const exists = prev.find(v => v.id === data.volunteerId);
          if (exists) {
            return prev.map(vol =>
              vol.id === data.volunteerId ? { ...vol, isOnDuty: true } : vol
            );
          }
          return [...prev, {
            id: data.volunteerId,
            name: data.volunteerName || 'SafeHer Volunteer',
            type: 'Volunteer',
            isOnDuty: true,
            position: data.location || null,
            rating: 0,
            successfulAssists: 0,
            phone: 'N/A'
          }];
        } else {
          // Volunteer went off-duty: remove from list
          return prev.filter(vol => vol.id !== data.volunteerId);
        }
      });
    };

    const handleVolunteerMoved = (data) => {
      setVolunteers(prev => prev.map(vol => {
        if (vol.id === data.volunteerId) {
          return {
            ...vol,
            position: { lat: data.latitude, lng: data.longitude }
          };
        }
        return vol;
      }));
    };

    on('volunteer_status_update', handleVolunteerStatusUpdate);
    on('volunteer_moved', handleVolunteerMoved);

    return () => {
      off('volunteer_status_update', handleVolunteerStatusUpdate);
      off('volunteer_moved', handleVolunteerMoved);
    };
  }, [on, off]);

  // Generate nearby locations based on user's position
  const generateNearbyLocation = (baseLat, baseLng, offsetLat, offsetLng) => ({
    lat: baseLat + offsetLat,
    lng: baseLng + offsetLng
  });

  const baseLocation = userLocation || { lat: 28.6139, lng: 77.2090 };

  // Static support teams (police stations, hospitals, etc.)
  const supportTeams = [
    {
      id: 'police-1',
      name: 'City Police Station',
      type: 'Police',
      distance: '0.5 km',
      phone: '100',
      status: 'available',
      position: generateNearbyLocation(baseLocation.lat, baseLocation.lng, 0.004, 0.003)
    },
    {
      id: 'helpdesk-1',
      name: 'Women Helpdesk - MG Road',
      type: 'Helpdesk',
      distance: '1.2 km',
      phone: '1091',
      status: 'available',
      position: generateNearbyLocation(baseLocation.lat, baseLocation.lng, -0.008, 0.006)
    },
    {
      id: 'medical-1',
      name: 'City Hospital',
      type: 'Medical',
      distance: '2.1 km',
      phone: '102',
      status: 'available',
      position: generateNearbyLocation(baseLocation.lat, baseLocation.lng, -0.012, -0.008)
    },
    {
      id: 'police-2',
      name: 'Women Police Station',
      type: 'Police',
      distance: '1.5 km',
      phone: '100',
      status: 'available',
      position: generateNearbyLocation(baseLocation.lat, baseLocation.lng, 0.010, 0.008)
    }
  ];

  // Combine static support teams with real volunteers
  const allSupportTeams = [
    ...supportTeams,
    ...volunteers
      .filter(vol => vol.isOnDuty)
      .map(vol => ({
        ...vol,
        status: 'on-duty'
      }))
  ];

  const safeZones = [
    {
      id: 1,
      name: 'Metro Station - MG Road',
      type: 'Transport',
      distance: '0.3 km',
      position: generateNearbyLocation(baseLocation.lat, baseLocation.lng, 0.002, 0.002)
    },
    {
      id: 2,
      name: 'Shopping Mall',
      type: 'Public',
      distance: '0.7 km',
      position: generateNearbyLocation(baseLocation.lat, baseLocation.lng, -0.005, 0.004)
    },
    {
      id: 3,
      name: 'ATM Booth - ICICI Bank',
      type: 'ATM',
      distance: '0.2 km',
      position: generateNearbyLocation(baseLocation.lat, baseLocation.lng, 0.001, -0.001)
    },
    {
      id: 4,
      name: 'Bus Terminal',
      type: 'Transport',
      distance: '0.9 km',
      position: generateNearbyLocation(baseLocation.lat, baseLocation.lng, 0.006, 0.005)
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Police': return '👮';
      case 'Helpdesk': return '🏢';
      case 'Volunteer': return '🤝';
      case 'Medical': return '🏥';
      case 'Transport': return '🚇';
      case 'Public': return '🏬';
      case 'ATM': return '🏧';
      default: return '📍';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Police': return '#1976d2';
      case 'Helpdesk': return '#7c4dff';
      case 'Volunteer': return '#4caf50';
      case 'Medical': return '#f44336';
      default: return '#666';
    }
  };

  const handleMarkerClick = (marker) => {
    setSelectedItem(marker);
  };

  const filteredSupport = activeTab === 'all'
    ? allSupportTeams
    : allSupportTeams.filter(t => t.type.toLowerCase() === activeTab);

  const onDutyCount = volunteers.filter(v => v.isOnDuty).length;

  return (
    <div>
      {/* Map Section */}
      <div style={{ marginBottom: '20px' }}>
        <LocationMap
          markers={allSupportTeams}
          safeZones={safeZones}
          showUserLocation={true}
          userPosition={userLocation}
          onMarkerClick={handleMarkerClick}
          height="350px"
        />
      </div>

      {/* Map Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '20px',
        padding: '10px 15px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.875rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#e91e63' }}></span>
          <span>Your Location</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.875rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1976d2' }}></span>
          <span>Police</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.875rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#7c4dff' }}></span>
          <span>Helpdesk</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.875rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4caf50' }}></span>
          <span>Volunteer ({volunteers.length} registered, {onDutyCount} on duty)</span>
          {isConnected && (
            <span style={{
              background: '#e8f5e9',
              color: '#2e7d32',
              padding: '1px 6px',
              borderRadius: '8px',
              fontSize: '0.65rem',
              fontWeight: '700',
              marginLeft: '4px'
            }}>
              LIVE
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.875rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f44336' }}></span>
          <span>Medical</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        overflowX: 'auto',
        paddingBottom: '5px'
      }}>
        {['all', 'volunteer', 'police', 'helpdesk', 'medical'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '20px',
              background: activeTab === tab ? '#e91e63' : '#f0f0f0',
              color: activeTab === tab ? '#fff' : '#333',
              cursor: 'pointer',
              fontWeight: '500',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'all' ? 'All Support' : tab}
            {tab === 'volunteer' && ` (${onDutyCount})`}
          </button>
        ))}
      </div>

      <div className="nearby-support-grid">
        {/* Support Teams & Volunteers */}
        <div>
          <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Nearby Support Teams</span>
            <span style={{
              background: '#e91e63',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.75rem'
            }}>
              {filteredSupport.length}
            </span>
          </h4>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Loading volunteers...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#f44336' }}>
              {error}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
              {filteredSupport.map((team) => (
                <div
                  key={team.id}
                  onClick={() => setSelectedItem(team)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '15px',
                    background: selectedItem?.id === team.id ? '#fff3e0' : '#f8f9fa',
                    borderRadius: '8px',
                    gap: '15px',
                    cursor: 'pointer',
                    border: selectedItem?.id === team.id ? '2px solid #ff9800' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    background: getTypeColor(team.type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    {getTypeIcon(team.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {team.name}
                      {team.type === 'Volunteer' && team.isOnDuty && (
                        <span style={{
                          background: '#4caf50',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 'bold'
                        }}>
                          ON DUTY
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      {team.type}
                      {team.type === 'Volunteer' && team.rating > 0 && (
                        <span style={{ marginLeft: '8px' }}>⭐ {team.rating.toFixed(1)}</span>
                      )}
                      {team.type === 'Volunteer' && team.successfulAssists > 0 && (
                        <span style={{ marginLeft: '8px', color: '#4caf50' }}>
                          • {team.successfulAssists} assists
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                      {team.distance && (
                        <span style={{
                          background: '#e3f2fd',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          color: '#1976d2'
                        }}>
                          {team.distance}
                        </span>
                      )}
                      <span style={{
                        color: (team.isOnDuty || team.status === 'on-duty') ? '#4caf50' : (team.status === 'available' ? '#4caf50' : '#ff9800'),
                        fontSize: '0.875rem'
                      }}>
                        ● {(team.isOnDuty || team.status === 'on-duty') ? 'On Duty' : (team.status === 'available' ? 'Available' : 'Off Duty')}
                      </span>
                    </div>
                    {team.skills && team.skills.length > 0 && (
                      <div style={{ marginTop: '5px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {team.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} style={{
                            background: '#e8f5e9',
                            color: '#2e7d32',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem'
                          }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {team.phone && team.phone !== 'N/A' && (
                    <a
                      href={`tel:${team.phone}`}
                      className="btn btn-sm btn-primary"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: '#e91e63',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}
                    >
                      Call
                    </a>
                  )}
                </div>
              ))}

              {filteredSupport.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No {activeTab === 'all' ? 'support teams' : activeTab + 's'} found nearby
                </div>
              )}
            </div>
          )}
        </div>

        {/* Safe Zones */}
        <div>
          <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Nearby Safe Zones</span>
            <span style={{
              background: '#4caf50',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.75rem'
            }}>
              {safeZones.length}
            </span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {safeZones.map((zone) => (
              <div
                key={zone.id}
                onClick={() => setSelectedItem({ ...zone, type: 'SafeZone' })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  background: selectedItem?.id === zone.id ? '#e8f5e9' : '#f1f8e9',
                  borderRadius: '8px',
                  gap: '15px',
                  cursor: 'pointer',
                  border: selectedItem?.id === zone.id ? '2px solid #4caf50' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(zone.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>{zone.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>{zone.type}</div>
                </div>
                <span style={{
                  background: '#c8e6c9',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: '#2e7d32',
                  fontWeight: '500'
                }}>
                  {zone.distance}
                </span>
              </div>
            ))}
          </div>

          {/* Volunteer Stats */}
          {volunteers.length > 0 && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#e8f5e9',
              borderRadius: '8px'
            }}>
              <h5 style={{ marginBottom: '10px', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🤝</span> SafeHer Volunteer Network
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ textAlign: 'center', padding: '10px', background: '#fff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>
                    {volunteers.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>Registered</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: '#fff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196f3' }}>
                    {onDutyCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>On Duty Now</div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Numbers */}
          <div style={{ marginTop: '20px', padding: '15px', background: '#ffebee', borderRadius: '8px' }}>
            <h5 style={{ marginBottom: '10px', color: '#c62828', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚨</span> Emergency Numbers
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <a href="tel:100" style={{
                color: '#333',
                textDecoration: 'none',
                padding: '8px',
                background: '#fff',
                borderRadius: '6px',
                display: 'block'
              }}>
                <strong>Police:</strong> 100
              </a>
              <a href="tel:1091" style={{
                color: '#333',
                textDecoration: 'none',
                padding: '8px',
                background: '#fff',
                borderRadius: '6px',
                display: 'block'
              }}>
                <strong>Women:</strong> 1091
              </a>
              <a href="tel:102" style={{
                color: '#333',
                textDecoration: 'none',
                padding: '8px',
                background: '#fff',
                borderRadius: '6px',
                display: 'block'
              }}>
                <strong>Ambulance:</strong> 102
              </a>
              <a href="tel:112" style={{
                color: '#333',
                textDecoration: 'none',
                padding: '8px',
                background: '#fff',
                borderRadius: '6px',
                display: 'block'
              }}>
                <strong>Emergency:</strong> 112
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbySupport;
