import React, { useState } from 'react';
import axios from 'axios';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'https://jsearch.p.rapidapi.com/search', {
          params: {
            query: 'software developer OR data scientist OR machine learning engineer OR AI engineer OR software engineer OR data analyst OR full stack developer OR backend developer OR frontend developer OR cloud engineer in USA',
            page: 1,
            num_pages: 1,
            date_posted: 'all'
          },
          headers: {
            'x-rapidapi-host': 'jsearch.p.rapidapi.com',
            'x-rapidapi-key': '5959e3c5aemshb6457aeebb127e3p14b826jsn762af38bf976'
          }
        }
      );
      setJobs(response.data.data.slice(0, 12)); // Limit to 12 jobs
    } catch (error) {
      console.error('Error fetching job data:', error);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="App-header">Job Fetcher</div>
      <button onClick={fetchJobs} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Jobs'}
      </button>
      <div className="job-list">
        {jobs.map((job, index) => (
          <div key={index} className="job-item">
            <div className="job-header">
              <img src={job.employer_logo || 'default-logo.png'} alt="Company Logo" />
              <h3>{job.job_title}</h3>
            </div>
            <div className="job-body">
              <p><strong>Company Name:</strong> {job.employer_name}</p>
              <p><strong>Location:</strong> {`${job.job_city || 'N/A'}, ${job.job_state || 'N/A'}, ${job.job_country || 'N/A'}`}</p>
              <p><strong>Employment Type:</strong> {job.job_employment_type}</p>
              <p><strong>Posted Date:</strong> {new Date(job.job_posted_at_timestamp * 1000).toLocaleString()}</p>
              <p><strong>Job Description:</strong> {formatJobDescription(job.job_description)}</p>
            </div>
            <div className="job-footer">
              <a href={job.job_apply_link} className="apply-button" target="_blank" rel="noopener noreferrer">Apply</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatJobDescription = (description) => {
  if (!description) return 'N/A';
  let trimmedDescription = description.split('\n').filter(line => line.trim().length > 0).join(' ').trim();
  if (trimmedDescription.length > 150) {
    trimmedDescription = trimmedDescription.substring(0, 147) + '...';
  }
  return trimmedDescription;
};

export default JobList;
