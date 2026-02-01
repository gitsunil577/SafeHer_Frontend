import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and user on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching user data
          const response = await api.getMe();
          if (response.success) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.login({ email, password });

    if (response.success) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      return response.data;
    }

    throw new Error(response.message || 'Login failed');
  };

  const register = async (userData) => {
    const response = await api.register(userData);

    if (response.success) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      return response.data;
    }

    throw new Error(response.message || 'Registration failed');
  };

  const registerVolunteer = async (volunteerData) => {
    const response = await api.registerVolunteer(volunteerData);

    if (response.success) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      return response.data;
    }

    throw new Error(response.message || 'Volunteer registration failed');
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // Logout even if API call fails
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      registerVolunteer,
      updateUser,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
