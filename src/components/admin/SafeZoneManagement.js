import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';

const SAFE_ZONE_TYPES = ['police', 'hospital', 'helpdesk', 'transport', 'public', 'atm', 'other'];

const emptyForm = {
  name: '',
  type: 'police',
  latitude: '',
  longitude: '',
  address: '',
  phone: '',
  is24Hours: true,
  openTime: '09:00',
  closeTime: '21:00',
  services: ''
};

const SafeZoneManagement = () => {
  const [safeZones, setSafeZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchSafeZones = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.getAdminSafeZones();
      setSafeZones(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load safe zones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSafeZones();
  }, [fetchSafeZones]);

  const filteredZones = safeZones.filter(zone => {
    const matchesSearch = !searchTerm ||
      zone.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || zone.type === filterType;
    return matchesSearch && matchesType;
  });

  const openCreateModal = () => {
    setEditingZone(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name || '',
      type: zone.type || 'other',
      latitude: zone.location?.coordinates?.[1]?.toString() || '',
      longitude: zone.location?.coordinates?.[0]?.toString() || '',
      address: zone.location?.address || '',
      phone: zone.phone || '',
      is24Hours: zone.operatingHours?.is24Hours ?? true,
      openTime: zone.operatingHours?.open || '09:00',
      closeTime: zone.operatingHours?.close || '21:00',
      services: Array.isArray(zone.services) ? zone.services.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        address: formData.address,
        phone: formData.phone,
        operatingHours: {
          is24Hours: formData.is24Hours,
          open: formData.is24Hours ? undefined : formData.openTime,
          close: formData.is24Hours ? undefined : formData.closeTime
        },
        services: formData.services
          ? formData.services.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };

      if (editingZone) {
        await api.updateSafeZone(editingZone._id, payload);
      } else {
        await api.createSafeZone(payload);
      }

      setIsModalOpen(false);
      await fetchSafeZones();
    } catch (err) {
      alert(err.message || 'Failed to save safe zone');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (zoneId) => {
    setActionLoading(true);
    try {
      await api.deleteSafeZone(zoneId);
      setDeleteConfirm(null);
      await fetchSafeZones();
    } catch (err) {
      alert(err.message || 'Failed to delete safe zone');
    } finally {
      setActionLoading(false);
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'police': return '#1565c0';
      case 'hospital': return '#c62828';
      case 'helpdesk': return '#7c4dff';
      case 'transport': return '#00838f';
      case 'public': return '#2e7d32';
      case 'atm': return '#ef6c00';
      default: return '#666';
    }
  };

  if (error && safeZones.length === 0) {
    return (
      <div className="container" style={{ padding: '20px 0' }}>
        <div className="card" style={{ background: '#ffebee', textAlign: 'center' }}>
          <p style={{ color: '#c62828' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchSafeZones}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <div>
            <h2>Safe Zone Management</h2>
            <p style={{ color: '#666' }}>Manage safe zones and verified locations</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="badge badge-info">{safeZones.length} Total</span>
            <button className="btn btn-primary" onClick={openCreateModal}>
              + Add Safe Zone
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <select
            className="form-control"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All Types</option>
            {SAFE_ZONE_TYPES.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading safe zones...</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Address</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredZones.map((zone) => (
                    <tr key={zone._id}>
                      <td style={{ fontWeight: '500' }}>{zone.name}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          color: 'white',
                          background: getTypeBadgeColor(zone.type),
                          fontSize: '0.8rem'
                        }}>
                          {zone.type}
                        </span>
                      </td>
                      <td>{zone.location?.address || 'N/A'}</td>
                      <td>{zone.phone || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${zone.isVerified ? 'success' : 'warning'}`}>
                          {zone.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => openEditModal(zone)}
                          >
                            Edit
                          </button>
                          {deleteConfirm === zone._id ? (
                            <>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(zone._id)}
                                disabled={actionLoading}
                              >
                                Confirm
                              </button>
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => setDeleteConfirm(zone._id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredZones.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No safe zones found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingZone ? 'Edit Safe Zone' : 'Add New Safe Zone'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Type *</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) => handleFormChange('type', e.target.value)}
                required
              >
                {SAFE_ZONE_TYPES.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Latitude *</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  value={formData.latitude}
                  onChange={(e) => handleFormChange('latitude', e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Longitude *</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  value={formData.longitude}
                  onChange={(e) => handleFormChange('longitude', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Address</label>
              <input
                type="text"
                className="form-control"
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Phone</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.is24Hours}
                  onChange={(e) => handleFormChange('is24Hours', e.target.checked)}
                />
                <span style={{ fontWeight: '500' }}>Open 24 Hours</span>
              </label>
            </div>

            {!formData.is24Hours && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Open Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.openTime}
                    onChange={(e) => handleFormChange('openTime', e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Close Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.closeTime}
                    onChange={(e) => handleFormChange('closeTime', e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Services (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. first aid, counseling, shelter"
                value={formData.services}
                onChange={(e) => handleFormChange('services', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : editingZone ? 'Update Safe Zone' : 'Create Safe Zone'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SafeZoneManagement;
