const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'your_database_name'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  
  db.query(query, [username, password], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.redirect(`/dashboard?username=${username}`);
    } else {
      res.render('login', { error: 'User not found or incorrect password!' });
    }
  });
});

app.get('/dashboard', (req, res) => {
  const { username } = req.query;
  const query = 'SELECT * FROM users WHERE username = ?';
  
  db.query(query, [username], (err, results) => {
    if (err) throw err;
    const user = results[0];
    const transactionsQuery = 'SELECT * FROM transactions WHERE user_id = ?';

    db.query(transactionsQuery, [user.id], (err, transactions) => {
      if (err) throw err;
      res.render('dashboard', { user, transactions });
    });
  });
});

app.get('/add-transaction', (req, res) => {
  const { username } = req.query;
  res.render('add-transaction', { username, error: null });
});

app.post('/add-transaction', (req, res) => {
  const { username, amount, type, description, date } = req.body;
  
  // Validate amount
  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.render('add-transaction', { username, error: 'Invalid amount. Please enter a positive number.' });
  }

  const query = 'SELECT * FROM users WHERE username = ?';

  db.query(query, [username], (err, results) => {
    if (err) throw err;
    const user = results[0];
    const insertQuery = 'INSERT INTO transactions (user_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?)';

    db.query(insertQuery, [user.id, parseFloat(amount).toFixed(2), type, description, date], (err, results) => {
      if (err) throw err;
      res.redirect(`/dashboard?username=${username}`);
    });
  });
});

app.get('/delete-transaction/:id', (req, res) => {
  const transactionId = req.params.id;
  const { username } = req.query;

  const deleteQuery = 'DELETE FROM transactions WHERE id = ?';

  db.query(deleteQuery, [transactionId], (err, results) => {
    if (err) throw err;
    res.redirect(`/dashboard?username=${username}`);
  });
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';

  db.query(query, [username, password], (err, results) => {
    if (err) throw err;
    res.redirect('/?message=Account created successfully');
  });
});

app.get('/error', (req, res) => {
  res.render('error');
});

// Logout route
app.post('/logout', (req, res) => {
  res.redirect('/');
});

// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
