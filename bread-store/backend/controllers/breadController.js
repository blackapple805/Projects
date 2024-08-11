const connection = require('../config/db');

const getBreads = (req, res) => {
  connection.query('SELECT * FROM breads', (err, results) => {
    if (err) {
      console.error('Error fetching breads:', err);
      return res.status(500).send(err);
    }
    console.log('Breads fetched successfully:', results);
    res.json(results);
  });
};

module.exports = {
  getBreads,
};
