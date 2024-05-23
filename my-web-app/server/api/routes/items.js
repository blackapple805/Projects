// /server/api/routes/items.js

const express = require('express');
const router = express.Router();
const { listItems, createItem, deleteItem } = require('../controllers/itemsController'); // Update this path if necessary

router.get('/', listItems);
router.post('/', createItem);
router.delete('/:id', deleteItem);

module.exports = router;
