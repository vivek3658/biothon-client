import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = (hasBody = true) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (hasBody) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders(false);

      // 1. Try User Auth (Patient / Doctor)
      let res = await fetch('/user/me', { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data?.account) {
          setUser({
            id: data.account._id,
            username: data.userProfile?.name || data.account.email,
            role: data.account.role,
            entityModel: 'User'
          });
          setUserProfile(data.userProfile);
          return;
        }
      }

      // 2. Try Org Auth
      res = await fetch('/org/me', { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data?.account) {
          setUser({
            id: data.account.accountId,
            username: data.account.profile?.name || data.account.email,
            role: data.account.role,
            entityModel: 'Organization'
          });
          setUserProfile(data.account.profile);
          return;
        }
      }

      // 3. Try Employee Auth
      res = await fetch('/employee-auth/me', { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data?.identity?.role) {
          setUser(data.identity);
          setUserProfile(null);
          return;
        }
      }

      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Failed to fetch session identity:', err);
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const loginEmployee = async (username, password) => {
    setError(null);
    const res = await fetch('/employee-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Employee login failed');
    if (data.token) localStorage.setItem('token', data.token);
    await fetchCurrentUser();
    return data;
  };

  const loginUser = async (email, password) => {
    setError(null);
    const res = await fetch('/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'User login failed');
    if (data.token) localStorage.setItem('token', data.token);
    await fetchCurrentUser();
    return data;
  };

  const loginOrg = async (email, password) => {
    setError(null);
    const res = await fetch('/org/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Organization login failed');
    if (data.token) localStorage.setItem('token', data.token);
    await fetchCurrentUser();
    return data;
  };

  const logout = async () => {
    try {
      const headers = getAuthHeaders(false);
      await fetch('/employee-auth/logout', { method: 'POST', headers, credentials: 'include' });
      await fetch('/org/logout', { method: 'POST', headers, credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setUserProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      error, 
      loginEmployee, 
      loginUser, 
      loginOrg,
      logout, 
      refreshUser: fetchCurrentUser 
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
