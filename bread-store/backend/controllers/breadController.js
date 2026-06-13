const db = require('../config/db');

const getBreads = (req, res) => {
  try {
    const breads = db.prepare('SELECT * FROM breads ORDER BY name').all();
    res.json(breads);
  } catch (err) {
    console.error('Error fetching breads:', err);
    res.status(500).json({ message: 'Failed to fetch breads' });
  }
};

module.exports = {
  getBreads,
};
