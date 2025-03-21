const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  req.user = jwt.verify(token, 'secret_key');
  next();
};

router.post('/', authMiddleware, async (req, res) => {
  const { restaurantId, rating, comment } = req.body;
  const review = new Review({
    userId: req.user.userId,
    restaurantId,
    rating,
    comment,
  });
  await review.save();

  const reviews = await Review.find({ restaurantId });
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Restaurant.findByIdAndUpdate(restaurantId, { averageRating });

  res.status(201).json(review);
});

router.get('/restaurant/:restaurantId', async (req, res) => {
  const reviews = await Review.find({ restaurantId: req.params.restaurantId }).populate('userId', 'name');
  res.json(reviews);
});

module.exports = router;