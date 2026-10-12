import React, { useState } from 'react';
import './LoginPage.css';
import bankingHeroImg from '../assets/banking-hero.jpg';
import { api } from '../services/api.js';

function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
    if (errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
    if (serverError) setServerError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
    if (serverError) setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === 'register') {
      const trimmedName = fullName.trim();
      if (!trimmedName) {
        newErrors.fullName = 'Please enter your full name.';
      } else if (trimmedName.length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters.';
      }
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Please enter your email address.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    if (!password) {
      newErrors.password = 'Please enter your password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    if (mode === 'register') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (mode === 'login') {
        const res = await api.login(normalizedEmail, password);
        setIsAuthenticated(true);
        if (onLoginSuccess) {
          onLoginSuccess(res.fullName || res.email || res.username || normalizedEmail);
        }
      } else {
        const res = await api.register(fullName.trim(), normalizedEmail, password);
        setSuccessMessage('Account created successfully! Session initiated.');
        setIsAuthenticated(true);
        if (onLoginSuccess) {
          onLoginSuccess(res.fullName || res.email || res.username || fullName.trim());
        }
      }
    } catch (err) {
      const msg = err.message || (mode === 'login' ? 'Authentication failed. Please verify your credentials.' : 'Registration failed. Please try again.');
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setErrors({});
    setServerError('');
    setSuccessMessage('');
  };

  return (
    <div className="portal-root">
      {/* Institutional Top Header */}
      <header className="portal-header">
        <div className="portal-header-content">
          <div className="portal-brand-block">
            <svg className="banking-logo-svg" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="28" height="28" rx="6" fill="#0B1D3D" stroke="#203A66" strokeWidth="1"/>
              <path d="M6 14L14 6L22 14L14 22Z" stroke="#C5A880" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M14 6V22M6 14H22" stroke="#627B9F" strokeWidth="1.2" strokeDasharray="1.5 1.5"/>
              <circle cx="14" cy="14" r="2.8" fill="#F7F3EC"/>
              <circle cx="6" cy="14" r="1.8" fill="#C5A880"/>
              <circle cx="22" cy="14" r="1.8" fill="#C5A880"/>
              <circle cx="14" cy="6" r="1.8" fill="#C5A880"/>
              <circle cx="14" cy="22" r="1.8" fill="#C5A880"/>
            </svg>
            <div className="portal-brand-text">
              <h1 className="portal-brand-title">SWIFT MX MESSAGE PORTAL</h1>
              <p className="portal-brand-subtitle">Secure Financial Messaging</p>
            </div>
          </div>
          <div className="portal-header-badge">
            <span className="portal-header-status-dot" aria-hidden="true"></span>
            <span className="portal-header-status-text">Internal Banking Operations</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="portal-main">
        <div className="portal-card-container">
          {/* Banking Visual Side Panel */}
          <div className="portal-visual-panel">
            <img
              src={bankingHeroImg}
              alt="Corporate banking operations environment"
              className="portal-hero-img"
            />
            <div className="portal-visual-overlay">
              <span className="portal-visual-tag">ISO 20022 Network</span>
              <h2 className="portal-visual-headline">
                Global Financial Transaction Gateway
              </h2>
              <p className="portal-visual-caption">
                Institutional interface for creating, verifying, and dispatching SWIFT MX financial messages.
              </p>
            </div>
          </div>

          {/* Form Side Panel */}
          <div className="portal-form-panel">
            {!isAuthenticated ? (
              <div className="auth-form-wrapper" id="auth-panel">
                <div className="form-header-group">
                  <h2 className="form-brand-title">
                    {mode === 'login' ? 'SWIFT MX MESSAGE PORTAL' : 'CREATE ACCOUNT'}
                  </h2>
                  <p className="form-brand-subtitle">
                    {mode === 'login'
                      ? 'Secure financial messaging operator login'
                      : 'Register new operator credentials for portal access'}
                  </p>
                </div>

                {/* Mode Selector Tabs */}
                <div className="auth-mode-tabs" role="tablist" aria-label="Authentication mode">
                  <button
                    type="button"
                    role="tab"
                    id="tab-login"
                    aria-selected={mode === 'login'}
                    className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
                    onClick={() => switchMode('login')}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="tab-register"
                    aria-selected={mode === 'register'}
                    className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
                    onClick={() => switchMode('register')}
                  >
                    Create Account
                  </button>
                </div>

                {/* Server Error Alert */}
                {serverError && (
                  <div className="auth-alert auth-alert-error" role="alert">
                    <svg className="auth-alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{serverError}</span>
                  </div>
                )}

                {/* Success Alert */}
                {successMessage && (
                  <div className="auth-alert auth-alert-success" role="status">
                    <svg className="auth-alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="login-form" noValidate>
                  {/* Full Name Field (Register Mode Only) */}
                  {mode === 'register' && (
                    <div className="form-field-group">
                      <label htmlFor="operator-fullname" className="field-label">
                        Full Name <span className="field-required">*</span>
                      </label>
                      <div className="field-input-wrapper">
                        <input
                          id="operator-fullname"
                          type="text"
                          name="fullName"
                          value={fullName}
                          onChange={handleFullNameChange}
                          placeholder="e.g. Sarah Jenkins"
                          className={`field-input ${errors.fullName ? 'has-error' : ''}`}
                          autoComplete="name"
                          disabled={isLoading}
                          aria-invalid={errors.fullName ? 'true' : 'false'}
                          aria-describedby={errors.fullName ? 'fullname-error' : undefined}
                        />
                      </div>
                      {errors.fullName && (
                        <span id="fullname-error" className="field-error-msg" role="alert">
                          {errors.fullName}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Email Address Field */}
                  <div className="form-field-group">
                    <label htmlFor="operator-email" className="field-label">
                      Email Address <span className="field-required">*</span>
                    </label>
                    <div className="field-input-wrapper">
                      <input
                        id="operator-email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="operator@swiftmx.bank"
                        className={`field-input ${errors.email ? 'has-error' : ''}`}
                        autoComplete="email"
                        disabled={isLoading}
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                    </div>
                    {errors.email && (
                      <span id="email-error" className="field-error-msg" role="alert">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="form-field-group">
                    <label htmlFor="operator-password" className="field-label">
                      Password <span className="field-required">*</span>
                    </label>
                    <div className="field-input-wrapper">
                      <input
                        id="operator-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                        className={`field-input ${errors.password ? 'has-error' : ''}`}
                        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                        disabled={isLoading}
                        aria-invalid={errors.password ? 'true' : 'false'}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="password-toggle-btn"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <span id="password-error" className="field-error-msg" role="alert">
                        {errors.password}
                      </span>
                    )}
                    {mode === 'register' && (
                      <p className="field-security-note">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Create a dedicated password for this portal. Never enter your personal email account password.
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field (Register Mode Only) */}
                  {mode === 'register' && (
                    <div className="form-field-group">
                      <label htmlFor="operator-confirm-password" className="field-label">
                        Confirm Password <span className="field-required">*</span>
                      </label>
                      <div className="field-input-wrapper">
                        <input
                          id="operator-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={handleConfirmPasswordChange}
                          placeholder="Re-enter your password"
                          className={`field-input ${errors.confirmPassword ? 'has-error' : ''}`}
                          autoComplete="new-password"
                          disabled={isLoading}
                          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                          aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="password-toggle-btn"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <span id="confirm-password-error" className="field-error-msg" role="alert">
                          {errors.confirmPassword}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    className="submit-login-btn"
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.75 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
                  >
                    {isLoading
                      ? mode === 'login'
                        ? 'Authenticating...'
                        : 'Creating Account...'
                      : mode === 'login'
                      ? 'Sign In'
                      : 'Create Account'}
                  </button>
                </form>

                {/* Mode Switcher Link at Bottom */}
                <div className="auth-switch-prompt">
                  {mode === 'login' ? (
                    <>
                      <span className="auth-switch-text">New to the portal?</span>{' '}
                      <button
                        type="button"
                        className="auth-link-btn"
                        onClick={() => switchMode('register')}
                        disabled={isLoading}
                      >
                        Create an Account
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="auth-switch-text">Already registered?</span>{' '}
                      <button
                        type="button"
                        className="auth-link-btn"
                        onClick={() => switchMode('login')}
                        disabled={isLoading}
                      >
                        Sign In to Existing Account
                      </button>
                    </>
                  )}
                </div>

                <div className="portal-compliance-notice">
                  Authorised personnel only. Session activity is monitored in accordance with financial messaging security standards.
                </div>
              </div>
            ) : (
              /* Authenticated View */
              <div className="portal-authenticated-view">
                <div className="form-header-group">
                  <h2 className="form-brand-title">SWIFT MX MESSAGE PORTAL</h2>
                  <p className="form-brand-subtitle">Secure Financial Messaging</p>
                </div>

                <div className="auth-success-badge">
                  <span>Session Active: Verified Operator</span>
                </div>

                <div className="auth-details-box">
                  <div className="auth-info-row">
                    <span className="auth-info-label">Active Operator</span>
                    <span className="auth-info-value">{fullName || email}</span>
                  </div>
                  <div className="auth-info-row">
                    <span className="auth-info-label">Email</span>
                    <span className="auth-info-value">{email}</span>
                  </div>
                  <div className="auth-info-row">
                    <span className="auth-info-label">Access Level</span>
                    <span className="auth-info-value">Authorised Staff (OPERATOR)</span>
                  </div>
                  <div className="auth-info-row">
                    <span className="auth-info-label">Messaging Protocol</span>
                    <span className="auth-info-value">SWIFT MX (ISO 20022)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => onLoginSuccess && onLoginSuccess(fullName || email || 'operator@swiftmx.bank')}
                    className="submit-login-btn"
                  >
                    Open SWIFT MX Message Creation &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="sign-out-btn"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Institutional Portal Footer */}
      <footer className="portal-footer">
        SWIFT MX Message Portal &bull; Internal Financial Operations &bull; All Rights Reserved
      </footer>
    </div>
  );
}

export default LoginPage;
