import React, { useState } from 'react';
import Modal from '../common/Modal';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Priya Sharma', email: 'priya@email.com', phone: '+91-9876543210', status: 'active', verified: true, joined: '2024-01-10', alerts: 2 },
    { id: 2, name: 'Anjali Gupta', email: 'anjali@email.com', phone: '+91-9876543211', status: 'active', verified: true, joined: '2024-01-08', alerts: 5 },
    { id: 3, name: 'Meera Patel', email: 'meera@email.com', phone: '+91-9876543212', status: 'active', verified: false, joined: '2024-01-15', alerts: 0 },
    { id: 4, name: 'Kavya Reddy', email: 'kavya@email.com', phone: '+91-9876543213', status: 'inactive', verified: true, joined: '2023-12-20', alerts: 3 },
    { id: 5, name: 'Divya Singh', email: 'divya@email.com', phone: '+91-9876543214', status: 'active', verified: true, joined: '2024-01-12', alerts: 1 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <div>
            <h2>User Management</h2>
            <p style={{ color: '#666' }}>Manage registered users on the platform</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="badge badge-info">{users.length} Total Users</span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <select
            className="form-control"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

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
              {filteredUsers.map((user) => (
                <tr key={user.id}>
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
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{user.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`badge badge-${user.status === 'active' ? 'success' : 'warning'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.verified ? (
                      <span style={{ color: '#4caf50' }}>✓ Yes</span>
                    ) : (
                      <span style={{ color: '#ff9800' }}>✗ No</span>
                    )}
                  </td>
                  <td>{user.alerts}</td>
                  <td>{user.joined}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => viewUserDetails(user)}
                      >
                        View
                      </button>
                      <button
                        className={`btn btn-sm ${user.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No users found matching your criteria.</p>
          </div>
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
                {selectedUser.name.charAt(0)}
              </div>
              <h3>{selectedUser.name}</h3>
              <p style={{ color: '#666' }}>{selectedUser.email}</p>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Phone</span>
                <strong>{selectedUser.phone}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Status</span>
                <span className={`badge badge-${selectedUser.status === 'active' ? 'success' : 'warning'}`}>
                  {selectedUser.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Verified</span>
                <strong>{selectedUser.verified ? 'Yes' : 'No'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Total Alerts</span>
                <strong>{selectedUser.alerts}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Joined</span>
                <strong>{selectedUser.joined}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }}>View Full Profile</button>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
