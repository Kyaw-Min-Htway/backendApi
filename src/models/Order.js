const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ name: String, price: Number, image: String }],
  total: { type: Number },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  estimatedDelivery: { type: String },
  deliveryLocation: { type: String },
  deliveryCoordinates: { lat: Number, lng: Number }, // Google Maps coordinates
});

module.exports = mongoose.model('Order', orderSchema);