const express = require('express');
const router = express.Router();
const {
  createWorkout,
  getWorkoutsByUserId,
  getWorkoutById,
  getAllWorkouts,
} = require('../controllers/workoutController');

// POST /api/workouts - Save completed workout
router.post('/', createWorkout);

// GET /api/workouts - Get all workouts
router.get('/', getAllWorkouts);

// GET /api/workouts/:userId - Get workout history for user
router.get('/:userId', getWorkoutsByUserId);

// GET /api/workouts/:userId/:workoutId - Get specific workout details
router.get('/:userId/:workoutId', getWorkoutById);

module.exports = router;
