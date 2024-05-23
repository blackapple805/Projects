const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Test DB connection
sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});


// Define PORT
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use('/api/users', userRouter);
app.use('/api/tasks', taskRouter);