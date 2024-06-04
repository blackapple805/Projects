// Dashboard.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Dashboard({ onLogout }) {
  const location = useLocation();
  const email = location.state ? location.state.email : 'User';
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (selectedPosition && selectedLocation) {
      fetch(`/recommendations?position=${selectedPosition}&location=${selectedLocation}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(response => response.json())
        .then(data => {
          if (Array.isArray(data)) {
            setRecommendations(data);
          } else {
            setRecommendations([]);
          }
        })
        .catch(error => {
          console.error('Error fetching recommendations:', error);
          setRecommendations([]);
        });
    }
  }, [selectedPosition, selectedLocation]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handlePositionChange = (e) => {
    setSelectedPosition(e.target.value);
    setStep(2);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
    setStep(3);
  };

  return (
    <div>
      <h1>Welcome, {email}!</h1>
      <p>Congratulations on successfully logging in!</p>
      <button onClick={handleLogout}>Logout</button>

      <h2>Your Job Recommendations</h2>

      <div className="progress-bar">
        <div style={{ backgroundColor: step >= 1 ? '#007BFF' : '#ccc' }}></div>
        <div style={{ backgroundColor: step >= 2 ? '#007BFF' : '#ccc' }}></div>
        <div style={{ backgroundColor: step >= 3 ? '#007BFF' : '#ccc' }}></div>
      </div>

      {step === 1 && (
        <div>
          <h3>Select a position</h3>
          <select value={selectedPosition} onChange={handlePositionChange}>
            <option value="">Select a position</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Product Manager">Product Manager</option>
          </select>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Select a location</h3>
          <select value={selectedLocation} onChange={handleLocationChange}>
            <option value="">Select a location</option>
            <option value="San Francisco">San Francisco</option>
            <option value="Los Angeles">Los Angeles</option>
            <option value="San Diego">San Diego</option>
            <option value="Sacramento">Sacramento</option>
          </select>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>Recommendations for {selectedPosition} in {selectedLocation}</h3>
          {recommendations.length > 0 ? (
            recommendations.map((job, index) => (
              <div key={index} className="card">
                <h4>{job.job_title} at {job.company}</h4>
                <p>{job.location}</p>
                <p>{job.description}</p>
                <button>Apply on Company Site</button>
              </div>
            ))
          ) : (
            <p>No recommendations available</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
