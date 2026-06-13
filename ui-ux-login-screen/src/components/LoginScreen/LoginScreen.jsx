import React, { useState } from 'react';
import './LoginScreen.css';

/* ============================================================
   Auth screens: sign in / create account / forgot password.
   Switched with local state — no router, no new dependencies.
   Each fake API call is clearly marked for later replacement.
   ============================================================ */

const LoginScreen = () => {
  // 'signin' | 'signup' | 'forgot'
  const [view, setView] = useState('signin');

  const switchTo = (next) => setView(next);

  return (
    <div className="login-page">
      {/* Brand panel — edit the name and tagline to make it yours */}
      <aside className="login-brand" aria-hidden="true">
        <div className="login-brand-mark">YN</div>
        <div className="login-brand-copy">
          <p className="login-brand-eyebrow">Portfolio</p>
          <h1 className="login-brand-title">Your Name</h1>
          <p className="login-brand-tagline">
            Software developer. Projects, experiments, and work in progress.
          </p>
        </div>
        <p className="login-brand-foot">&copy; {new Date().getFullYear()}</p>
      </aside>

      {/* Form panel */}
      <main className="login-panel">
        {view === 'signin' && <SignInForm onSwitch={switchTo} />}
        {view === 'signup' && <SignUpForm onSwitch={switchTo} />}
        {view === 'forgot' && <ForgotForm onSwitch={switchTo} />}
      </main>
    </div>
  );
};

/* ---------------- Sign in ---------------- */

const SignInForm = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // Replace with your real auth call, e.g. POST /api/login
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log('Signing in:', username);
    } catch {
      setError('Sign in failed. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <h2 className="login-title">Welcome back</h2>
      <p className="login-subtitle">Sign in to continue</p>

      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}

      <div className="field">
        <label className="field-label" htmlFor="signin-username">
          Username
        </label>
        <input
          id="signin-username"
          className="field-input"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <div className="field-label-row">
          <label className="field-label" htmlFor="signin-password">
            Password
          </label>
          <button
            type="button"
            className="field-toggle"
            onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          id="signin-password"
          className="field-input"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="login-row">
        <label className="remember">
          <input type="checkbox" className="remember-box" />
          <span>Remember me</span>
        </label>
        <button
          type="button"
          className="login-link"
          onClick={() => onSwitch('forgot')}
        >
          Forgot password?
        </button>
      </div>

      <button type="submit" className="login-button" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="login-foot">
        New here?{' '}
        <button
          type="button"
          className="login-link"
          onClick={() => onSwitch('signup')}
        >
          Create an account
        </button>
      </p>
    </form>
  );
};

/* ---------------- Create account ---------------- */

const SignUpForm = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      // Replace with your real call, e.g. POST /api/register
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log('Creating account:', username, email);
    } catch {
      setError('Could not create your account. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <h2 className="login-title">Create your account</h2>
      <p className="login-subtitle">A few details and you're in</p>

      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}

      <div className="field">
        <label className="field-label" htmlFor="signup-username">
          Username
        </label>
        <input
          id="signup-username"
          className="field-input"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          className="field-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <div className="field-label-row">
          <label className="field-label" htmlFor="signup-password">
            Password
          </label>
          <button
            type="button"
            className="field-toggle"
            onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          id="signup-password"
          className="field-input"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="field-hint">At least 8 characters</p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="signup-confirm">
          Confirm password
        </label>
        <input
          id="signup-confirm"
          className="field-input"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="login-button" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create account'}
      </button>

      <p className="login-foot">
        Already have an account?{' '}
        <button
          type="button"
          className="login-link"
          onClick={() => onSwitch('signin')}
        >
          Sign in
        </button>
      </p>
    </form>
  );
};

/* ---------------- Forgot password ---------------- */

const ForgotForm = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // Replace with your real call, e.g. POST /api/forgot-password
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSent(true);
    } catch {
      setError('Could not send the reset link. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="login-form">
        <h2 className="login-title">Check your email</h2>
        <p className="login-subtitle">
          If an account exists for {email}, a reset link is on its way.
        </p>
        <button
          type="button"
          className="login-button"
          onClick={() => onSwitch('signin')}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <h2 className="login-title">Reset your password</h2>
      <p className="login-subtitle">
        Enter your email and we'll send you a reset link
      </p>

      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}

      <div className="field">
        <label className="field-label" htmlFor="forgot-email">
          Email
        </label>
        <input
          id="forgot-email"
          className="field-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="login-button" disabled={submitting}>
        {submitting ? 'Sending…' : 'Send reset link'}
      </button>

      <p className="login-foot">
        Remembered it?{' '}
        <button
          type="button"
          className="login-link"
          onClick={() => onSwitch('signin')}
        >
          Back to sign in
        </button>
      </p>
    </form>
  );
};

export default LoginScreen;