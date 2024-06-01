const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

// Root route
app.get('/', (req, res) => {
  res.send('Job Recommendation System API');
});

// Signup route
app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  console.log('Signup request received:', email);
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
  db.query(query, [email, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error creating user:', err);
      return res.status(500).send({ message: 'Error creating user' });
    }
    res.status(201).send({ message: 'User created successfully' });
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
    res.status(200).send({ token });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
