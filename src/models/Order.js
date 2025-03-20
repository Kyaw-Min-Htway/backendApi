const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ name: String, price: Number, image: String }],
  total: { type: Number },
  status: { type: String, default: 'Pending' }, // e.g., Pending, Preparing, On Delivery, Delivered
  createdAt: { type: Date, default: Date.now },
  estimatedDelivery: { type: String }, // e.g., "30-40 mins"
  deliveryLocation: { type: String }, // User address ကနေ ယူမယ်
});

module.exports = mongoose.model('Order', orderSchema);