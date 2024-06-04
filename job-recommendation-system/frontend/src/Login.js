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
            <h3>Quiz</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="info-card">
            <h3>Rating</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="info-card">
            <h3>User</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="info-card">
            <h3>News</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
