import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { RoleSelector } from '../components/wizard/RoleSelector';
import { RegistrationWizard } from '../components/wizard/RegistrationWizard';
import {
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

// Official Google OAuth Button Component
const OfficialGoogleButton = ({ onGoogleAuthSuccess, setErrorMessage, setIsSubmitting }) => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            if (credentialResponse.credential) {
              try {
                setIsSubmitting(true);
                setErrorMessage('');

                // Extract email, name, googleId from credential JWT in browser
                let googleEmail = '';
                let googleName = '';
                let googleSub = '';
                try {
                  const parts = credentialResponse.credential.split('.');
                  if (parts.length === 3) {
                    const base64Url = parts[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(
                      window.atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                    );
                    const parsed = JSON.parse(jsonPayload);
                    googleEmail = parsed.email || '';
                    googleName = parsed.name || '';
                    googleSub = parsed.sub || '';
                  }
                } catch (e) {
                  console.warn('Browser JWT decode note:', e);
                }

                await onGoogleAuthSuccess({
                  credential: credentialResponse.credential,
                  email: googleEmail,
                  name: googleName,
                  googleId: googleSub
                });
              } catch (err) {
                setErrorMessage('Google authentication error: ' + (err.message || ''));
              } finally {
                setIsSubmitting(false);
              }
            }
          }}
          onError={() => {
            setErrorMessage('Google Sign-In was unsuccessful.');
          }}
          shape="pill"
          theme="filled_blue"
          size="large"
          text="continue_with"
          width="340"
        />
      </div>
    </div>
  );
};

const LoginPageContent = () => {
  const { loginUnified, loginEmployee, loginGoogle, refreshUser } = useAuth();

  // Check path for /employee
  const isEmployeePath = window.location.pathname === '/employee';

  // State: 'login' | 'role_select' | 'wizard'
  const [viewMode, setViewMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('patient');

  // Employee Staff State
  const [empUsername, setEmpUsername] = useState('');
  const [empPassword, setEmpPassword] = useState('');

  // Unified Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Google Payload State
  const [googleInfo, setGoogleInfo] = useState({ email: '', accountId: null });

  // UI Alerts
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Google Auth Response
  const handleGoogleAuthSuccess = async (payload) => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const data = await loginGoogle(payload);

      if (data.needsProfile) {
        if (data.token) localStorage.setItem('token', data.token);
        setGoogleInfo({
          email: data.email || payload.email || '',
          accountId: data.accountId || null
        });

        // Do NOT ask for password for Google users -> immediately redirect to Role Selection
        setSuccessMessage(`Google account verified! Select your healthcare role to start multi-step registration.`);
        setViewMode('role_select');
      } else {
        setSuccessMessage('Google OAuth sign-in successful! Redirecting...');
        await refreshUser();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Google OAuth sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Employee Login Submit (/employee path)
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setIsSubmitting(true);
      await loginEmployee(empUsername.trim(), empPassword);
      setSuccessMessage('Staff authentication successful! Redirecting...');
    } catch (err) {
      setErrorMessage(err.message || 'Staff login failed. Check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unified Sign In Submit
  const handleUnifiedLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      setIsSubmitting(true);
      await loginUnified(loginIdentifier.trim(), loginPassword);
      setSuccessMessage('Sign in successful! Redirecting...');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50/80 p-4 md:p-6 relative overflow-hidden">
      <div className="bg-ambient-pattern" />
      <div className="bg-ambient-glow-1" />
      <div className="bg-ambient-glow-2" />

      {/* RENDER 1: DEDICATED EMPLOYEE STAFF LOGIN (/employee path) */}
      {isEmployeePath ? (
        <div className="w-full max-w-md p-7 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <img src={logoImg} alt="ArogyaX Logo" className="h-10 object-contain mx-auto mb-2" />
            <h1 className="text-xl font-black text-sky-700">ArogyaX Staff Portal</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">Admin & Manager Control Panel</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleEmployeeSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Staff Username or Email</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                value={empUsername}
                onChange={(e) => setEmpUsername(e.target.value)}
                placeholder="admin or manager username"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                value={empPassword}
                onChange={(e) => setEmpPassword(e.target.value)}
                placeholder="Enter staff password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Authenticating Staff...' : 'Sign In to Staff Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* RENDER 2: MULTI-STEP REGISTRATION & UNIFIED LOGIN PORTAL */
        <div className="w-full relative z-10">
          
          {/* A. Role Selection View */}
          {viewMode === 'role_select' && (
            <RoleSelector
              selectedRole={selectedRole}
              onSelectRole={(r) => setSelectedRole(r)}
              onProceed={() => setViewMode('wizard')}
            />
          )}

          {/* B. Multi-Step Registration Wizard View */}
          {viewMode === 'wizard' && (
            <RegistrationWizard
              role={selectedRole}
              defaultEmail={googleInfo.email}
              accountId={googleInfo.accountId}
              onResetRole={() => setViewMode('role_select')}
              onRegistrationSuccess={() => refreshUser()}
            />
          )}

          {/* C. Unified Login View */}
          {viewMode === 'login' && (
            <div className="w-full max-w-md mx-auto p-7 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl">
              {/* Logo & Header */}
              <div className="text-center mb-6">
                <img src={logoImg} alt="ArogyaX Logo" className="h-11 object-contain mx-auto mb-2" />
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Arogya<span className="text-orange-600">X</span> Health Identity
                </h1>
                <p className="text-xs font-semibold text-slate-500 mt-1">One Identity for Patients, Doctors & Facilities</p>
              </div>

              {/* Status Alerts */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="space-y-5">
                {/* Option 1: Fast Google OAuth */}
                <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-[11px] font-extrabold mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> Option 1: Google OAuth Sign-In
                  </div>
                  <OfficialGoogleButton
                    onGoogleAuthSuccess={handleGoogleAuthSuccess}
                    setErrorMessage={setErrorMessage}
                    setIsSubmitting={setIsSubmitting}
                  />
                </div>

                {/* Divider */}
                <div className="flex items-center text-slate-400 text-xs">
                  <div className="flex-1 border-b border-slate-200" />
                  <span className="px-3 font-bold uppercase tracking-wider text-[10px]">Or Sign In with Email</span>
                  <div className="flex-1 border-b border-slate-200" />
                </div>

                {/* Option 2: Unified Email / Password Sign In */}
                <form onSubmit={handleUnifiedLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="user@gmail.com or facility@domain.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Password</label>
                    <input
                      type="password"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Register Link */}
                <div className="text-center pt-2 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500">
                    New to ArogyaX?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setSuccessMessage('');
                        setViewMode('role_select');
                      }}
                      className="font-extrabold text-sky-600 hover:text-sky-700 underline"
                    >
                      Start Multi-Step Registration Wizard
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export const LoginPage = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1082194917395-sample_client_id.apps.googleusercontent.com';
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LoginPageContent />
    </GoogleOAuthProvider>
  );
};
