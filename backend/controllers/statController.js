const Workout = require('../models/Workout');
const { inMemoryWorkouts } = require('./workoutController');
const mongoose = require('mongoose');

/**
 * @desc    Get user workout statistics dynamically calculated from MongoDB (or memory)
 * @route   GET /api/stats/:userId
 */
const getUserStats = async (req, res, next) => {
  try {
    const { userId } = req.params;

    let workouts = [];

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (userId && userId !== 'all') {
        query = { userId };
      }
      workouts = await Workout.find(query);
    } else {
      if (userId && userId !== 'all') {
        workouts = inMemoryWorkouts.filter((w) => w.userId === userId || w.userId === 'default_user');
      } else {
        workouts = inMemoryWorkouts;
      }
    }

    if (!workouts || workouts.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalWorkouts: 0,
          totalReps: 0,
          correctReps: 0,
          incorrectReps: 0,
          averageAccuracy: 0,
          mostPerformedExercise: 'None',
        },
      });
    }

    let totalWorkouts = workouts.length;
    let totalReps = 0;
    let correctReps = 0;
    let incorrectReps = 0;
    let sumAccuracy = 0;
    const exerciseCountMap = {};

    workouts.forEach((w) => {
      totalReps += w.totalReps || 0;
      correctReps += w.correctReps || 0;
      incorrectReps += w.incorrectReps || 0;
      sumAccuracy += w.accuracy || 0;

      const exercise = w.exercise || 'Unknown';
      exerciseCountMap[exercise] = (exerciseCountMap[exercise] || 0) + 1;
    });

    const averageAccuracy = Number((sumAccuracy / totalWorkouts).toFixed(1));

    let mostPerformedExercise = 'None';
    let maxCount = 0;
    for (const [ex, count] of Object.entries(exerciseCountMap)) {
      if (count > maxCount) {
        maxCount = count;
        mostPerformedExercise = ex;
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        totalWorkouts,
        totalReps,
        correctReps,
        incorrectReps,
        averageAccuracy,
        mostPerformedExercise,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserStats,
};
