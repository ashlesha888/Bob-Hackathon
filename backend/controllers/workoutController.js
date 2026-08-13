const Workout = require('../models/Workout');
const mongoose = require('mongoose');

// In-memory fallback array for workouts when DB is disconnected
const inMemoryWorkouts = [];

/**
 * Helper to normalize and validate workout payloads
 */
function normalizeWorkoutData(body) {
  const exercise = body.exercise || body.exerciseName || 'Bodyweight Squat';
  
  let correctReps = Number(body.correctReps ?? body.reps ?? 0);
  let incorrectReps = Number(body.incorrectReps ?? 0);
  let totalReps = Number(body.totalReps ?? (correctReps + incorrectReps));

  if (totalReps < correctReps + incorrectReps) {
    totalReps = correctReps + incorrectReps;
  }

  let duration = Number(body.duration ?? body.durationSeconds ?? 0);
  let formScore = Number(body.formScore ?? 90);

  let accuracy;
  if (totalReps > 0) {
    accuracy = Number(((correctReps / totalReps) * 100).toFixed(1));
  } else if (body.accuracy !== undefined || body.formAccuracy !== undefined) {
    accuracy = Number(body.accuracy ?? body.formAccuracy ?? 100);
  } else {
    accuracy = 100;
  }

  accuracy = Math.max(0, Math.min(100, accuracy));

  const userId = body.userId || 'default_user';
  const feedback = body.feedback || body.formBreakdown || [];
  const metrics = body.metrics || {
    kneeAlignment: 90,
    depth: 90,
    stability: 90,
    rangeOfMotion: 90,
    forwardLean: 90,
  };
  const repHistory = Array.isArray(body.repHistory) ? body.repHistory : [];

  return {
    userId,
    exercise,
    totalReps,
    correctReps,
    incorrectReps,
    accuracy,
    duration,
    formScore,
    feedback,
    metrics,
    repHistory,
  };
}

/**
 * @desc    Save a completed workout session
 * @route   POST /api/workouts
 */
const createWorkout = async (req, res, next) => {
  try {
    const { exercise, totalReps, correctReps, incorrectReps, accuracy, duration } = req.body;

    if (!exercise || typeof exercise !== 'string' || !exercise.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Exercise name is required.',
      });
    }

    if (
      (totalReps !== undefined && totalReps < 0) ||
      (correctReps !== undefined && correctReps < 0) ||
      (incorrectReps !== undefined && incorrectReps < 0) ||
      (duration !== undefined && duration < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Reps and duration cannot be negative numbers.',
      });
    }

    if (correctReps > totalReps && totalReps > 0) {
      return res.status(400).json({
        success: false,
        message: 'correctReps cannot be greater than totalReps.',
      });
    }

    if (incorrectReps > totalReps && totalReps > 0) {
      return res.status(400).json({
        success: false,
        message: 'incorrectReps cannot be greater than totalReps.',
      });
    }

    if (accuracy !== undefined && (accuracy < 0 || accuracy > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Accuracy must be a number between 0 and 100.',
      });
    }

    const workoutPayload = normalizeWorkoutData(req.body);

    if (mongoose.connection.readyState === 1) {
      const workout = await Workout.create(workoutPayload);
      return res.status(201).json({
        success: true,
        message: 'Workout session saved successfully to MongoDB',
        workout,
      });
    } else {
      console.warn('⚠️ MongoDB disconnected during POST /api/workouts request');
      return res.status(503).json({
        success: false,
        message: 'Database connection error: MongoDB Atlas is currently not connected.',
      });
    }

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get workout history for a user
 * @route   GET /api/workouts/:userId
 */
const getWorkoutsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (userId && userId !== 'all') {
        query = { userId };
      }
      const workouts = await Workout.find(query).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: workouts.length,
        workouts,
      });
    } else {
      let workouts = inMemoryWorkouts;
      if (userId && userId !== 'all') {
        workouts = inMemoryWorkouts.filter((w) => w.userId === userId || w.userId === 'default_user');
      }
      return res.status(200).json({
        success: true,
        count: workouts.length,
        workouts,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed workout session by workoutId
 * @route   GET /api/workouts/:userId/:workoutId
 */
const getWorkoutById = async (req, res, next) => {
  try {
    const { userId, workoutId } = req.params;
    const idToSearch = workoutId || userId;

    if (mongoose.connection.readyState === 1) {
      const workout = await Workout.findById(idToSearch);
      if (!workout) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found',
        });
      }
      return res.status(200).json({
        success: true,
        workout,
      });
    } else {
      const workout = inMemoryWorkouts.find((w) => w._id === idToSearch || w.id === idToSearch);
      if (!workout) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found',
        });
      }
      return res.status(200).json({
        success: true,
        workout,
      });
    }
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Workout not found (Invalid ID format)',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all workouts (fallback route GET /api/workouts)
 * @route   GET /api/workouts
 */
const getAllWorkouts = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const workouts = await Workout.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: workouts.length,
        workouts,
      });
    } else {
      return res.status(200).json({
        success: true,
        count: inMemoryWorkouts.length,
        workouts: inMemoryWorkouts,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkout,
  getWorkoutsByUserId,
  getWorkoutById,
  getAllWorkouts,
  inMemoryWorkouts,
};
