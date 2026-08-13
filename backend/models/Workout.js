const mongoose = require('mongoose');

const repRecordSchema = new mongoose.Schema(
  {
    repNumber: { type: Number, required: true },
    timestamp: { type: String },
    isCorrect: { type: Boolean, required: true },
    score: { type: Number },
    failureReason: { type: String },
    metrics: {
      kneeAlignment: Number,
      depth: Number,
      stability: Number,
      rangeOfMotion: Number,
      forwardLean: Number,
    },
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: false,
      default: 'default_user',
    },
    exercise: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
    },
    totalReps: {
      type: Number,
      required: true,
      min: [0, 'Total reps cannot be negative'],
      default: 0,
    },
    correctReps: {
      type: Number,
      required: true,
      min: [0, 'Correct reps cannot be negative'],
      default: 0,
    },
    incorrectReps: {
      type: Number,
      required: true,
      min: [0, 'Incorrect reps cannot be negative'],
      default: 0,
    },
    accuracy: {
      type: Number,
      required: true,
      min: [0, 'Accuracy cannot be less than 0'],
      max: [100, 'Accuracy cannot exceed 100'],
      default: 100,
    },
    duration: {
      type: Number,
      required: true,
      min: [0, 'Duration cannot be negative'],
      default: 0,
    },
    formScore: {
      type: Number,
      default: 90,
    },
    feedback: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    metrics: {
      kneeAlignment: { type: Number, default: 90 },
      depth: { type: Number, default: 90 },
      stability: { type: Number, default: 90 },
      rangeOfMotion: { type: Number, default: 90 },
      forwardLean: { type: Number, default: 90 },
    },
    repHistory: [repRecordSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Workout', workoutSchema);
