const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // Add other properties here
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
