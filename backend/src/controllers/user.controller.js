const User = require('../models/User');
const { getUserUsageSummary } = require('../services/usage/entitlementService');
const { exportUserData, deleteUserAccount } = require('../services/user/userDataService');

/**
 * Get current user profile and settings
 * GET /api/users/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          plan: user.plan || 'free',
          onboardingCompleted: Boolean(user.onboardingCompleted),
          preferences: user.preferences || {},
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch user profile',
    });
  }
};

/**
 * Update user profile / preferences
 * PATCH /api/users/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar, preferences, onboardingCompleted } = req.body;
    const updateData = {};

    if (name && typeof name === 'string' && name.trim()) {
      updateData.name = name.trim();
    }
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }
    if (preferences !== undefined && typeof preferences === 'object') {
      updateData.preferences = preferences;
    }
    if (onboardingCompleted !== undefined) {
      updateData.onboardingCompleted = Boolean(onboardingCompleted);
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updateData }, { new: true }).lean();

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          plan: user.plan || 'free',
          onboardingCompleted: Boolean(user.onboardingCompleted),
          preferences: user.preferences || {},
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update user profile',
    });
  }
};

/**
 * Change user password
 * PUT /api/users/password
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      });
    }

    const user = await User.findById(req.user.id).select('+passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update password',
    });
  }
};

/**
 * Get user usage summary and plan quotas
 * GET /api/users/usage
 */
exports.getUsage = async (req, res) => {
  try {
    const summary = await getUserUsageSummary(req.user.id);
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch usage metrics',
    });
  }
};

/**
 * Export complete user data package
 * GET /api/users/export-data
 */
exports.exportData = async (req, res) => {
  try {
    const exportData = await exportUserData(req.user.id);
    return res.status(200).json({
      success: true,
      data: exportData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to export user data',
    });
  }
};

/**
 * Cascading account and data deletion
 * DELETE /api/users/me
 */
exports.deleteAccount = async (req, res) => {
  try {
    const result = await deleteUserAccount(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted',
      data: result.summary,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete account',
    });
  }
};
