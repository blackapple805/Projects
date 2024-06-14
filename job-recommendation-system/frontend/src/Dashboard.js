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
      if (data && Array.isArray(data.response.jobs)) {
        setTestRecommendations(data.response.jobs);
      } else {
        console.error('Invalid data format:', data);
        setTestRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching test recommendations:', error);

      // Mock data fallback
      const mockData = [
        {
          title: 'Software Engineer II, Full Stack, Geo at Google',
          companyName: 'Google',
          location: 'Bengaluru, Karnataka, India',
          description: "Minimum qualifications: Bachelor's degree or equivalent practical experience. 1 year of experience with software development.",
          applyUrl: 'https://careers.google.com/jobs/results/108699149884367558-software-engineer-ii/'
        },
        {
          title: 'Student Researcher, 2024 at Google',
          companyName: 'Google',
          location: 'Munich, Bavaria, Germany',
          description: 'Placeholder job description to be used only by the Campus team. Please complete your application before June 21, 2024.',
          applyUrl: 'https://careers.google.com/jobs/results/102147380345742022-student-researcher/'
        }
      ];
      setTestRecommendations(mockData);
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
          </ul>
        </aside>
        <main className="main-content">
          <div className="recommendations-container">
            <div className="card">
              <h2>Test Job Recommendations</h2>
              <button onClick={fetchTestRecommendations} className="fetch-button">Fetch Test Recommendations</button>
              {testRecommendations.length > 0 ? (
                testRecommendations.map((job, index) => (
                  <div key={index} className="job-card">
                    <h4>{job.title}</h4>
                    <p>{job.location}</p>
                    <p>{job.description}</p>
                    <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="apply-button">Apply</a>
                  </div>
                ))
              ) : (
                <p>No test recommendations available</p>
              )}
            </div>
          </div>
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
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
