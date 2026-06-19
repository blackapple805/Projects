import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyDetails({ user }) {
  const [bio, setBio] = useState('');
  const [desiredPosition, setDesiredPosition] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [preferredCompanies, setPreferredCompanies] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await axios.get('/user-preferences');
        setBio(res.data.bio || '');
        setDesiredPosition(res.data.desired_position || '');
        setPreferredLocation(res.data.preferred_location || '');
        setExperienceLevel(res.data.experience_level || '');
        setPreferredCompanies(res.data.preferred_companies || '');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user preferences:', err);
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleSave = async () => {
    try {
      await axios.put('/user-preferences', {
        bio,
        desired_position: desiredPosition,
        preferred_location: preferredLocation,
        experience_level: experienceLevel,
        preferred_companies: preferredCompanies,
      });
      setEditMode(false);
      toast.success('Your details have been updated.');
    } catch (err) {
      console.error('Error saving user preferences:', err);
      toast.error('Could not update details.');
    }
  };

  if (loading) {
    return <div className="loader-container"><div className="mini-loader"></div></div>;
  }

  return (
    <div>
      <div className="page-head">
        <h2>My details</h2>
        <p>The preferences we use to match you with jobs.</p>
      </div>

      {editMode ? (
        <>
          <div className="details-grid">
            <div className="field">
              <span>Desired position</span>
              <input type="text" value={desiredPosition} onChange={(e) => setDesiredPosition(e.target.value)} placeholder="e.g. Frontend Developer" />
            </div>
            <div className="field">
              <span>Preferred location</span>
              <input type="text" value={preferredLocation} onChange={(e) => setPreferredLocation(e.target.value)} placeholder="e.g. Remote / Austin, TX" />
            </div>
            <div className="field">
              <span>Experience level</span>
              <input type="text" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} placeholder="e.g. Mid level" />
            </div>
            <div className="field">
              <span>Preferred companies</span>
              <input type="text" value={preferredCompanies} onChange={(e) => setPreferredCompanies(e.target.value)} placeholder="e.g. Google, Stripe" />
            </div>
            <div className="field full">
              <span>Bio</span>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short summary about you" />
            </div>
          </div>
          <div className="details-actions">
            <button className="btn btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save details</button>
          </div>
        </>
      ) : (
        <>
          <div className="details-grid">
            <div className="ui-card">
              <div className="section-title"><i className="fas fa-id-badge"></i> Personal</div>
              <div className="data-row"><span className="k">Name</span><span className="v">{user?.name || '—'}</span></div>
              <div className="data-row"><span className="k">Email</span><span className="v">{user?.email || '—'}</span></div>
              <div className="data-row"><span className="k">Phone</span><span className="v">{user?.phone || '—'}</span></div>
            </div>
            <div className="ui-card">
              <div className="section-title"><i className="fas fa-briefcase"></i> Job preferences</div>
              <div className="data-row"><span className="k">Desired position</span><span className="v">{desiredPosition || '—'}</span></div>
              <div className="data-row"><span className="k">Location</span><span className="v">{preferredLocation || '—'}</span></div>
              <div className="data-row"><span className="k">Experience</span><span className="v">{experienceLevel || '—'}</span></div>
              <div className="data-row"><span className="k">Companies</span><span className="v">{preferredCompanies || '—'}</span></div>
            </div>
            <div className="ui-card full">
              <div className="section-title"><i className="fas fa-quote-left"></i> Bio</div>
              <p style={{ color: 'var(--text-soft)', lineHeight: 1.6, fontSize: '0.92rem' }}>{bio || 'No bio added yet.'}</p>
            </div>
          </div>
          <div className="details-actions">
            <button className="btn btn-primary" onClick={() => setEditMode(true)}><i className="fas fa-pen"></i> Edit details</button>
          </div>
        </>
      )}
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

export default MyDetails;