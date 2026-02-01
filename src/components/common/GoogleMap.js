import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createIcon = (color, emoji) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const markerIcons = {
  user: createIcon('#e91e63', '📍'),
  Police: createIcon('#1976d2', '👮'),
  Helpdesk: createIcon('#7c4dff', '🏢'),
  Volunteer: createIcon('#4caf50', '🤝'),
  Medical: createIcon('#f44336', '🏥'),
  SafeZone: createIcon('#4caf50', '✓'),
  Transport: createIcon('#ff9800', '🚇'),
  Public: createIcon('#9c27b0', '🏬'),
  ATM: createIcon('#607d8b', '🏧')
};

const defaultCenter = [28.6139, 77.2090]; // Delhi coordinates

// Component to recenter map when user location changes
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
};

const LocationMap = ({
  markers = [],
  safeZones = [],
  showUserLocation = true,
  onMarkerClick,
  height = '400px'
}) => {
  const [userLocation, setUserLocation] = useState(null);

  // Get user's current location
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation(defaultCenter);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, [showUserLocation]);

  const handleMarkerClick = (marker) => {
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  const center = userLocation || defaultCenter;

  return (
    <div style={{ height, borderRadius: '12px', overflow: 'hidden', border: '2px solid #e0e0e0' }}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />

        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker
              position={userLocation}
              icon={markerIcons.user}
              eventHandlers={{
                click: () => handleMarkerClick({
                  id: 'user',
                  name: 'Your Location',
                  type: 'user',
                  position: { lat: userLocation[0], lng: userLocation[1] }
                })
              }}
            >
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>Your Location</strong>
                  <br />
                  <small>{userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}</small>
                </div>
              </Popup>
            </Marker>

            {/* Accuracy circle around user */}
            <Circle
              center={userLocation}
              radius={150}
              pathOptions={{
                fillColor: '#e91e63',
                fillOpacity: 0.1,
                color: '#e91e63',
                opacity: 0.3,
                weight: 1
              }}
            />
          </>
        )}

        {/* Support Team Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.position.lat, marker.position.lng]}
            icon={markerIcons[marker.type] || markerIcons.user}
            eventHandlers={{
              click: () => handleMarkerClick(marker)
            }}
          >
            <Popup>
              <div style={{ minWidth: '150px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{marker.name}</h4>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.875rem', color: '#666' }}>
                  {marker.type}
                </p>
                {marker.distance && (
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.875rem', color: '#4caf50' }}>
                    {marker.distance} away
                  </p>
                )}
                {marker.phone && (
                  <a
                    href={`tel:${marker.phone}`}
                    style={{
                      display: 'inline-block',
                      marginTop: '5px',
                      padding: '5px 10px',
                      background: '#e91e63',
                      color: '#fff',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: '0.875rem'
                    }}
                  >
                    Call Now
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Safe Zone Markers */}
        {safeZones.map((zone) => (
          <Marker
            key={`zone-${zone.id}`}
            position={[zone.position.lat, zone.position.lng]}
            icon={markerIcons[zone.type] || markerIcons.SafeZone}
            eventHandlers={{
              click: () => handleMarkerClick({ ...zone, type: 'SafeZone' })
            }}
          >
            <Popup>
              <div style={{ minWidth: '120px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{zone.name}</h4>
                <p style={{ margin: '0', fontSize: '0.875rem', color: '#666' }}>
                  {zone.type}
                </p>
                {zone.distance && (
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.875rem', color: '#4caf50' }}>
                    {zone.distance} away
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LocationMap;
