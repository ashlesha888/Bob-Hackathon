const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const statRoutes = require('./routes/statRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const { createWorkout, getAllWorkouts } = require('./controllers/workoutController');
const { getUserStats } = require('./controllers/statController');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Exercise AI Backend is running',
  });
});

// REST API Routes
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/stats', statRoutes);

// Additional Session / Frontend Aliases for complete frontend compatibility
app.post('/api/sessions/complete', createWorkout);
app.get('/api/sessions/history', getAllWorkouts);
app.delete('/api/sessions/history', (req, res) => {
  res.json({ message: 'Session history cleared' });
});
app.get('/api/dashboard/stats', getUserStats);

// 404 & Global Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Exercise AI Backend server running on port ${PORT}`);
});
