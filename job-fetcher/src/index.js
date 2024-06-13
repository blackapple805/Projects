import 'bootstrap/dist/css/bootstrap.min.css';

import fetch from 'node-fetch';

// Define the API endpoint and headers with a broader search query
const keywords = [
  'software developer', 'data scientist', 'machine learning engineer', 'AI engineer', 'software engineer',
  'data analyst', 'full stack developer', 'backend developer', 'frontend developer', 'cloud engineer'
];
const query = keywords.join('%20OR%20');
const url = `https://jsearch.p.rapidapi.com/search?query=${query}%20in%20USA&page=1&num_pages=1&date_posted=all`;

const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-host': 'jsearch.p.rapidapi.com',
    'x-rapidapi-key': '5959e3c5aemshb6457aeebb127e3p14b826jsn762af38bf976'
  }
};

// Function to fetch and display job data
async function fetchJobData() {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    const jobs = result.data;
    jobs.forEach(job => {
      console.log('Job Title:', job.job_title || 'N/A');
      console.log('Company Name:', job.employer_name || 'N/A');
      console.log('Location:', `${job.job_city || 'N/A'}, ${job.job_state || 'N/A'}, ${job.job_country || 'N/A'}`);
      console.log('Employment Type:', job.job_employment_type || 'N/A');
      console.log('Posted Date:', new Date(job.job_posted_at_timestamp * 1000).toLocaleString());
      console.log('Job Description:', formatJobDescription(job.job_description));
      console.log('Apply Link:', job.job_apply_link || 'N/A');
      console.log('---------------------------------------');
    });
  } catch (error) {
    console.error('Error fetching job data:', error);
  }
}

// Function to format the job description
function formatJobDescription(description) {
  if (!description) return 'N/A';
  const lines = description.split('\n').filter(line => line.trim().length > 0);
  const formattedLines = [];
  let count = 0;
  for (let line of lines) {
    formattedLines.push(line);
    count += line.length;
    if (count > 300) break; // Limit description to around 300 characters
  }
  return formattedLines.join(' ').trim();
}

// Call the function to fetch job data
fetchJobData();
