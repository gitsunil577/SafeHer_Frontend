import React, { useState } from 'react';
import Modal from '../common/Modal';

const VolunteerManagement = () => {
  const [volunteers, setVolunteers] = useState([
    { id: 1, name: 'John Doe', email: 'john@email.com', phone: '+91-9876543220', status: 'active', verified: true, responses: 45, rating: 4.8, joined: '2023-11-15' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@email.com', phone: '+91-9876543221', status: 'active', verified: true, responses: 32, rating: 4.9, joined: '2023-12-01' },
    { id: 3, name: 'Mike Johnson', email: 'mike@email.com', phone: '+91-9876543222', status: 'pending', verified: false, responses: 0, rating: 0, joined: '2024-01-18' },
    { id: 4, name: 'Emily Brown', email: 'emily@email.com', phone: '+91-9876543223', status: 'active', verified: true, responses: 28, rating: 4.7, joined: '2023-12-10' },
    { id: 5, name: 'David Wilson', email: 'david@email.com', phone: '+91-9876543224', status: 'pending', verified: false, responses: 0, rating: 0, joined: '2024-01-20' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || volunteer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const verifyVolunteer = (volunteerId) => {
    setVolunteers(volunteers.map(volunteer =>
      volunteer.id === volunteerId
        ? { ...volunteer, verified: true, status: 'active' }
        : volunteer
    ));
  };

  const rejectVolunteer = (volunteerId) => {
    if (window.confirm('Are you sure you want to reject this volunteer application?')) {
      setVolunteers(volunteers.filter(v => v.id !== volunteerId));
    }
  };

  const toggleStatus = (volunteerId) => {
    setVolunteers(volunteers.map(volunteer =>
      volunteer.id === volunteerId
        ? { ...volunteer, status: volunteer.status === 'active' ? 'inactive' : 'active' }
        : volunteer
    ));
  };

  const viewDetails = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsModalOpen(true);
  };

  const pendingCount = volunteers.filter(v => v.status === 'pending').length;

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <div>
            <h2>Volunteer Management</h2>
            <p style={{ color: '#666' }}>Verify and manage platform volunteers</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="badge badge-info">{volunteers.length} Total</span>
            {pendingCount > 0 && (
              <span className="badge badge-warning">{pendingCount} Pending</span>
            )}
          </div>
        </div>

        {/* Pending Verifications Alert */}
        {pendingCount > 0 && (
          <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <strong>⚠️ {pendingCount} volunteer application(s) pending verification</strong>
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
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

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
                <tr key={volunteer.id}>
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
                        {volunteer.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{volunteer.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>{volunteer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{volunteer.phone}</td>
                  <td>
                    <span className={`badge badge-${
                      volunteer.status === 'active' ? 'success' :
                      volunteer.status === 'pending' ? 'warning' : 'danger'
                    }`}>
                      {volunteer.status}
                    </span>
                  </td>
                  <td>
                    {volunteer.verified ? (
                      <span style={{ color: '#4caf50' }}>✓ Verified</span>
                    ) : (
                      <span style={{ color: '#ff9800' }}>Pending</span>
                    )}
                  </td>
                  <td>{volunteer.responses}</td>
                  <td>
                    {volunteer.rating > 0 ? (
                      <span>⭐ {volunteer.rating}</span>
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
                            onClick={() => verifyVolunteer(volunteer.id)}
                          >
                            Verify
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => rejectVolunteer(volunteer.id)}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          className={`btn btn-sm ${volunteer.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => toggleStatus(volunteer.id)}
                        >
                          {volunteer.status === 'active' ? 'Deactivate' : 'Activate'}
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
                {selectedVolunteer.name.charAt(0)}
              </div>
              <h3>{selectedVolunteer.name}</h3>
              <p style={{ color: '#666' }}>{selectedVolunteer.email}</p>
              {selectedVolunteer.verified && (
                <span className="badge badge-success">Verified Volunteer</span>
              )}
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Phone</span>
                <strong>{selectedVolunteer.phone}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Status</span>
                <span className={`badge badge-${selectedVolunteer.status === 'active' ? 'success' : 'warning'}`}>
                  {selectedVolunteer.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Total Responses</span>
                <strong>{selectedVolunteer.responses}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Rating</span>
                <strong>{selectedVolunteer.rating > 0 ? `⭐ ${selectedVolunteer.rating}` : 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <span>Joined</span>
                <strong>{selectedVolunteer.joined}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }}>View Full Profile</button>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VolunteerManagement;
