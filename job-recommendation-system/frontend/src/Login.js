import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { FaFacebook, FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data);
      onLogin();  // Update login status
      navigate('/dashboard', { state: { email, userId: data.userId } });
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to login');
    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h3>Login Here</h3>
          <div className="input-container">
            <span className="icon"><FaEnvelope /></span>
            <input
              type="email"
              placeholder="Email or Phone"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-container">
            <span className="icon"><FaLock /></span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="remember-me">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <Link to="#" className="forgot-password">Forgot Password?</Link>
          </div>
          <button type="submit" className="login-button">Log In</button>
          {error && <p className="error">{error}</p>}
          <div className="social-login">
            <button type="button" className="google-login">
              <FaGoogle />
            </button>
            <button type="button" className="facebook-login">
              <FaFacebook />
            </button>
          </div>
          <p>
            Don't have an account? <Link to="/signup">Signup here</Link>
          </p>
        </form>
        <div className="login-info">
          <div className="info-card">
            <h3>Job Recommendations</h3>
            <p>Get personalized job recommendations based on your profile and preferences.</p>
          </div>
          <div className="info-card">
            <h3>Application Tracking</h3>
            <p>Track the status of your job applications in one place.</p>
          </div>
          <div className="info-card">
            <h3>User Dashboard</h3>
            <p>Manage your profile, view job matches, and save favorite job listings.</p>
          </div>
          <div className="info-card">
            <h3>Latest News</h3>
            <p>Stay updated with the latest industry news and career advice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
