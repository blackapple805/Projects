import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Resume() {
  const [file, setFile] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [detected, setDetected] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/user-preferences', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.resume_name) setCurrentResume(res.data.resume_name);
      } catch (err) {
        console.error('Error fetching resume info:', err);
      }
    };
    fetchCurrent();
  }, []);

  const validateAndSet = (f) => {
    if (!f) return;
    const allowed = ['application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const okExt = /\.(pdf|docx?|)$/i.test(f.name);
    if (!allowed.includes(f.type) && !okExt) {
      toast.error('Please upload a PDF, DOC, or DOCX file.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 5 MB.');
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    validateAndSet(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.info('Choose a file first.');
      return;
    }
    setUploading(true);
    setDetected(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', file);
      const res = await axios.put('/resume', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setCurrentResume(res.data.resumeName);
      setDetected(res.data.detected);
      setFile(null);
      toast.success('Resume uploaded. Your job search has been updated.');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(err.response?.data?.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="resume-page">
      <header className="resume-head">
        <h2>Resume</h2>
        <p>Upload your resume once. We use it to tailor the jobs we surface for you.</p>
      </header>

      {currentResume && (
        <div className="current-resume glass">
          <i className="fas fa-file-circle-check"></i>
          <div>
            <span className="cr-label">On file</span>
            <span className="cr-name">{currentResume}</span>
          </div>
        </div>
      )}

      <div
        className={`dropzone ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          hidden
          onChange={(e) => validateAndSet(e.target.files[0])}
        />
        <div className="dz-glow" />
        {file ? (
          <div className="dz-file">
            <i className="fas fa-file-lines"></i>
            <div>
              <span className="dz-file-name">{file.name}</span>
              <span className="dz-file-size">{formatSize(file.size)}</span>
            </div>
          </div>
        ) : (
          <>
            <div className="dz-icon"><i className="fas fa-cloud-arrow-up"></i></div>
            <p className="dz-title">Drag your resume here</p>
            <p className="dz-sub">or click to browse — PDF, DOC, DOCX up to 5 MB</p>
          </>
        )}
      </div>

      <div className="resume-actions">
        <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? 'Uploading…' : currentResume ? 'Replace resume' : 'Upload resume'}
        </button>
        {file && !uploading && (
          <button className="btn btn-ghost" onClick={() => setFile(null)}>Clear</button>
        )}
      </div>

      {detected && (detected.desired_position || detected.preferred_location) && (
        <div className="detected glass">
          <h3>We picked up from your resume</h3>
          <ul>
            {detected.desired_position && (
              <li><span>Role</span><strong>{detected.desired_position}</strong></li>
            )}
            {detected.preferred_location && (
              <li><span>Location</span><strong>{detected.preferred_location}</strong></li>
            )}
          </ul>
          <p className="detected-note">These now seed your recommendations. You can fine-tune them under My details.</p>
        </div>
      )}

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

export default Resume;