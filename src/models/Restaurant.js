const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  location: { type: String },
  image: { type: String }, // Image URL သိမ်းဖို့
  menu: [{ name: String, price: Number, image: String }], // Menu items မှာလည်း image ထည့်လို့ရအောင်
});

module.exports = mongoose.model('Restaurant', restaurantSchema);