require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Ensure this matches your frontend
  optionsSuccessStatus: 200,
}));
app.use(bodyParser.json());

// MySQL connection setup (using a pool for better performance)
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'myapp_db',
  connectionLimit: 10, // Pooling connections for performance
});

// Check initial connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
  connection.release();
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Signup route
app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  console.log('Signup request received for:', email);

  // Validate email and password
  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  const querySelect = 'SELECT * FROM users WHERE email = ?';
  db.query(querySelect, [email], (err, results) => {
    if (err) {
      console.error('Database error during user check:', err);
      return res.status(500).send({ message: 'Error checking existing user' });
    }
    if (results.length > 0) {
      return res.status(400).send({ message: 'User already exists' });
    }

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

  // Validate email and password
  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).send({ message: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(401).send({ message: 'Authentication failed' });
    }

    const user = results[0];
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).send({ message: 'Authentication failed' });
    }

    // Respond with a simple success message since we're not using JWTs
    res.status(200).send({ message: 'Login successful', userId: user.id });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
