import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Password() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    try {
      await axios.put('/update-password', { currentPassword, newPassword });
      toast.success('Password updated successfully.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error('Could not update password.');
    }
  };

  return (
    <div>
      <div className="page-head">
        <h2>Change password</h2>
        <p>Keep your account secure with a strong password.</p>
      </div>
      <div className="password-wrap">
        <div className="field">
          <span>Current password</span>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
        </div>
        <div className="field">
          <span>New password</span>
          <div className="pw-input">
            <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
            <i className={`toggle fas ${showNew ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowNew(v => !v)}></i>
          </div>
        </div>
        <div className="field">
          <span>Confirm new password</span>
          <div className="pw-input">
            <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
            <i className={`toggle fas ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowConfirm(v => !v)}></i>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleChangePassword}>Update password</button>
      </div>
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

export default Password;