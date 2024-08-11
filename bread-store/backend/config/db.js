const mysql = require('mysql2');

// Load environment variables from .env file
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1); // Exit the process with a failure code
  } else {
    console.log('Connected to the MySQL database!');
  }
});

module.exports = connection;
