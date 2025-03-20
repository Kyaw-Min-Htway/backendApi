const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

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

router.get('/', async (req, res) => {
  const restaurants = await Restaurant.find();
  res.json(restaurants);
});

router.get('/:id', async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  res.json(restaurant);
});

router.post('/', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  const { name, cuisine, location, menu } = req.body;
  const restaurant = new Restaurant({
    name,
    cuisine,
    location,
    menu: JSON.parse(menu),
    image: req.file ? `/uploads/${req.file.filename}` : null,
  });
  await restaurant.save();
  res.status(201).json(restaurant);
});

router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  const { name, cuisine, location, menu } = req.body;
  const updateData = {
    name,
    cuisine,
    location,
    menu: JSON.parse(menu),
  };
  if (req.file) updateData.image = `/uploads/${req.file.filename}`;
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.json(restaurant);
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await Restaurant.findByIdAndDelete(req.params.id);
  res.json({ message: 'Restaurant deleted' });
});

module.exports = router;