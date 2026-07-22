import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null' || !token.trim()) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      let payload = null;
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          payload = JSON.parse(window.atob(base64));
        }
      } catch (e) {}

      // 1. Check Employee Auth if token belongs to employee
      if (payload?.role === 'admin' || payload?.role === 'manager' || payload?.entityModel === 'Employee') {
        try {
          const { data } = await apiClient.get('/employee-auth/me');
          if (data?.identity?.role) {
            setUser({
              id: data.identity.id || null,
              username: data.identity.username,
              role: data.identity.role,
              entityModel: 'Employee'
            });
            setUserProfile(null);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      // 2. Check Organization Auth if token entityModel is Organization
      const payloadRoleLower = (payload?.role || '').toLowerCase();
      if (payload?.entityModel === 'Organization' || ['hospital', 'clinic', 'laboratory', 'pharmacy', 'organization', 'org', 'facility'].includes(payloadRoleLower)) {
        try {
          const { data } = await apiClient.get('/org/me');
          if (data?.account) {
            setUser({
              id: data.account.accountId || data.account._id,
              username: data.account.profile?.name || data.account.email,
              role: data.account.role || payloadRoleLower || 'hospital',
              entityModel: 'Organization'
            });
            setUserProfile(data.account.profile || {});
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      // 3. Check User Auth (Patient / Doctor)
      try {
        const { data } = await apiClient.get('/user/me');
        if (data?.account && data.account.entityModel === 'User') {
          setUser({
            id: data.account._id,
            username: data.userProfile?.name || data.account.email,
            role: data.account.role,
            entityModel: 'User'
          });
          setUserProfile(data.userProfile);
          setLoading(false);
          return;
        }
      } catch (e) {}

      // Fallback 1: Check Organization Auth if not tried yet
      try {
        const { data } = await apiClient.get('/org/me');
        if (data?.account && data.account.profile && data.account.entityModel === 'Organization') {
          setUser({
            id: data.account.accountId || data.account._id,
            username: data.account.profile?.name || data.account.email,
            role: data.account.role || 'hospital',
            entityModel: 'Organization'
          });
          setUserProfile(data.account.profile);
          setLoading(false);
          return;
        }
      } catch (e) {}

      // Fallback 2: Check Employee Auth
      try {
        const { data } = await apiClient.get('/employee-auth/me');
        if (data?.identity?.role) {
          setUser({
            id: data.identity.id || null,
            username: data.identity.username,
            role: data.identity.role,
            entityModel: 'Employee'
          });
          setUserProfile(null);
          setLoading(false);
          return;
        }
      } catch (e) {}

      // Clean up invalid session
      localStorage.removeItem('token');
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const loginUnified = async (emailOrUsername, password) => {
    setError(null);
    try {
      const { data } = await apiClient.post('/auth/login', {
        email: emailOrUsername,
        username: emailOrUsername,
        password
      });
      if (data.token) localStorage.setItem('token', data.token);
      await fetchCurrentUser();
      return data;
    } catch (err) {
      throw new Error(err.message || 'Login failed. Please check credentials.');
    }
  };

  const loginEmployee = async (username, password) => {
    setError(null);
    try {
      const { data } = await apiClient.post('/employee-auth', { username, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      const employeeUser = {
        id: data.identity?.id || data.id || null,
        username: username || data.username || 'admin',
        role: data.role || 'admin',
        entityModel: 'Employee'
      };
      setUser(employeeUser);
      setUserProfile(null);
      return data;
    } catch (err) {
      throw new Error(err.message || 'Employee login failed. Please check credentials.');
    }
  };

  const loginUser = async (email, password) => {
    setError(null);
    try {
      const { data } = await apiClient.post('/user/login', { email, password });
      if (data.token) localStorage.setItem('token', data.token);
      await fetchCurrentUser();
      return data;
    } catch (err) {
      throw new Error(err.message || 'User login failed. Please check email and password.');
    }
  };

  const loginOrg = async (email, password) => {
    setError(null);
    try {
      const { data } = await apiClient.post('/org/login', { email, password });
      if (data.token) localStorage.setItem('token', data.token);
      await fetchCurrentUser();
      return data;
    } catch (err) {
      throw new Error(err.message || 'Organization login failed. Please check credentials.');
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/user/logout').catch(() => {});
      await apiClient.post('/org/logout').catch(() => {});
      await apiClient.post('/employee-auth/logout').catch(() => {});
    } catch (e) {
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setUserProfile(null);
    }
  };

  const refreshUser = () => {
    return fetchCurrentUser();
  };

  const loginGoogle = async (googlePayload) => {
    setError(null);
    try {
      const { data } = await apiClient.post('/auth/google', googlePayload);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (!data.needsProfile) {
        await fetchCurrentUser();
      }
      return data;
    } catch (err) {
      throw new Error(err.message || 'Google authentication failed.');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      error,
      loginUnified,
      loginEmployee,
      loginUser,
      loginOrg,
      loginGoogle,
      logout,
      refreshUser
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
