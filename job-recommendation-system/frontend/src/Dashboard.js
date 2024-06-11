import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, NavLink, Route, Routes } from 'react-router-dom';
import './Dashboard.css';
import MyDetails from './MyDetails';
import Profile from './Profile';
import Password from './Password';
import Team from './Team';
import Plan from './Plan';
import Billing from './Billing';
import Email from './Email';
import Notifications from './Notifications';
import Integrations from './Integrations';
import API from './API';

function Dashboard({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem('email') || 'User');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
      localStorage.setItem('email', location.state.email);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedPosition && selectedLocation && selectedExperience && selectedCompany) {
      fetch(`/recommendations?position=${selectedPosition}&location=${selectedLocation}&experience=${selectedExperience}&company=${selectedCompany}`, {
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
  }, [selectedPosition, selectedLocation, selectedExperience, selectedCompany]);

  const handleLogout = () => {
    onLogout();
    localStorage.removeItem('email');
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

  const handleExperienceChange = (e) => {
    setSelectedExperience(e.target.value);
    setStep(4);
  };

  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
    setStep(5);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>JobFinder</h1>
        </div>
        <nav className="header-right">
          <NavLink to="/dashboard">Home</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/dashboard/projects">Projects</NavLink>
          <NavLink to="/dashboard/tasks">Tasks</NavLink>
          <NavLink to="/dashboard/reporting">Reporting</NavLink>
          <NavLink to="/dashboard/users">Users</NavLink>
          <span>{email}</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <div className="dashboard-body">
        <aside className="sidebar">
          <ul>
            <li><NavLink to="/dashboard/my-details">My details</NavLink></li>
            <li><NavLink to="/dashboard/profile">Profile</NavLink></li>
            <li><NavLink to="/dashboard/password">Password</NavLink></li>
            <li><NavLink to="/dashboard/team">Team</NavLink></li>
            <li><NavLink to="/dashboard/plan">Plan</NavLink></li>
            <li><NavLink to="/dashboard/billing">Billing</NavLink></li>
            <li><NavLink to="/dashboard/email">Email</NavLink></li>
            <li><NavLink to="/dashboard/notifications">Notifications</NavLink></li>
            <li><NavLink to="/dashboard/integrations">Integrations</NavLink></li>
            <li><NavLink to="/dashboard/api">API</NavLink></li>
          </ul>
        </aside>
        <main className="main-content">
          <div className="recommendations-container">
            <div className="card">
              <h2>Your Job Recommendations</h2>
              <div className="progress-bar">
                <div className={`progress-step ${step >= 1 ? 'active' : ''}`}></div>
                <div className={`progress-step ${step >= 2 ? 'active' : ''}`}></div>
                <div className={`progress-step ${step >= 3 ? 'active' : ''}`}></div>
                <div className={`progress-step ${step >= 4 ? 'active' : ''}`}></div>
                <div className={`progress-step ${step >= 5 ? 'active' : ''}`}></div>
              </div>
              {step === 1 && (
                <div className="step-container">
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
                <div className="step-container">
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
                <div className="step-container">
                  <h3>Select your experience level</h3>
                  <select value={selectedExperience} onChange={handleExperienceChange}>
                    <option value="">Select experience</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                  </select>
                </div>
              )}
              {step === 4 && (
                <div className="step-container">
                  <h3>Select a company</h3>
                  <select value={selectedCompany} onChange={handleCompanyChange}>
                    <option value="">Select a company</option>
                    <option value="Google">Google</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Apple">Apple</option>
                  </select>
                </div>
              )}
              {step === 5 && (
                <div className="step-container">
                  <h3>Recommendations for {selectedPosition} in {selectedLocation} with {selectedExperience} experience at {selectedCompany}</h3>
                  {recommendations.length > 0 ? (
                    recommendations.map((job, index) => (
                      <div key={index} className="job-card">
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
          </div>
          <Routes>
            <Route path="my-details" element={<div className="card"><MyDetails /></div>} />
            <Route path="profile" element={<div className="card"><Profile /></div>} />
            <Route path="password" element={<div className="card"><Password /></div>} />
            <Route path="team" element={<div className="card"><Team /></div>} />
            <Route path="plan" element={<div className="card"><Plan /></div>} />
            <Route path="billing" element={<div className="card"><Billing /></div>} />
            <Route path="email" element={<div className="card"><Email /></div>} />
            <Route path="notifications" element={<div className="card"><Notifications /></div>} />
            <Route path="integrations" element={<div className="card"><Integrations /></div>} />
            <Route path="api" element={<div className="card"><API /></div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
