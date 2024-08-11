const express = require('express');
const { getBreads } = require('../controllers/breadController');
const router = express.Router();

router.get('/breads', getBreads);

module.exports = router;
