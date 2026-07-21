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

    // 2. Fallback to production Vercel host URL
    const vercelHost = process.env.VITE_API_URL || 'https://arogyax-server.vercel.app';
    const remoteUrl = url.startsWith('http') ? url : `${vercelHost}${url}`;
    result = await tryCall(remoteUrl);
    if (result.ok || (result.status !== 502 && result.status !== 0)) {
      return result;
    }

    // 3. Fallback to direct local backend URL
    const directUrl = url.startsWith('http') ? url : `http://127.0.0.1:3000${url}`;
    return await tryCall(directUrl);
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
      if (payload?.role === 'admin' || payload?.role === 'manager') {
        const resEmp = await safeFetchJson('/employee-auth/me', { headers, credentials: 'include' });
        if (resEmp.ok && resEmp.data?.identity?.role) {
          setUser(resEmp.data.identity);
          setUserProfile(null);
          setLoading(false);
          return;
        }
      }

      // 2. Check Organization Auth if token entityModel is Organization
      if (payload?.entityModel === 'Organization' || ['hospital', 'clinic', 'laboratory', 'pharmacy'].includes(payload?.role)) {
        const resOrg = await safeFetchJson('/org/me', { headers, credentials: 'include' });
        if (resOrg.ok && resOrg.data?.account && resOrg.data.account.profile && resOrg.data.account.entityModel === 'Organization') {
          setUser({
            id: resOrg.data.account.accountId || resOrg.data.account._id,
            username: resOrg.data.account.profile?.name || resOrg.data.account.email,
            role: resOrg.data.account.role || 'hospital',
            entityModel: 'Organization'
          });
          setUserProfile(resOrg.data.account.profile);
          setLoading(false);
          return;
        }
      }

      // 3. Check User Auth (Patient / Doctor)
      const resUser = await safeFetchJson('/user/me', { headers, credentials: 'include' });
      if (resUser.ok && resUser.data?.account && resUser.data.account.entityModel === 'User') {
        setUser({
          id: resUser.data.account._id,
          username: resUser.data.userProfile?.name || resUser.data.account.email,
          role: resUser.data.account.role,
          entityModel: 'User'
        });
        setUserProfile(resUser.data.userProfile);
        setLoading(false);
        return;
      }

      // Fallback 1: Check Organization Auth if not tried yet
      const resOrgFallback = await safeFetchJson('/org/me', { headers, credentials: 'include' });
      if (resOrgFallback.ok && resOrgFallback.data?.account && resOrgFallback.data.account.profile && resOrgFallback.data.account.entityModel === 'Organization') {
        setUser({
          id: resOrgFallback.data.account.accountId || resOrgFallback.data.account._id,
          username: resOrgFallback.data.account.profile?.name || resOrgFallback.data.account.email,
          role: resOrgFallback.data.account.role || 'hospital',
          entityModel: 'Organization'
        });
        setUserProfile(resOrgFallback.data.account.profile);
        setLoading(false);
        return;
      }

      // Fallback 2: Check Employee Auth
      const resEmpFallback = await safeFetchJson('/employee-auth/me', { headers, credentials: 'include' });
      if (resEmpFallback.ok && resEmpFallback.data?.identity?.role) {
        setUser(resEmpFallback.data.identity);
        setUserProfile(null);
        setLoading(false);
        return;
      }

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

  const loginGoogle = async (googlePayload) => {
    setError(null);
    const res = await safeFetchJson('/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(googlePayload)
    });
    if (!res.ok) {
      if (res.status === 502 || res.status === 0) {
        throw new Error('Backend server is offline or not responding. Please make sure backend node server is running on port 3000.');
      }
      throw new Error(res.error || 'Google authentication failed.');
    }
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    if (!res.data.needsProfile) {
      await fetchCurrentUser();
    }
    return res.data;
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
