import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
        <div className="profile-field">
          <label>Name:</label>
          {editMode ? (
            <input type="text" name="name" value={userInfo.name} onChange={handleChange} />
          ) : (
            <span>{userInfo.name}</span>
          )}
        </div>
        <div className="profile-field">
          <label>Email:</label>
          <span>{userInfo.email}</span>
        </div>
        <div className="profile-field">
          <label>Phone:</label>
          {editMode ? (
            <input type="text" name="phone" value={userInfo.phone} onChange={handleChange} />
          ) : (
            <span>{userInfo.phone}</span>
          )}
        </div>
        <div className="profile-field">
          <label>Address:</label>
          {editMode ? (
            <input type="text" name="address" value={userInfo.address} onChange={handleChange} />
          ) : (
            <span>{userInfo.address}</span>
          )}
        </div>
      </div>
      {editMode ? (
        <div className="profile-buttons">
          <button onClick={handleEditToggle}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      ) : (
        <button className="edit-button" onClick={handleEditToggle}>Edit</button>
      )}
    </div>
  );
}

export default Profile;
