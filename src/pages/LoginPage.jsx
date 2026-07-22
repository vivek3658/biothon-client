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
  Sparkles,
  Mail,
  Lock,
  User,
  KeyRound
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

// Official Google OAuth Button Component
const OfficialGoogleButton = ({ onGoogleAuthSuccess, setErrorMessage, setIsSubmitting }) => {
  return (
    <div className="w-full flex flex-col gap-3 items-center">
      <div className="w-full flex justify-center">
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
          shape="rectangular"
          theme="filled_blue"
          size="large"
          text="continue_with"
          width="380"
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

        // Redirect to Role Selection
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 px-4 sm:px-6 lg:px-8 py-10 md:py-16 relative overflow-hidden">
      {/* Decorative Ambient Background */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="bg-ambient-pattern" />

      {/* RENDER 1: DEDICATED EMPLOYEE STAFF LOGIN (/employee path) */}
      {isEmployeePath ? (
        <div className="w-full max-w-2xl p-10 sm:p-14 md:p-16 bg-white/95 backdrop-blur-2xl rounded-[5px] border border-slate-200/90 shadow-2xl shadow-sky-500/10 relative z-10 space-y-8 transition-all">
          
          {/* Header Security Badge & Logo */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-[5px] bg-sky-50 text-sky-800 text-xs font-black border border-sky-200 shadow-xs mx-auto">
              <ShieldCheck className="w-4.5 h-4.5 text-sky-600" aria-hidden="true" />
              <span>ArogyaX Staff Control Panel</span>
            </div>
            
            <img src={logoImg} alt="ArogyaX Logo" className="h-16 sm:h-18 object-contain mx-auto my-2" />
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Staff Portal Sign In
            </h1>
            <p className="text-sm sm:text-base font-bold text-slate-500 max-w-lg mx-auto">
              Restricted portal for System Administrators & Operational Managers
            </p>
          </div>

          {/* Status Alert Banner */}
          {errorMessage && (
            <div className="p-5 bg-rose-50 border border-rose-200 text-rose-700 rounded-[5px] text-sm font-bold flex items-center gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleEmployeeSubmit} className="space-y-7">
            <div>
              <label htmlFor="emp-username" className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block mb-2.5">
                Staff Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" aria-hidden="true" />
                </div>
                <input
                  id="emp-username"
                  type="text"
                  className="w-full pl-12 pr-6 py-4.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 rounded-[5px] text-base sm:text-lg font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-xs"
                  value={empUsername}
                  onChange={(e) => setEmpUsername(e.target.value)}
                  placeholder="admin or manager username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="emp-password" className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block mb-2.5">
                Staff Account Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-5 h-5" aria-hidden="true" />
                </div>
                <input
                  id="emp-password"
                  type="password"
                  className="w-full pl-12 pr-6 py-4.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 rounded-[5px] text-base sm:text-lg font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-xs"
                  value={empPassword}
                  onChange={(e) => setEmpPassword(e.target.value)}
                  placeholder="Enter staff password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 px-8 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-base sm:text-lg rounded-[5px] shadow-lg shadow-sky-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 focus-visible:ring-4 focus-visible:ring-sky-500/20 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{isSubmitting ? 'Authenticating Staff...' : 'Sign In to Staff Portal'}</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100">
            <span className="text-xs font-black text-slate-400 tracking-wider uppercase">ArogyaX Enterprise Security • SSL Encrypted</span>
          </div>
        </div>
      ) : (
        /* RENDER 2: MULTI-STEP REGISTRATION & UNIFIED LOGIN PORTAL */
        <div className="w-full relative z-10 flex flex-col items-center justify-center">
          
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
            <div className="w-full max-w-2xl mx-auto p-10 sm:p-14 md:p-16 bg-white/95 backdrop-blur-2xl rounded-[5px] border border-slate-200/90 shadow-2xl shadow-sky-500/10 space-y-9 transition-all">
              
              {/* Logo & Header */}
              <div className="text-center space-y-3">
                <img src={logoImg} alt="ArogyaX Logo" className="h-16 sm:h-20 object-contain mx-auto mb-2" />
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Arogya<span className="text-orange-600">X</span> Health Identity
                </h1>
                <p className="text-sm sm:text-base font-bold text-slate-500 max-w-lg mx-auto leading-relaxed">
                  One Unified Health Portal for Patients, Doctors, Hospitals & Facilities
                </p>
              </div>

              {/* Status Alert Banners */}
              {errorMessage && (
                <div className="p-5 bg-rose-50 border border-rose-200 text-rose-700 rounded-[5px] text-sm font-bold flex items-center gap-3 shadow-xs">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-[5px] text-sm font-bold flex items-center gap-3 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="space-y-8">
                {/* Option 1: Fast Google OAuth */}
                <div className="p-7 bg-gradient-to-br from-slate-50 to-sky-50/50 border border-slate-200/90 rounded-[5px] text-center space-y-4 shadow-xs">
                  <div className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-[5px] bg-white text-sky-800 text-xs font-black border border-sky-200 shadow-xs">
                    <Sparkles className="w-4 h-4 text-sky-600" aria-hidden="true" />
                    <span>Option 1: Fast Google OAuth Sign-In</span>
                  </div>
                  <OfficialGoogleButton
                    onGoogleAuthSuccess={handleGoogleAuthSuccess}
                    setErrorMessage={setErrorMessage}
                    setIsSubmitting={setIsSubmitting}
                  />
                </div>

                {/* Divider */}
                <div className="flex items-center text-slate-400 text-xs py-1">
                  <div className="flex-1 border-b border-slate-200" />
                  <span className="px-5 font-black uppercase tracking-wider text-xs text-slate-500">Or Sign In with Email</span>
                  <div className="flex-1 border-b border-slate-200" />
                </div>

                {/* Option 2: Unified Email / Password Sign In */}
                <form onSubmit={handleUnifiedLoginSubmit} className="space-y-7">
                  <div>
                    <label htmlFor="user-email" className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block mb-2.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <input
                        id="user-email"
                        type="email"
                        className="w-full pl-12 pr-6 py-4.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 rounded-[5px] text-base sm:text-lg font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-xs"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="user@gmail.com or facility@domain.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="user-password" className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block mb-2.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <input
                        id="user-password"
                        type="password"
                        className="w-full pl-12 pr-6 py-4.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 rounded-[5px] text-base sm:text-lg font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-xs"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your account password"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 px-8 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-base sm:text-lg rounded-[5px] shadow-lg shadow-sky-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 focus-visible:ring-4 focus-visible:ring-sky-500/20 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Authenticating Account...' : 'Sign In'}</span>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                </form>

                {/* Register Link */}
                <div className="text-center pt-5 border-t border-slate-100">
                  <p className="text-base font-bold text-slate-600">
                    New to ArogyaX Portal?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setSuccessMessage('');
                        setViewMode('role_select');
                      }}
                      className="font-black text-sky-600 hover:text-sky-700 underline cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xs ml-1"
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
