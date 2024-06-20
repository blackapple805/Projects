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
import Projects from './Projects';
import Tasks from './Tasks';
import Reporting from './Reporting';
import Users from './Users';
import Dash from './Dash';

function Dashboard({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem('email') || 'User');
  const [testRecommendations, setTestRecommendations] = useState([]);

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
      localStorage.setItem('email', location.state.email);
    }
  }, [location.state]);

  useEffect(() => {
    if (location.pathname !== '/dashboard') {
      setTestRecommendations([]);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    onLogout();
    localStorage.removeItem('email');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchTestRecommendations = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch('/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data);
      if (Array.isArray(data)) {
        setTestRecommendations(data);
      } else {
        console.error('Invalid data format:', data);
        setTestRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching test recommendations:', error);
      setTestRecommendations([]);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>JobFinder</h1>
        </div>
        <nav className="header-right">
          <NavLink to="/dashboard">Home</NavLink>
          <NavLink to="/dashboard/dash">Dash</NavLink>
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
          </ul>
        </aside>
        <main className="main-content">
          {location.pathname === '/dashboard' && (
            <div className="recommendations-container">
              <div className="card home-card">
                <h2>Test Job Recommendations</h2>
                <button onClick={fetchTestRecommendations} className="fetch-button">Fetch Test Recommendations</button>
                {testRecommendations.length > 0 ? (
                  testRecommendations.map((job, index) => (
                    <div key={index} className="job-card">
                      <h4>{job.title} at {job.company}</h4>
                      <p><strong>Location:</strong> {job.location}</p>
                      <p><strong>Description:</strong> {job.description}</p>
                      <p><strong>Date Posted:</strong> {job.datePosted}</p>
                      <p><strong>Employment Type:</strong> {job.employmentType}</p>
                      <img src={job.image} alt={job.title} className="company-logo" />
                      <div className="apply-buttons">
                        {job.jobProviders && job.jobProviders.length > 0 ? (
                          job.jobProviders.map((provider, i) => (
                            <button
                              key={i}
                              onClick={() => window.open(provider.url, '_blank')}
                              className="apply-button"
                            >
                              Apply on {provider.jobProvider}
                            </button>
                          ))
                        ) : (
                          <p>No application link available</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  null
                )}
              </div>
            </div>
          )}
          <Routes>
            <Route path="my-details" element={<div className="card"><MyDetails userEmail={email} /></div>} />
            <Route path="profile" element={<div className="card"><Profile /></div>} />
            <Route path="password" element={<div className="card"><Password /></div>} />
            <Route path="team" element={<div className="card"><Team /></div>} />
            <Route path="plan" element={<div className="card"><Plan /></div>} />
            <Route path="billing" element={<div className="card"><Billing /></div>} />
            <Route path="email" element={<div className="card"><Email /></div>} />
            <Route path="notifications" element={<div className="card"><Notifications /></div>} />
            <Route path="integrations" element={<div className="card"><Integrations /></div>} />
            <Route path="projects" element={<div className="card"><Projects /></div>} />
            <Route path="tasks" element={<div className="card"><Tasks /></div>} />
            <Route path="reporting" element={<div className="card"><Reporting /></div>} />
            <Route path="users" element={<div className="card"><Users /></div>} />
            <Route path="dash" element={<div className="card"><Dash /></div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
