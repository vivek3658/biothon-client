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
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
      headers['Authorization'] = `Bearer ${token.trim()}`;
    }
    return headers;
  };

  // Ultra-resilient fetch helper for frontend auth
  const safeFetchJson = async (url, options = {}) => {
    const tryCall = async (targetUrl) => {
      try {
        const res = await fetch(targetUrl, options);
        if (!res.ok) {
          let errText = '';
          try { errText = await res.text(); } catch (e) {}
          let errData = {};
          try { errData = errText ? JSON.parse(errText) : {}; } catch (e) {}
          return { 
            ok: false, 
            status: res.status, 
            error: errData.error || errData.details || errText || `Server returned HTTP ${res.status}` 
          };
        }
        const text = await res.text();
        if (!text || !text.trim()) return { ok: true, status: res.status, data: {} };
        return { ok: true, status: res.status, data: JSON.parse(text) };
      } catch (err) {
        return { ok: false, status: 0, error: err.message || 'Network connection failed' };
      }
    };

    // 1. Try relative URL (Vite proxy)
    let result = await tryCall(url);
    if (result.ok || (result.status !== 502 && result.status !== 0)) {
      return result;
    }

    // 2. Fallback to direct backend loopback URL
    const directUrl = url.startsWith('http') ? url : `http://127.0.0.1:3000${url}`;
    result = await tryCall(directUrl);
    if (result.ok || (result.status !== 502 && result.status !== 0)) {
      return result;
    }

    // 3. Fallback to localhost target
    const localhostUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
    return await tryCall(localhostUrl);
  };

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

      const headers = getAuthHeaders(false);

      // 1. Check Org Auth FIRST (Hospital / Clinic / Laboratory)
      let res = await safeFetchJson('/org/me', { headers, credentials: 'include' });
      if (res.ok && res.data?.account && res.data.account.profile) {
        setUser({
          id: res.data.account.accountId || res.data.account._id,
          username: res.data.account.profile?.name || res.data.account.email,
          role: res.data.account.role || 'hospital',
          entityModel: 'Organization'
        });
        setUserProfile(res.data.account.profile);
        setLoading(false);
        return;
      }

      // 2. Check User Auth (Patient / Doctor)
      res = await safeFetchJson('/user/me', { headers, credentials: 'include' });
      if (res.ok && res.data?.account) {
        // If account has an organization role, override to Organization dashboard!
        const role = res.data.account.role;
        const isOrg = res.data.account.entityModel === 'Organization' || ['hospital', 'clinic', 'laboratory', 'pharmacy', 'other'].includes(role);
        
        setUser({
          id: res.data.account._id,
          username: res.data.userProfile?.name || res.data.account.email,
          role: role,
          entityModel: isOrg ? 'Organization' : 'User'
        });
        setUserProfile(res.data.userProfile);
        setLoading(false);
        return;
      }

      // 3. Check Employee Auth (Admin / Manager)
      res = await safeFetchJson('/employee-auth/me', { headers, credentials: 'include' });
      if (res.ok && res.data?.identity?.role) {
        setUser(res.data.identity);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      // Clean up invalid session
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
      }
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

  const loginEmployee = async (username, password) => {
    setError(null);
    const res = await safeFetchJson('/employee-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      if (res.status === 502 || res.status === 0) {
        throw new Error('Backend server is offline or not responding. Please make sure backend node server is running on port 3000.');
      }
      throw new Error(res.error || 'Employee login failed. Please check credentials.');
    }
    if (res.data.token) localStorage.setItem('token', res.data.token);
    await fetchCurrentUser();
    return res.data;
  };

  const loginUser = async (email, password) => {
    setError(null);
    const res = await safeFetchJson('/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      if (res.status === 502 || res.status === 0) {
        throw new Error('Backend server is offline or not responding. Please make sure backend node server is running on port 3000.');
      }
      throw new Error(res.error || 'User login failed. Please check email and password.');
    }
    if (res.data.token) localStorage.setItem('token', res.data.token);
    await fetchCurrentUser();
    return res.data;
  };

  const loginOrg = async (email, password) => {
    setError(null);
    const res = await safeFetchJson('/org/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      if (res.status === 502 || res.status === 0) {
        throw new Error('Backend server is offline or not responding. Please make sure backend node server is running on port 3000.');
      }
      throw new Error(res.error || 'Organization login failed. Please check credentials.');
    }
    if (res.data.token) localStorage.setItem('token', res.data.token);
    await fetchCurrentUser();
    return res.data;
  };

  const logout = async () => {
    try {
      const headers = getAuthHeaders(false);
      await safeFetchJson('/user/logout', { method: 'POST', headers, credentials: 'include' });
      await safeFetchJson('/org/logout', { method: 'POST', headers, credentials: 'include' });
      await safeFetchJson('/employee-auth/logout', { method: 'POST', headers, credentials: 'include' });
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
