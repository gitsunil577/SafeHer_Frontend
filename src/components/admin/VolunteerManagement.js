import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';

const VolunteerManagement = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchVolunteers = useCallback(async (currentPage, status) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.getAdminVolunteers(currentPage, 20, status);
      setVolunteers(response.data || []);
      setTotalPages(response.pages || 1);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingCount = useCallback(async () => {
    try {
      const response = await api.getAdminVolunteers(1, 1, 'pending');
      setPendingCount(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch pending count:', err);
    }
  }, []);

  useEffect(() => {
    fetchVolunteers(page, filterStatus);
    fetchPendingCount();
  }, [page, filterStatus, fetchVolunteers, fetchPendingCount]);

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setPage(1);
  };

  // Client-side search since backend doesn't support search for volunteers
  const filteredVolunteers = volunteers.filter(vol => {
    if (!searchTerm) return true;
    const name = vol.user?.name?.toLowerCase() || '';
    const email = vol.user?.email?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  const handleVerify = async (volunteerId) => {
    setActionLoading(volunteerId);
    try {
      await api.verifyVolunteer(volunteerId);
      await fetchVolunteers(page, filterStatus);
      await fetchPendingCount();
    } catch (err) {
      alert(err.message || 'Failed to verify volunteer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (volunteerId) => {
    if (!window.confirm('Are you sure you want to reject this volunteer application?')) return;
    setActionLoading(volunteerId);
    try {
      await api.updateVolunteerStatus(volunteerId, 'suspended');
      await fetchVolunteers(page, filterStatus);
      await fetchPendingCount();
    } catch (err) {
      alert(err.message || 'Failed to reject volunteer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (volunteerId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setActionLoading(volunteerId);
    try {
      await api.updateVolunteerStatus(volunteerId, newStatus);
      await fetchVolunteers(page, filterStatus);
    } catch (err) {
      alert(err.message || 'Failed to update volunteer status');
    } finally {
      setActionLoading(null);
    }
  };

  const viewDetails = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsModalOpen(true);
  };

  if (error && volunteers.length === 0) {
    return (
      <div className="container" style={{ padding: '20px 0' }}>
        <div className="card" style={{ background: '#ffebee', textAlign: 'center' }}>
          <p style={{ color: '#c62828' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchVolunteers(1, 'all')}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <div>
            <h2>Volunteer Management</h2>
            <p style={{ color: '#666' }}>Verify and manage platform volunteers</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="badge badge-info">{total} Total</span>
            {pendingCount > 0 && (
              <span className="badge badge-warning">{pendingCount} Pending</span>
            )}
          </div>
        </div>

        {/* Pending Verifications Alert */}
        {pendingCount > 0 && (
          <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <strong>{pendingCount} volunteer application(s) pending verification</strong>
            <p style={{ margin: '5px 0 0', fontSize: '0.875rem', color: '#666' }}>
              Please review and verify pending applications to expand the support network.
            </p>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search volunteers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <select
            className="form-control"
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading volunteers...</p>
          </div>
        ) : (
          <>
            {/* Volunteers Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Volunteer</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Responses</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVolunteers.map((volunteer) => (
                    <tr key={volunteer._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: '#7c4dff',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold'
                            }}
                          >
                            {volunteer.user?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500' }}>{volunteer.user?.name || 'Unknown'}</div>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>{volunteer.user?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>{volunteer.user?.phone || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${
                          volunteer.status === 'active' ? 'success' :
                          volunteer.status === 'pending' ? 'warning' :
                          volunteer.status === 'suspended' ? 'danger' : 'info'
                        }`}>
                          {volunteer.status}
                        </span>
                      </td>
                      <td>
                        {volunteer.isVerified ? (
                          <span style={{ color: '#4caf50' }}>Verified</span>
                        ) : (
                          <span style={{ color: '#ff9800' }}>Pending</span>
                        )}
                      </td>
                      <td>{volunteer.stats?.successfulAssists || 0}</td>
                      <td>
                        {volunteer.stats?.rating > 0 ? (
                          <span>{volunteer.stats.rating.toFixed(1)}</span>
                        ) : (
                          <span style={{ color: '#999' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => viewDetails(volunteer)}
                          >
                            View
                          </button>
                          {volunteer.status === 'pending' ? (
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleVerify(volunteer._id)}
                                disabled={actionLoading === volunteer._id}
                              >
                                {actionLoading === volunteer._id ? '...' : 'Verify'}
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleReject(volunteer._id)}
                                disabled={actionLoading === volunteer._id}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              className={`btn btn-sm ${volunteer.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                              onClick={() => handleToggleStatus(volunteer._id, volunteer.status)}
                              disabled={actionLoading === volunteer._id}
                            >
                              {actionLoading === volunteer._id ? '...' : volunteer.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredVolunteers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No volunteers found matching your criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <button
                  className="btn btn-sm btn-outline"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-sm btn-outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Volunteer Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Volunteer Details"
      >
        {selectedVolunteer && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c4dff, #536dfe)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  margin: '0 auto 10px'
                }}
              >
                {selectedVolunteer.user?.name?.charAt(0) || '?'}
              </div>
              <h3>{selectedVolunteer.user?.name || 'Unknown'}</h3>
              <p style={{ color: '#666' }}>{selectedVolunteer.user?.email || ''}</p>
              {selectedVolunteer.isVerified && (
                <span className="badge badge-success">Verified Volunteer</span>
              )}
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Phone</span>
                <strong>{selectedVolunteer.user?.phone || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Status</span>
                <span className={`badge badge-${selectedVolunteer.status === 'active' ? 'success' : 'warning'}`}>
                  {selectedVolunteer.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Total Responses</span>
                <strong>{selectedVolunteer.stats?.successfulAssists || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Rating</span>
                <strong>{selectedVolunteer.stats?.rating > 0 ? selectedVolunteer.stats.rating.toFixed(1) : 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>On Duty</span>
                <strong>{selectedVolunteer.isOnDuty ? 'Yes' : 'No'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Joined</span>
                <strong>{new Date(selectedVolunteer.createdAt).toLocaleDateString()}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VolunteerManagement;
