import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, NavLink, Route, Routes } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
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
import Resume from './Resume';
import Chatbot from '../components/Chatbot';

// Single source of truth for the sidebar links.
const NAV = [
  { to: '/dashboard', icon: 'fa-house', label: 'Home', end: true },
  { to: '/dashboard/dash', icon: 'fa-chart-pie', label: 'Overview' },
  { to: '/dashboard/my-details', icon: 'fa-user', label: 'My details' },
  { to: '/dashboard/resume', icon: 'fa-file-arrow-up', label: 'Resume' },
  { to: '/dashboard/profile', icon: 'fa-id-card', label: 'Profile' },
  { to: '/dashboard/projects', icon: 'fa-briefcase', label: 'Projects' },
  { to: '/dashboard/tasks', icon: 'fa-list-check', label: 'Tasks' },
  { to: '/dashboard/reporting', icon: 'fa-chart-line', label: 'Reporting' },
  { to: '/dashboard/team', icon: 'fa-users', label: 'Team' },
  { to: '/dashboard/billing', icon: 'fa-credit-card', label: 'Billing' },
  { to: '/dashboard/notifications', icon: 'fa-bell', label: 'Notifications' },
  { to: '/dashboard/integrations', icon: 'fa-plug', label: 'Integrations' },
];

// Map a pathname to a readable page title for the top bar.
function titleFor(pathname) {
  if (pathname === '/dashboard') return 'Job Recommendations';
  const slug = pathname.split('/').pop();
  const match = NAV.find(n => n.to.endsWith(slug));
  if (match) return match.label;
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function Dashboard() {
  const location = useLocation();
  const [email] = useState(localStorage.getItem('email') || 'Guest');
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(
    () => localStorage.getItem('navCollapsed') === '1'
  );

  const toggleCollapse = useCallback(() => {
    setNavCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('navCollapsed', next ? '1' : '0');
      return next;
    });
  }, []);

  const isHome = location.pathname === '/dashboard';

  // Close the mobile nav whenever the route changes.
  useEffect(() => { setNavOpen(false); }, [location.pathname]);

  useEffect(() => {
    const saved = localStorage.getItem('userInfo');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user) return;
    (async () => {
      try {
        const res = await fetch('/user-data', {
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    })();
  }, [user]);

  const fetchRecommendations = useCallback(async () => {
    setLoadingJobs(true);
    setHasFetched(true);
    try {
      const res = await fetch('/recommendations', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecommendations([]);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  // Auto-load jobs the first time the Home page is shown.
  useEffect(() => {
    if (isHome && !hasFetched) {
      fetchRecommendations();
    }
  }, [isHome, hasFetched, fetchRecommendations]);

  const initials = (email || 'G').slice(0, 1).toUpperCase();

  return (
    <div className={`app-shell ${navCollapsed ? 'nav-collapsed' : ''}`}>
      {/* Mobile overlay behind the drawer */}
      <div
        className={`nav-scrim ${navOpen ? 'show' : ''}`}
        onClick={() => setNavOpen(false)}
      />

      {/* Sidebar / drawer */}
      <aside className={`side-nav ${navOpen ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark"><img src="/logo.svg" alt="JobFinder" /></span>
          <span className="brand-name">JobFinder</span>
          <button
            className="nav-collapse-btn"
            onClick={toggleCollapse}
            aria-label={navCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={navCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <i className={`fas ${navCollapsed ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
          </button>
        </div>
        <nav className="nav-links">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="nav-footer">
          <a href="https://github.com/blackapple805" target="_blank" rel="noreferrer" aria-label="GitHub"><i className="fab fa-github"></i></a>
          <a href="https://www.linkedin.com/in/eric-del-angel/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
          <a href="https://www.instagram.com/quest.on.a.dream/" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
          <a href="https://www.youtube.com/@ericangel8220" target="_blank" rel="noreferrer" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
        </div>
      </aside>

      {/* Main column */}
      <div className="main-col">
        <header className="topbar">
          <button className="hamburger" onClick={() => setNavOpen(v => !v)} aria-label="Menu">
            <i className="fas fa-bars"></i>
          </button>
          <h1 className="page-title">{titleFor(location.pathname)}</h1>
          <div className="user-chip">
            <span className="avatar">{initials}</span>
            <span className="user-name">{email}</span>
          </div>
        </header>

        <main className="content">
          {isHome && (
            <section className="home">
              <div className="home-hero glass">
                <div className="hero-copy">
                  <h2>Find your next role</h2>
                  <p>Personalized matches based on your saved preferences and resume.</p>
                </div>
                <button onClick={fetchRecommendations} className="btn btn-primary" disabled={loadingJobs}>
                  <i className={`fas ${loadingJobs ? 'fa-spinner fa-spin' : recommendations.length > 0 ? 'fa-rotate' : 'fa-bolt'}`}></i>
                  {loadingJobs ? 'Finding jobs…' : recommendations.length > 0 ? 'Refresh' : 'Fetch recommendations'}
                </button>
              </div>

              {loadingJobs ? (
                <div className="job-grid">
                  {[0, 1, 2, 3].map(i => <div key={i} className="job-card skeleton" />)}
                </div>
              ) : recommendations.length > 0 ? (
                <div className="job-grid">
                  {recommendations.map((job, index) => (
                    <article key={index} className="job-card glass">
                      <div className="job-top">
                        {job.image
                          ? <img src={job.image} alt="" className="job-logo" />
                          : <span className="job-logo placeholder"><i className="fas fa-building"></i></span>}
                        <div className="job-head">
                          <h3>{job.title}</h3>
                          <span className="job-company">{job.company}</span>
                        </div>
                      </div>
                      <div className="job-meta">
                        {job.location && <span className="tag"><i className="fas fa-location-dot"></i> {job.location}</span>}
                        {job.employmentType && <span className="tag"><i className="fas fa-clock"></i> {job.employmentType}</span>}
                      </div>
                      {job.description && <p className="job-desc">{job.description}</p>}
                      <div className="job-actions">
                        {job.jobProviders && job.jobProviders.length > 0 ? (
                          job.jobProviders.slice(0, 3).map((p, i) => (
                            <button key={i} className="btn btn-secondary btn-sm" onClick={() => window.open(p.url, '_blank')}>
                              Apply on {p.jobProvider}
                            </button>
                          ))
                        ) : (
                          <span className="muted">No application link</span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : hasFetched ? (
                <div className="empty glass">
                  <i className="fas fa-compass"></i>
                  <h3>No matching jobs right now</h3>
                  <p>Try updating your preferences in <strong>My details</strong>, then hit Refresh.</p>
                </div>
              ) : (
                <div className="empty glass">
                  <i className="fas fa-compass"></i>
                  <h3>Loading your matches…</h3>
                  <p>Hang tight while we pull roles that match your profile.</p>
                </div>
              )}
            </section>
          )}

          <Routes>
            <Route path="my-details" element={<div className="panel glass"><MyDetails user={user} /></div>} />
            <Route path="resume" element={<div className="panel glass"><Resume /></div>} />
            <Route path="profile" element={<div className="panel glass"><Profile setUser={setUser} /></div>} />
            <Route path="password" element={<div className="panel glass"><Password /></div>} />
            <Route path="team" element={<div className="panel glass"><Team /></div>} />
            <Route path="plan" element={<div className="panel glass"><Plan /></div>} />
            <Route path="billing" element={<div className="panel glass"><Billing /></div>} />
            <Route path="email" element={<div className="panel glass"><Email /></div>} />
            <Route path="notifications" element={<div className="panel glass"><Notifications /></div>} />
            <Route path="integrations" element={<div className="panel glass"><Integrations /></div>} />
            <Route path="projects" element={<div className="panel glass"><Projects /></div>} />
            <Route path="tasks" element={<div className="panel glass"><Tasks /></div>} />
            <Route path="reporting" element={<div className="panel glass"><Reporting /></div>} />
            <Route path="users" element={<div className="panel glass"><Users /></div>} />
            <Route path="dash" element={<div className="panel glass"><Dash /></div>} />
          </Routes>
        </main>
      </div>

      {/* Floating chat button + panel */}
      <button
        className={`chat-fab ${navOpen ? 'chat-fab-hidden' : ''}`}
        onClick={() => setShowChat(true)}
        aria-label="Chat with us"
      >
        <i className="fas fa-comment-dots"></i>
      </button>
      {showChat && <Chatbot onClose={() => setShowChat(false)} />}
    </div>
  );
}

export default Dashboard;