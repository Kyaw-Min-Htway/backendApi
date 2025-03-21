const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  location: { type: String },
  image: { type: String },
  menu: [{ name: String, price: Number, image: String }],
  averageRating: { type: Number, default: 0 },
});

module.exports = mongoose.model('Restaurant', restaurantSchema);