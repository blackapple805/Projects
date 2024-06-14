const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password', // Replace with your MySQL root password
  database: 'logindatabase',
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).send({ message: 'No token provided' });
  }
  jwt.verify(token.split(' ')[1], 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.id;
    next();
  });
};

// Root route
app.get('/', (req, res) => {
  res.send('Job Recommendation System API');
});

// Signup route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  console.log('Signup request received:', email);

  // Check if user already exists
  const querySelect = 'SELECT * FROM users WHERE email = ?';
  db.query(querySelect, [email], (err, results) => {
    if (err) {
      console.error('Error checking existing user:', err);
      return res.status(500).send({ message: 'Error checking existing user' });
    }
    if (results.length > 0) {
      return res.status(400).send({ message: 'User already exists' });
    }

    // If user does not exist, proceed to create a new user
    const hashedPassword = bcrypt.hashSync(password, 10);
    const queryInsert = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(queryInsert, [email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).send({ message: 'Error creating user' });
      }
      res.status(201).send({ message: 'User created successfully' });
    });
  });
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login request received:', email);

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err || results.length === 0) {
      console.error('Authentication failed:', err);
      return res.status(401).send({ message: 'Authentication failed' });
    }
    const user = results[0];
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      console.error('Invalid password');
      return res.status(401).send({ message: 'Authentication failed' });
    }
    const token = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '1h' });
    res.status(200).send({ token, userId: user.id });
  });
});

// Fetch job recommendations route with position filter
app.get('/recommendations', verifyToken, async (req, res) => {
  const options = {
    method: 'GET',
    url: 'https://jobs-api14.p.rapidapi.com/list',
    params: {
      query: 'Web Developer',
      location: 'United States',
      distance: '1.0',
      language: 'en_GB',
      remoteOnly: 'false',
      datePosted: 'month',
      employmentTypes: 'fulltime;parttime;intern;contractor',
      index: '0'
    },
    headers: {
      'x-rapidapi-host': 'jobs-api14.p.rapidapi.com',
      'x-rapidapi-key': '5959e3c5aemshb6457aeebb127e3p14b826jsn762af38bf976' // Replace with your actual API key
    }
  };

  try {
    const response = await axios.request(options);
    const jobs = response.data.jobs.map(job => ({
      title: job.title,
      companyName: job.companyName,
      location: job.formattedLocation,
      description: job.jobDescription,
      applyUrl: job.jobApplyUrl
    }));
    res.status(200).send(jobs);
  } catch (error) {
    console.error('Error fetching job recommendations:', error);
    res.status(500).send({ message: 'Error fetching job recommendations' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
