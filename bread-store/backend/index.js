const express = require('express');
const cors = require('cors');
const breadRoutes = require('./routes/breadRoutes');
const receiptRoutes = require('./routes/receiptRoutes');

const app = express();

// CORS — was hardcoded to a dead GitHub Codespaces URL, which blocked
// the frontend everywhere else. In dev the CRA proxy makes requests
// same-origin anyway; this allows localhost plus an optional
// FRONTEND_URL env var for when you deploy.
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL, // set this in .env when you deploy
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Bread Store API');
});

app.use('/api', breadRoutes);
app.use('/api', receiptRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
