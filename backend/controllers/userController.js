const User = require('../models/User');
const mongoose = require('mongoose');

// In-memory fallback array for users when DB is disconnected
const inMemoryUsers = [];

/**
 * @desc    Create a new user
 * @route   POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if Mongoose is connected to MongoDB Atlas
    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ email: normalizedEmail });

      if (user) {
        return res.status(200).json({
          success: true,
          message: 'User already exists',
          user,
        });
      }

      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user,
      });
    } else {
      // In-memory fallback
      let user = inMemoryUsers.find((u) => u.email === normalizedEmail);
      if (user) {
        return res.status(200).json({
          success: true,
          message: 'User already exists (in-memory)',
          user,
        });
      }

      user = {
        _id: `mem_user_${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        createdAt: new Date().toISOString(),
      };
      inMemoryUsers.push(user);

      return res.status(201).json({
        success: true,
        message: 'User created successfully (in-memory mode)',
        user,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      return res.status(200).json({
        success: true,
        user,
      });
    } else {
      const user = inMemoryUsers.find((u) => u._id === id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      return res.status(200).json({
        success: true,
        user,
      });
    }
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found (Invalid ID format)',
      });
    }
    next(error);
  }
};

module.exports = {
  createUser,
  getUserById,
};
