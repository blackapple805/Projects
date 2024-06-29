import React, { useState } from 'react';
import axios from 'axios';
import './Password.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Password() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/update-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Password updated successfully');
    } catch (error) {
      setMessage('Error updating password');
    }
  };

  return (
    <div className="password-container">
      <h2>Change Password</h2>
      {message && <div className="message">{message}</div>}
      <div className="password-content">
        <div className="password-field">
          <label>Current Password:</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="password-field">
          <label>New Password:</label>
          <div className="password-input-wrapper">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <FontAwesomeIcon
              icon={showNewPassword ? faEyeSlash : faEye}
              onClick={toggleShowNewPassword}
              className="password-toggle-icon"
            />
          </div>
        </div>
        <div className="password-field">
          <label>Confirm New Password:</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <FontAwesomeIcon
              icon={showConfirmPassword ? faEyeSlash : faEye}
              onClick={toggleShowConfirmPassword}
              className="password-toggle-icon"
            />
          </div>
        </div>
        <button onClick={handleChangePassword}>Change Password</button>
      </div>
    </div>
  );
}

export default Password;
