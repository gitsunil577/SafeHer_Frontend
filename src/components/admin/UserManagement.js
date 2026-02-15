import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from '../common/Modal';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const debounceRef = useRef(null);

  const fetchUsers = useCallback(async (currentPage, search, status) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.getAdminUsers(currentPage, 20, search, status);
      setUsers(response.data || []);
      setTotalPages(response.pages || 1);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page, searchTerm, filterStatus);
  }, [page, filterStatus, fetchUsers]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, value, filterStatus);
    }, 500);
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setPage(1);
  };

  const toggleUserStatus = async (userId, currentActive) => {
    setActionLoading(userId);
    try {
      await api.updateUserStatus(userId, !currentActive);
      await fetchUsers(page, searchTerm, filterStatus);
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  if (error && users.length === 0) {
    return (
      <div className="container" style={{ padding: '20px 0' }}>
        <div className="card" style={{ background: '#ffebee', textAlign: 'center' }}>
          <p style={{ color: '#c62828' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchUsers(1, '', 'all')}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <div>
            <h2>User Management</h2>
            <p style={{ color: '#666' }}>Manage registered users on the platform</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="badge badge-info">{total} Total Users</span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
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
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading users...</p>
          </div>
        ) : (
          <>
            {/* Users Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Alerts</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: '#e91e63',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold'
                            }}
                          >
                            {user.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500' }}>{user.name}</div>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${user.isActive ? 'success' : 'warning'}`}>
                          {user.isActive ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td>
                        {user.isVerified ? (
                          <span style={{ color: '#4caf50' }}>Yes</span>
                        ) : (
                          <span style={{ color: '#ff9800' }}>No</span>
                        )}
                      </td>
                      <td>{user.alertCount || 0}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => viewUserDetails(user)}
                          >
                            View
                          </button>
                          <button
                            className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => toggleUserStatus(user._id, user.isActive)}
                            disabled={actionLoading === user._id}
                          >
                            {actionLoading === user._id ? '...' : user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No users found matching your criteria.</p>
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
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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

      {/* User Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="User Details"
      >
        {selectedUser && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e91e63, #7c4dff)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  margin: '0 auto 10px'
                }}
              >
                {selectedUser.name?.charAt(0) || '?'}
              </div>
              <h3>{selectedUser.name}</h3>
              <p style={{ color: '#666' }}>{selectedUser.email}</p>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Phone</span>
                <strong>{selectedUser.phone || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Status</span>
                <span className={`badge badge-${selectedUser.isActive ? 'success' : 'warning'}`}>
                  {selectedUser.isActive ? 'active' : 'inactive'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Verified</span>
                <strong>{selectedUser.isVerified ? 'Yes' : 'No'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Total Alerts</span>
                <strong>{selectedUser.alertCount || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Joined</span>
                <strong>{new Date(selectedUser.createdAt).toLocaleDateString()}</strong>
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

export default UserManagement;
