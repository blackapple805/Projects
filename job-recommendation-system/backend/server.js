const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

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

    // If user does not exist, proceed to create a new user with default values for profile fields
    const hashedPassword = bcrypt.hashSync(password, 10);
    const queryInsert = 'INSERT INTO users (email, password, name, phone, address, profile_picture) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(queryInsert, [email, hashedPassword, '', '', '', ''], (err, result) => {
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
      'x-rapidapi-key': '3174ee127cmsh86affbe38530963p157252jsncbd64bd9917e' // Replace with your actual API key
    }
  };

  try {
    const response = await axios.request(options);
    const jobs = response.data.jobs.map(job => ({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description,
      datePosted: job.datePosted,
      employmentType: job.employmentType,
      image: job.image,
      jobProviders: job.jobProviders
    }));
    res.status(200).send(jobs);
  } catch (error) {
    console.error('Error fetching job recommendations:', error);
    res.status(500).send({ message: 'Error fetching job recommendations' });
  }
});

// Get user profile route
app.get('/profile', verifyToken, (req, res) => {
  const userId = req.userId;

  const query = 'SELECT name, email, phone, address, profile_picture FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).send({ message: 'Error fetching user profile' });
    }
    if (results.length === 0) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send(results[0]);
  });
});

// Update user profile route
app.put('/profile', verifyToken, (req, res) => {
  const { name, phone, address } = req.body;
  const userId = req.userId;

  const query = 'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?';
  db.query(query, [name, phone, address, userId], (err, result) => {
    if (err) {
      console.error('Error updating user profile:', err);
      return res.status(500).send({ message: 'Error updating user profile' });
    }
    res.status(200).send({ message: 'Profile updated successfully' });
  });
});

// Update user profile picture route
app.put('/profile-picture', verifyToken, upload.single('profile_picture'), (req, res) => {
  const profilePicture = req.file.path;
  const userId = req.userId;

  const querySelect = 'SELECT profile_picture FROM users WHERE id = ?';
  db.query(querySelect, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).send({ message: 'Error fetching user profile' });
    }
    const oldProfilePicture = results[0].profile_picture;

    const queryUpdate = 'UPDATE users SET profile_picture = ? WHERE id = ?';
    db.query(queryUpdate, [profilePicture, userId], (err, result) => {
      if (err) {
        console.error('Error updating profile picture:', err);
        return res.status(500).send({ message: 'Error updating profile picture' });
      }
      if (oldProfilePicture) {
        fs.unlink(oldProfilePicture, (err) => {
          if (err) {
            console.error('Error deleting old profile picture:', err);
          }
        });
      }
      res.status(200).send({ message: 'Profile picture updated successfully', profilePicture });
    });
  });
});

// Update user password route
app.put('/update-password', verifyToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  const querySelect = 'SELECT password FROM users WHERE id = ?';
  db.query(querySelect, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user password:', err);
      return res.status(500).send({ message: 'Error fetching user password' });
    }

    const user = results[0];
    const isValidPassword = bcrypt.compareSync(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).send({ message: 'Current password is incorrect' });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    const queryUpdate = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(queryUpdate, [hashedNewPassword, userId], (err, result) => {
      if (err) {
        console.error('Error updating password:', err);
        return res.status(500).send({ message: 'Error updating password' });
      }
      res.status(200).send({ message: 'Password updated successfully' });
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
