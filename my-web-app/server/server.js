const express = require('express');
// const mongoose = require('mongoose'); // Comment this out if not connecting to MongoDB
const path = require('path'); // Make sure you require 'path'
const itemsRouter = require('/workspaces/Projects/my-web-app/server/api/routes/items.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Comment out the MongoDB connection if you're not using a database yet
// mongoose.connect('your_database_url', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB...'))
//   .catch(err => console.error('Could not connect to MongoDB...', err));

app.use('/api/items', itemsRouter);

app.use(express.static('../client/build'));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
