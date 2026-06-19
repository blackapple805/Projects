import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Profile({ setUser }) {
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '', address: '', profile_picture: '' });
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axios.get('/profile');
        setUserInfo(res.data);
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching user information:', err);
      }
    };
    const saved = localStorage.getItem('userInfo');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserInfo(parsed);
      setUser(parsed);
    } else {
      fetchUserInfo();
    }
  }, [setUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.put('/profile', userInfo);
      if (selectedFile) {
        const formData = new FormData();
        formData.append('profile_picture', selectedFile);
        await axios.put('/profile-picture', formData);
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      setUser(userInfo);
      setEditMode(false);
      toast.success('Your profile has been updated.');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Could not update profile.');
    }
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  return (
    <div>
      <div className="page-head">
        <h2>Profile</h2>
        <p>Your personal information and photo.</p>
      </div>

      <div className="profile-top">
        <div className="avatar-upload" onClick={() => document.getElementById('fileInput').click()} title="Change photo">
          {userInfo.profile_picture
            ? <img src={`/${userInfo.profile_picture}`} alt="Profile" />
            : <div className="ph"><i className="fas fa-user"></i></div>}
          <span className="cam" aria-label="Change photo"><i className="fas fa-camera"></i></span>
          <span className="avatar-change-label">Change</span>
        </div>
        <input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
        <div className="who">
          <h3>{userInfo.name || 'Your name'}</h3>
          <span>{userInfo.email}</span>
        </div>
      </div>

      {editMode ? (
        <>
          <div className="field">
            <span>Name</span>
            <input type="text" name="name" value={userInfo.name || ''} onChange={handleChange} placeholder="Your full name" />
          </div>
          <div className="field">
            <span>Phone</span>
            <input type="text" name="phone" value={userInfo.phone || ''} onChange={handleChange} placeholder="Phone number" />
          </div>
          <div className="field">
            <span>Address</span>
            <input type="text" name="address" value={userInfo.address || ''} onChange={handleChange} placeholder="Your address" />
          </div>
          <div className="details-actions">
            <button className="btn btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
          </div>
        </>
      ) : (
        <>
          <div className="ui-card">
            <div className="data-row"><span className="k">Name</span><span className="v">{userInfo.name || '—'}</span></div>
            <div className="data-row"><span className="k">Email</span><span className="v">{userInfo.email || '—'}</span></div>
            <div className="data-row"><span className="k">Phone</span><span className="v">{userInfo.phone || '—'}</span></div>
            <div className="data-row"><span className="k">Address</span><span className="v">{userInfo.address || '—'}</span></div>
          </div>
          <div className="details-actions">
            <button className="btn btn-primary" onClick={() => setEditMode(true)}><i className="fas fa-pen"></i> Edit profile</button>
          </div>
        </>
      )}
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

export default Profile;