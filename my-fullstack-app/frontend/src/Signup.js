import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/signup', {
        email,
        password,
      });

      if (response.status === 201) {
        setMessage('User registered successfully');
      } else {
        setMessage('Unexpected response from server');
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response) {
        setMessage(error.response.data.message || 'Error signing up');
      } else if (error.request) {
        setMessage('No response from server');
      } else {
        setMessage('Error setting up request');
      }
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Signup;
