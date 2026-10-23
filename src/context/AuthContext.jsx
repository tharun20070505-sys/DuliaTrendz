import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('dulia_token') || null);
  const [loading, setLoading] = useState(true);

  // Load current user profile on app start (supports both httpOnly cookie and Bearer token)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await API.get('/auth/me');
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem('dulia_token');
        }
      } catch (err) {
        // Session expired or unauthenticated
        setUser(null);
        setToken(null);
        localStorage.removeItem('dulia_token');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        if (data.token) {
          localStorage.setItem('dulia_token', data.token);
          setToken(data.token);
        }
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        return { success: true, user: data.user };
      }
    } catch (err) {
      toast.error(err.message || 'Invalid email or password.');
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const { data } = await API.post('/auth/register', { name, email, password, phone });
      if (data.success) {
        if (data.token) {
          localStorage.setItem('dulia_token', data.token);
          setToken(data.token);
        }
        setUser(data.user);
        toast.success('Account created successfully! Welcome to Dulia Trendz.');
        return { success: true, user: data.user };
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      return { success: false, error: err.message };
    }
  };

  /**
   * Google OAuth 2.0 / Google Identity Services login
   * Sends ONLY the Google ID token credential to backend
   * Never stores Google ID token in localStorage
   */
  const googleLogin = async (credentialOrPayload) => {
    try {
      const payload = typeof credentialOrPayload === 'string'
        ? { credential: credentialOrPayload }
        : credentialOrPayload;

      const { data } = await API.post('/auth/google', payload);
      if (data.success) {
        if (data.token) {
          localStorage.setItem('dulia_token', data.token);
          setToken(data.token);
        }
        setUser(data.user);
        toast.success(`Welcome, ${data.user.name}!`);
        return { success: true, user: data.user };
      }
    } catch (err) {
      const msg = err.message || 'Google sign-in could not be completed. Try again.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async (notify = true) => {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('dulia_token');
    setToken(null);
    setUser(null);
    if (notify) toast.success('You have logged out.');
  };

  const updateProfile = async (formData) => {
    try {
      const { data } = await API.put('/auth/profile', formData);
      if (data.success) {
        setUser(data.user);
        toast.success('Profile updated successfully.');
        return { success: true, user: data.user };
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
      return { success: false, error: err.message };
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      if (data.success) setUser(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
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
