import React, { useState } from 'react';
import { useShell } from '../../context/ShellContext';

export const LoginPage: React.FC = () => {
  const { login } = useShell();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await login({ email: email.trim(), password });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-split-page min-h-screen lg:h-screen lg:overflow-hidden w-full flex flex-col lg:grid lg:grid-cols-2 bg-slate-50">
      {/* 1. Left Image Column (hidden on mobile/tablet < lg, dedicated 50% column on lg+) */}
      <section
        className="login-image-column hidden lg:flex relative w-full h-full min-h-0 overflow-hidden bg-slate-900 items-center justify-center border-0"
        aria-label="Clinical Visual"
      >
        <img
          src="/login pic.png?v=2"
          alt="Shfaa Outpatient Care Management"
          className="w-full h-full object-cover"
        />
        {/* Soft edge blend overlay for seamless transition into the right form column */}
        <div className="login-image-edge-blend" aria-hidden="true" />
      </section>

      {/* 2. Right Login Form Column (full width on mobile, 50% on lg+) */}
      <section
        className="login-form-section w-full h-full min-h-0 overflow-y-auto flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-slate-50 border-0"
        aria-label="Staff Sign In"
      >
        <div className="login-form-container w-full max-w-md">
          <div className="login-form-header">
            <span className="login-form-pretitle">Security Clearance</span>
            <h1 className="login-form-title">Staff Sign In</h1>
            <p className="login-form-subtitle">
              Enter your clinical credentials to access the workstation.
            </p>
          </div>

          {error && (
            <div className="form-error-banner" role="alert" style={{ marginBottom: '16px' }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Clinic Email <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input login-input"
                placeholder="e.g. physician@shfaa.clinic"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <div className="password-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input login-input"
                  placeholder="Enter your confidential password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--primary login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In to Workstation'}
            </button>
          </form>

          <div className="login-form-footer">
            <p className="login-security-notice">
              Authorized clinical personnel only. Access is logged and audited in accordance with clinic security policy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
