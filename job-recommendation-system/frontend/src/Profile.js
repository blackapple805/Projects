import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Profile.css';

function Profile() {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profile_picture: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Fetch user information from the backend
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user information:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/profile', userInfo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selectedFile) {
        const formData = new FormData();
        formData.append('profile_picture', selectedFile);
        await axios.put('/profile-picture', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setEditMode(false);
      toast.success('Your profile has been updated successfully.', {
        className: 'toast-success',
        progressClassName: 'toast-progress',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="profile-picture" onClick={() => document.getElementById('fileInput').click()}>
        {userInfo.profile_picture ? (
          <img src={`/${userInfo.profile_picture}`} alt="Profile" />
        ) : (
          <div className="placeholder">150 x 150</div>
        )}
      </div>
      <input
        type="file"
        id="fileInput"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div className="profile-fields">
        <div className="profile-field label">
          <span className="title">Name:</span>
          {editMode ? (
            <input className="input-field" type="text" name="name" value={userInfo.name} onChange={handleChange} />
          ) : (
            <span className="input-field">{userInfo.name}</span>
          )}
        </div>
        <div className="profile-field label">
          <span className="title">Email:</span>
          <span className="input-field">{userInfo.email}</span>
        </div>
        <div className="profile-field label">
          <span className="title">Phone:</span>
          {editMode ? (
            <input className="input-field" type="text" name="phone" value={userInfo.phone} onChange={handleChange} />
          ) : (
            <span className="input-field">{userInfo.phone}</span>
          )}
        </div>
        <div className="profile-field label">
          <span className="title">Address:</span>
          {editMode ? (
            <input className="input-field" type="text" name="address" value={userInfo.address} onChange={handleChange} />
          ) : (
            <span className="input-field">{userInfo.address}</span>
          )}
        </div>
      </div>
      {editMode ? (
        <div className="profile-buttons">
          <button className="checkout-btn" onClick={handleEditToggle}>Cancel</button>
          <button className="checkout-btn" onClick={handleSave}>Save</button>
        </div>
      ) : (
        <button className="checkout-btn edit-button" onClick={handleEditToggle}>Edit</button>
      )}
      <ToastContainer />
    </div>
  );
}

export default Profile;
