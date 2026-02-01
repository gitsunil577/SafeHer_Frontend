const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async registerVolunteer(volunteerData) {
    return this.request('/auth/register/volunteer', {
      method: 'POST',
      body: JSON.stringify(volunteerData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/updatedetails', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updatePassword(passwordData) {
    return this.request('/auth/updatepassword', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async updateLocation(locationData) {
    return this.request('/auth/location', {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  }

  // Volunteer endpoints
  async getNearbyVolunteers(latitude, longitude, radius = 5000) {
    const params = new URLSearchParams();
    if (latitude) params.append('latitude', latitude);
    if (longitude) params.append('longitude', longitude);
    if (radius) params.append('radius', radius);
    return this.request(`/volunteers/nearby?${params.toString()}`);
  }

  async getVolunteersList() {
    return this.request('/volunteers/list');
  }

  async getVolunteerProfile() {
    return this.request('/volunteers/profile');
  }

  async updateVolunteerProfile(profileData) {
    return this.request('/volunteers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async toggleVolunteerDuty() {
    return this.request('/volunteers/duty', {
      method: 'PUT',
    });
  }

  async updateVolunteerLocation(locationData) {
    return this.request('/volunteers/location', {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  }

  async getVolunteerDashboard() {
    return this.request('/volunteers/dashboard');
  }

  // Alert/SOS endpoints
  async createAlert(alertData) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async getAlert(alertId) {
    return this.request(`/alerts/${alertId}`);
  }

  async cancelAlert(alertId) {
    return this.request(`/alerts/${alertId}/cancel`, {
      method: 'PUT',
    });
  }

  async resolveAlert(alertId, data) {
    return this.request(`/alerts/${alertId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateAlertLocation(alertId, locationData) {
    return this.request(`/alerts/${alertId}/location`, {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  }

  async getMyAlerts(status = '') {
    const params = status ? `?status=${status}` : '';
    return this.request(`/alerts/my${params}`);
  }

  async getActiveAlert() {
    return this.request('/alerts/active');
  }
}

const api = new ApiService();
export default api;
