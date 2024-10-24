import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MyDetails.css';

function MyDetails({ user }) {
  const [bio, setBio] = useState('');
  const [desiredPosition, setDesiredPosition] = useState('Software Engineer');
  const [preferredLocation, setPreferredLocation] = useState('San Francisco, CA');
  const [experienceLevel, setExperienceLevel] = useState('Mid Level');
  const [preferredCompanies, setPreferredCompanies] = useState('Google, Amazon, Facebook');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/user-preferences', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBio(response.data.bio);
        setDesiredPosition(response.data.desired_position);
        setPreferredLocation(response.data.preferred_location);
        setExperienceLevel(response.data.experience_level);
        setPreferredCompanies(response.data.preferred_companies);
        // Ensure the loader is visible for at least 1 second
        setTimeout(() => {
          setLoading(false);
        }, 1000); // 1000ms = 1 second
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchUserPreferences();
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const userPreferences = { bio, desired_position: desiredPosition, preferred_location: preferredLocation, experience_level: experienceLevel, preferred_companies: preferredCompanies };
      await axios.put('/user-preferences', userPreferences, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditMode(false);
      toast.success('Your details have been updated successfully.', {
        className: 'toast-success',
        progressClassName: 'toast-progress',
      });
    } catch (error) {
      console.error('Error saving user preferences:', error);
      toast.error('Failed to update details.', {
        className: 'toast-error',
        progressClassName: 'toast-progress',
      });
    }
  };

  if (loading) {
    return (
      <div className="details-content">
        <div className="loader-container">
          <div id="wifi-loader">
            <svg viewBox="0 0 86 86" className="circle-outer">
              <circle r="40" cy="43" cx="43" className="back"></circle>
              <circle r="40" cy="43" cx="43" className="front"></circle>
              <circle r="40" cy="43" cx="43" className="new"></circle>
            </svg>
            <svg viewBox="0 0 60 60" className="circle-middle">
              <circle r="27" cy="30" cx="30" className="back"></circle>
              <circle r="27" cy="30" cx="30" className="front"></circle>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="details-content">Loading user data...</div>;
  }

  return (
    <div>
      <h2>My Details</h2>
      <div className="details-content">
        <div className="details-section">
          <h3>Personal Information</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
        </div>
        <div className="details-section">
          <h3>Job Preferences</h3>
          {editMode ? (
            <>
              <div className="label">
                <span className="title">Desired Position</span>
                <input
                  type="text"
                  value={desiredPosition}
                  onChange={(e) => setDesiredPosition(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="label">
                <span className="title">Preferred Location</span>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="label">
                <span className="title">Experience Level</span>
                <input
                  type="text"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="label">
                <span className="title">Preferred Companies</span>
                <input
                  type="text"
                  value={preferredCompanies}
                  onChange={(e) => setPreferredCompanies(e.target.value)}
                  className="input-field"
                />
              </div>
            </>
          ) : (
            <>
              <p><strong>Desired Position:</strong> {desiredPosition}</p>
              <p><strong>Preferred Location:</strong> {preferredLocation}</p>
              <p><strong>Experience Level:</strong> {experienceLevel}</p>
              <p><strong>Preferred Companies:</strong> {preferredCompanies}</p>
            </>
          )}
        </div>
        <div className="details-section bio-section">
          <h3>Bio</h3>
          {editMode ? (
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
          ) : (
            <p>{bio}</p>
          )}
        </div>
        {editMode ? (
          <button className="save-button" onClick={handleSave}>Save</button>
        ) : (
          <button className="save-button" onClick={() => setEditMode(true)}>Edit</button>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default MyDetails;
