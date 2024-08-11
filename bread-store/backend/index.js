const express = require('express');
const cors = require('cors');
const breadRoutes = require('./routes/breadRoutes');
const receiptRoutes = require('./routes/receiptRoutes');

const app = express();

// Apply CORS middleware
app.use(cors({
  origin: 'https://super-duper-eureka-464rp5pj7xjh5jj-3000.app.github.dev',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Bread Store API');
});

// Use the routes
app.use('/api', breadRoutes);
app.use('/api', receiptRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
