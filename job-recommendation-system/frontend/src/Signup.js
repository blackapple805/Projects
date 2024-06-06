import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import './Signup.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      navigate('/login');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to signup');
    }
  };

  return (
    <div className="signup-background">
      <div className="signup-container group">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h3 className="text-2xl font-semibold mb-4">Sign up</h3>
          <div className="input-container mb-3 flex items-center">
            <span className="icon mr-2"><FaEnvelope /></span>
            <input
              type="email"
              placeholder="Email"
              className="input-field p-2 rounded-lg flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-container mb-3 flex items-center">
            <span className="icon mr-2"><FaLock /></span>
            <input
              type="password"
              placeholder="Password"
              className="input-field p-2 rounded-lg flex-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="signup-button p-2 rounded-lg bg-purple-600 text-white w-full">Sign up</button>
          {error && <p className="error text-red-600 mt-3">{error}</p>}
          <p className="mt-3 text-center">
            Already have an account? <Link to="/login" className="text-purple-600">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;

