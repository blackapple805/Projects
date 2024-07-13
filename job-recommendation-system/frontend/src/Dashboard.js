import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, NavLink, Route, Routes } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
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
import SideCard from './SideCard';
import Chatbot from './Chatbot';

function Dashboard({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem('email') || 'User');
  const [user, setUser] = useState(null);
  const [testRecommendations, setTestRecommendations] = useState([]);
  const [showChatbox, setShowChatbox] = useState(false);

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

  useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      setUser(JSON.parse(savedUserInfo));
    }
  }, []);

  useEffect(() => {
    if (!user) {
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/user-data', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          setUser(data);
          localStorage.setItem('userInfo', JSON.stringify(data));
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
    }
  }, [user]);

  const handleLogout = () => {
    onLogout();
    localStorage.removeItem('email');
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
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
          <NavLink to="/dashboard"><i className="fas fa-home"></i></NavLink>
          <NavLink to="/dashboard/dash"><i className="fas fa-tachometer-alt"></i></NavLink>
          <NavLink to="/dashboard/projects"><i className="fas fa-briefcase"></i></NavLink>
          <NavLink to="/dashboard/tasks"><i className="fas fa-tasks"></i></NavLink>
          <NavLink to="/dashboard/reporting"><i className="fas fa-chart-line"></i></NavLink>
          <NavLink to="/dashboard/users"><i className="fas fa-users"></i></NavLink>
          <span>{email}</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <div className="dashboard-body">
        <aside className="sidebar">
          <ul>
            <li><NavLink to="/dashboard/my-details"><i className="fas fa-user"></i> My details</NavLink></li>
            <li><NavLink to="/dashboard/profile"><i className="fas fa-id-card"></i> Profile</NavLink></li>
            <li><NavLink to="/dashboard/password"><i className="fas fa-key"></i> Password</NavLink></li>
            <li><NavLink to="/dashboard/team"><i className="fas fa-users-cog"></i> Team</NavLink></li>
            <li><NavLink to="/dashboard/plan"><i className="fas fa-list"></i> Plan</NavLink></li>
            <li><NavLink to="/dashboard/billing"><i className="fas fa-credit-card"></i> Billing</NavLink></li>
            <li><NavLink to="/dashboard/email"><i className="fas fa-envelope"></i> Email</NavLink></li>
            <li><NavLink to="/dashboard/notifications"><i className="fas fa-bell"></i> Notifications</NavLink></li>
            <li><NavLink to="/dashboard/integrations"><i className="fas fa-plug"></i> Integrations</NavLink></li>
          </ul>
        </aside>
        <main className="main-content">
          {location.pathname === '/dashboard' && (
            <div className="recommendations-container">
              <div className="card home-card">
                <h2>Job Recommendations</h2>
                <button onClick={fetchTestRecommendations} className="fetch-button">Fetch Recommendations</button>
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
            <Route path="my-details" element={<div className="card"><MyDetails user={user} /></div>} />
            <Route path="profile" element={<div className="card"><Profile setUser={setUser} /></div>} />
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
      <SideCard 
        position="left" 
        content={<>
          <button className="cool-button" onClick={() => navigate('/dashboard/profile')}>Go to Profile</button>
        </>} 
      />
      <SideCard 
        position="right" 
        content={<>
          <button className="cool-button" onClick={() => setShowChatbox(true)}>Chat with us!</button>
        </>} 
      />
      {showChatbox && (
        <Chatbot onClose={() => setShowChatbox(false)} />
      )}
      <div className="container">
        <div className="gender-selection">
          <ul className="example-2">
            <li className="icon-content">
              <a href="https://linkedin.com/" aria-label="LinkedIn" data-social="linkedin">
                <i className="fab fa-linkedin"></i>
              </a>
              <div className="tooltip">LinkedIn</div>
            </li>
            <li className="icon-content">
              <a href="https://www.github.com/" aria-label="GitHub" data-social="github">
                <i className="fab fa-github"></i>
              </a>
              <div className="tooltip">GitHub</div>
            </li>
            <li className="icon-content">
              <a href="https://www.instagram.com/" aria-label="Instagram" data-social="instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <div className="tooltip">Instagram</div>
            </li>
            <li className="icon-content">
              <a href="https://youtube.com/" aria-label="YouTube" data-social="youtube">
                <i className="fab fa-youtube"></i>
              </a>
              <div className="tooltip">YouTube</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
