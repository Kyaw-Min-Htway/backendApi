require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const authRoutes = require('./src/routes/authRoutes');
const restaurantRoutes = require('./src/routes/restaurantRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'));

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => console.log('User disconnected'));
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

async function sendPushNotification(expoPushToken, title, body) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { someData: 'goes here' },
  };

  await axios.post('https://exp.host/--/api/v2/push/send', message, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

app.post('/api/notify', async (req, res) => {
  const { userId, title, body } = req.body;
  const user = await require('./src/models/User').findById(userId);
  if (user.pushToken) {
    await sendPushNotification(user.pushToken, title, body);
  }
  res.json({ message: 'Notification sent' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});