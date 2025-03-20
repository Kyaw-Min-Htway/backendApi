const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = new Stripe('your_stripe_secret_key'); // Stripe secret key ထည့်ပါ

router.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents (e.g., $10 = 1000)
      currency: 'usd',
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;