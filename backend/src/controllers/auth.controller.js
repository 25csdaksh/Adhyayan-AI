const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Register a new user account
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || name.trim().length < 2) {
    throw ApiError.badRequest('Please provide a name with at least 2 characters.');
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
    throw ApiError.badRequest('Please provide a valid email address.');
  }

  if (!password || password.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters long.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check duplicate email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw ApiError.conflict('An account with this email address already exists.');
  }

  // Hash password & create user
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'user',
    isActive: true,
    lastLoginAt: new Date(),
  });

  // Issue token
  const token = generateToken({
    userId: user._id,
    role: user.role,
  });

  return ApiResponse.success(
    res,
    {
      user,
      token,
    },
    'User account registered successfully',
    201
  );
});

/**
 * Log in an existing user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Please provide both email and password.');
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Query user including passwordHash for comparison
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account is currently disabled. Please contact support.');
  }

  // Update last login timestamp
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Issue token
  const token = generateToken({
    userId: user._id,
    role: user.role,
  });

  return ApiResponse.success(
    res,
    {
      user: user.toJSON(),
      token,
    },
    'User logged in successfully',
    200
  );
});

/**
 * Get authenticated user profile
 * GET /api/auth/me
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  return ApiResponse.success(
    res,
    {
      user: req.user,
    },
    'Authenticated user profile retrieved',
    200
  );
});

/**
 * Update user profile details
 * PATCH /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;

  const updates = {};
  if (name && name.trim().length >= 2) {
    updates.name = name.trim();
  }
  if (avatar !== undefined) {
    updates.avatar = avatar;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return ApiResponse.success(
    res,
    {
      user: updatedUser,
    },
    'Profile updated successfully',
    200
  );
});

/**
 * Log out user (stateless token acknowledgment)
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  return ApiResponse.success(
    res,
    null,
    'Logged out successfully',
    200
  );
});

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  logout,
};
