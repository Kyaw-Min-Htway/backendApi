const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  req.user = jwt.verify(token, 'secret_key');
  next();
};

const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  next();
};

router.post('/', authMiddleware, async (req, res) => {
  const { items } = req.body;
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const user = await User.findById(req.user.userId);
  const order = new Order({
    userId: req.user.userId,
    items,
    total,
    estimatedDelivery: '30-40 mins',
    deliveryLocation: user.address,
  });
  await order.save();
  req.io.emit('orderUpdate', order);
  if (user.pushToken) {
    await sendPushNotification(user.pushToken, 'Order Placed', `Order #${order._id} has been placed.`);
  }
  res.status(201).json(order);
});

router.get('/', authMiddleware, async (req, res) => {
  const orders = await Order.find({ userId: req.user.userId });
  res.json(orders);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order.userId.toString() !== req.user.userId && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  res.json(order);
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { status, estimatedDelivery } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status, estimatedDelivery },
    { new: true }
  );
  req.io.emit('orderUpdate', order);
  const user = await User.findById(order.userId);
  if (user.pushToken) {
    await sendPushNotification(user.pushToken, 'Order Update', `Order #${order._id} is now ${status}`);
  }
  res.json(order);
});

router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

async function sendPushNotification(expoPushToken, title, body) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { someData: 'goes here' },
  };
  await require('axios').post('https://exp.host/--/api/v2/push/send', message, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

module.exports = router;