const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: Number,
  images: [String],
  category: String,
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
