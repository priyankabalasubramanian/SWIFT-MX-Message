import React, { useState } from 'react';
import './LoginPage.css';
import bankingHeroImg from '../assets/banking-hero.jpg';
import { api, authStorage } from '../services/api.js';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Field change handlers that clear field-specific error
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

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Client-side validation with email format check
  const validateForm = () => {
    const newErrors = {};

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

    return newErrors;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await api.login(email.trim(), password);
      setIsAuthenticated(true);
      if (onLoginSuccess) {
        onLoginSuccess(res.email || res.username || email.trim());
      }
    } catch (err) {
      setServerError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setErrors({});
    setServerError('');
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
              <>
                <div className="form-header-group">
                  <h2 className="form-brand-title">SWIFT MX MESSAGE PORTAL</h2>
                  <p className="form-brand-subtitle">Secure Financial Messaging</p>
                </div>

                {serverError && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-error-bg)',
                      border: '1px solid var(--color-error-border)',
                      color: 'var(--color-error-text)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.84rem',
                      marginBottom: '1rem',
                      lineHeight: '1.45'
                    }}
                    role="alert"
                  >
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="login-form" noValidate>
                  {/* Email Address Field */}
                  <div className="form-field-group">
                    <label htmlFor="operator-email" className="field-label">
                      Email Address
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
                      Password
                    </label>
                    <div className="field-input-wrapper">
                      <input
                        id="operator-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Enter your security password"
                        className={`field-input ${errors.password ? 'has-error' : ''}`}
                        autoComplete="current-password"
                        disabled={isLoading}
                        aria-invalid={errors.password ? 'true' : 'false'}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={toggleShowPassword}
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
                  </div>

                  {/* Navy Login Button */}
                  <button
                    type="submit"
                    className="submit-login-btn"
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.75 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
                  >
                    {isLoading ? 'Authenticating...' : 'Login'}
                  </button>
                </form>

                <div className="portal-compliance-notice">
                  Authorised personnel only. Session activity is monitored in accordance with financial messaging security standards.
                </div>
              </>
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
                    <span className="auth-info-value">{email}</span>
                  </div>
                  <div className="auth-info-row">
                    <span className="auth-info-label">Access Level</span>
                    <span className="auth-info-value">Authorised Staff</span>
                  </div>
                  <div className="auth-info-row">
                    <span className="auth-info-label">Messaging Protocol</span>
                    <span className="auth-info-value">SWIFT MX (ISO 20022)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => onLoginSuccess && onLoginSuccess(email || 'operator@swiftmx.bank')}
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
