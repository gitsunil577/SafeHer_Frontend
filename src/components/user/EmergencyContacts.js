import React, { useState } from 'react';
import Modal from '../common/Modal';

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Mom', phone: '+1234567890', relation: 'Mother', primary: true },
    { id: 2, name: 'Dad', phone: '+1234567891', relation: 'Father', primary: false },
    { id: 3, name: 'Best Friend', phone: '+1234567892', relation: 'Friend', primary: false }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relation: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openAddModal = () => {
    setEditingContact(null);
    setFormData({ name: '', phone: '', relation: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingContact) {
      setContacts(contacts.map(c =>
        c.id === editingContact.id ? { ...c, ...formData } : c
      ));
    } else {
      setContacts([...contacts, {
        id: Date.now(),
        ...formData,
        primary: contacts.length === 0
      }]);
    }

    setIsModalOpen(false);
  };

  const deleteContact = (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const setPrimary = (id) => {
    setContacts(contacts.map(c => ({
      ...c,
      primary: c.id === id
    })));
  };

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '20px' }}>
          <div>
            <h2>Emergency Contacts</h2>
            <p style={{ color: '#666' }}>These contacts will be notified during an emergency</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Contact
          </button>
        </div>

        {contacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p style={{ fontSize: '3rem', marginBottom: '10px' }}>📞</p>
            <p>No emergency contacts added yet.</p>
            <p>Add contacts who should be notified during emergencies.</p>
          </div>
        ) : (
          <div className="contact-list">
            {contacts.map((contact) => (
              <div key={contact.id} className="contact-item" style={{ position: 'relative' }}>
                {contact.primary && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '10px',
                    background: '#e91e63',
                    color: 'white',
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    PRIMARY
                  </span>
                )}
                <div className="contact-avatar">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="contact-info">
                  <div className="contact-name">{contact.name}</div>
                  <div className="contact-phone">{contact.phone}</div>
                  <div className="contact-relation">{contact.relation}</div>
                </div>
                <div className="contact-actions">
                  {!contact.primary && (
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setPrimary(contact.id)}
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => openEditModal(contact)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteContact(contact.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="card" style={{ marginTop: '20px', background: '#e3f2fd' }}>
        <h4 style={{ marginBottom: '10px' }}>How it works</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '8px' }}>
            <span style={{ marginRight: '10px' }}>1.</span>
            When you trigger an SOS alert, all your emergency contacts will be notified
          </li>
          <li style={{ marginBottom: '8px' }}>
            <span style={{ marginRight: '10px' }}>2.</span>
            Your primary contact will receive a phone call
          </li>
          <li style={{ marginBottom: '8px' }}>
            <span style={{ marginRight: '10px' }}>3.</span>
            All contacts will receive your live location via SMS
          </li>
          <li>
            <span style={{ marginRight: '10px' }}>4.</span>
            You can add up to 5 emergency contacts
          </li>
        </ul>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contact name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Relationship</label>
            <select
              name="relation"
              className="form-control"
              value={formData.relation}
              onChange={handleChange}
              required
            >
              <option value="">Select Relationship</option>
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Spouse">Spouse</option>
              <option value="Sibling">Sibling</option>
              <option value="Friend">Friend</option>
              <option value="Colleague">Colleague</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {editingContact ? 'Save Changes' : 'Add Contact'}
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

export default EmergencyContacts;
