import React, { useState } from 'react';
import './Profile.css';

function Profile() {
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'Sideuest040@gmail.com',
    phone: '123-456-7890',
    address: '123 Main St, Anytown, USA'
  });

  const [editMode, setEditMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSave = () => {
    setEditMode(false);
    // Save the updated userInfo to the server or local storage
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="profile-content">
        <div className="profile-picture">
          <img src="https://via.placeholder.com/150" alt="Profile" />
        </div>
        <div className="profile-details">
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
            {editMode ? (
              <input type="email" name="email" value={userInfo.email} onChange={handleChange} />
            ) : (
              <span>{userInfo.email}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Phone:</label>
            {editMode ? (
              <input type="tel" name="phone" value={userInfo.phone} onChange={handleChange} />
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
          <div className="profile-actions">
            <button onClick={handleEditToggle}>
              {editMode ? 'Cancel' : 'Edit'}
            </button>
            {editMode && (
              <button onClick={handleSave}>Save</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
