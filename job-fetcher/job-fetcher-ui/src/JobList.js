import React, { useState, useEffect } from 'react';
import './JobList.css';
import axios from 'axios';

const JobList = ({ searchQuery }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      setLoading(true);
      fetchJobs(searchQuery);
    }
  }, [searchQuery]);

  const fetchJobs = async (query) => {
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}%20in%20USA&page=1&num_pages=1&date_posted=all`;
    const options = {
      headers: {
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'x-rapidapi-key': '5959e3c5aemshb6457aeebb127e3p14b826jsn762af38bf976'
      }
    };
    try {
      const response = await axios.get(url, options);
      setJobs(response.data.data);
    } catch (error) {
      console.error('Error fetching job data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-list">
      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        jobs.slice(0, 12).map(job => (
          <div key={job.job_id} className="card job-card">
            <div className="card-body">
              {job.employer_logo && (
                <img 
                  src={job.employer_logo} 
                  alt={`${job.employer_name} logo`} 
                  className="company-logo" 
                  onError={(e) => { e.target.style.display = 'none'; }} // Hide image if it fails to load
                />
              )}
              <h5 className="card-title">{job.job_title || 'N/A'}</h5>
              <h6 className="card-subtitle mb-2 text-muted">{job.employer_name || 'N/A'}</h6>
              <p className="card-text">
                <strong>Location:</strong> {`${job.job_city || 'N/A'}, ${job.job_state || 'N/A'}, ${job.job_country || 'N/A'}`}<br />
                <strong>Employment Type:</strong> {job.job_employment_type || 'N/A'}<br />
                <strong>Posted Date:</strong> {new Date(job.job_posted_at_timestamp * 1000).toLocaleString()}<br />
                <strong>Job Description:</strong> {formatJobDescription(job.job_description)}
              </p>
              <a href={job.job_apply_link} className="btn btn-primary">Apply</a>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

function formatJobDescription(description) {
  if (!description) return 'N/A';
  const maxLength = 150; // Maximum length of the job description
  if (description.length > maxLength) {
    return `${description.substring(0, maxLength)}...`;
  }
  return description;
}

export default JobList;
