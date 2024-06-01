const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
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

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Function to handle ML requests
function handleMLRequest(username, requestData, callback) {
  const scriptPath = path.join(__dirname, 'scripts', 'ml_model.py');
  const pythonProcess = spawn('python', [scriptPath, JSON.stringify(requestData)]);

  pythonProcess.stdout.on('data', (data) => {
    const resultData = JSON.parse(data.toString());
    saveMLRequest(username, requestData, resultData, callback);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error: ${data}`);
  });
}

// Function to save ML request data in the database
function saveMLRequest(username, requestData, resultData, callback) {
  const query = 'INSERT INTO ml_requests (username, request_data, result_data) VALUES (?, ?, ?)';
  db.query(query, [username, JSON.stringify(requestData), JSON.stringify(resultData)], (err, results) => {
    if (err) throw err;
    callback();
  });
}

// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.query(query, [username, password], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.redirect(`/welcome?username=${username}`);
    } else {
      res.redirect('/error');
    }
  });
});

app.get('/welcome', (req, res) => {
  const { username } = req.query;
  res.render('welcome', { username });
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

// New route to handle ML requests
app.post('/ml_request', upload.single('csvFile'), (req, res) => {
  const { username, requestData } = req.body;

  if (req.file) {
    // Process CSV file
    const filePath = req.file.path;
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        fs.unlinkSync(filePath); // Remove the uploaded file after processing

        // Generate unique timestamps for each data point
        const currentTime = new Date().getTime();
        const timeInterval = 1000; // 1 second interval
        results.forEach((item, index) => {
          item.timestamp = new Date(currentTime + index * timeInterval).toISOString();
        });

        // Pass processed data to the ML model
        handleMLRequest(username, results, () => {
          res.send('ML request processed and saved.');
        });
      });
  } else {
    // Handle text input
    if (!requestData) {
      res.status(400).send('No data provided.');
      return;
    }

    try {
      const parsedData = JSON.parse(requestData);
      handleMLRequest(username, parsedData, () => {
        res.send('ML request processed and saved.');
      });
    } catch (err) {
      res.status(400).send('Invalid JSON format.');
    }
  }
});

// New route to fetch ML results
app.get('/ml_results', (req, res) => {
  const { username } = req.query;
  const query = 'SELECT result_data, created_at FROM ml_requests WHERE username = ? ORDER BY created_at DESC LIMIT 10'; // Fetch the last 10 results

  db.query(query, [username], (err, results) => {
    if (err) throw err;

    const labels = results.map(result => result.created_at);
    const data = results.map(result => JSON.parse(result.result_data).prediction);

    res.json({
      labels: labels,
      results: data
    });
  });
});

// New route to clear ML request data
app.post('/clear_ml_requests', (req, res) => {
    const { username } = req.body;
    const query = 'DELETE FROM ml_requests WHERE username = ?';

    db.query(query, [username], (err, results) => {
        if (err) throw err;
        res.send('ML request data cleared.');
    });
});

// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});