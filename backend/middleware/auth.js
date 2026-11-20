import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateTokens } from '../utils/generateToken.js';

const ACCESS_SECRET = process.env.JWT_SECRET || 'dulia_trenz_jwt_secret_dev_key_2026_super_secure';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${ACCESS_SECRET}_refresh_rotator`;

export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 1. If access token exists, verify it
  if (token) {
    try {
      const decoded = jwt.verify(token, ACCESS_SECRET);
      if (decoded.iss === 'admin-portal') throw new Error('Legacy session requires sign-in');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
      }

      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: 'Account has been disabled. Please contact customer support.',
        });
      }

      req.user = user;
      return next();
    } catch (err) {
      // Access token expired or invalid; fall through to refresh token verification
    }
  }

  // 2. If access token was missing or expired, attempt rotating refresh token
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    try {
      const decodedRefresh = jwt.verify(refreshToken, REFRESH_SECRET);
      const user = await User.findById(decodedRefresh.id).select('-password');

      if (!user || user.isActive === false) {
        return res.status(401).json({
          success: false,
          message: 'Session expired or account is disabled. Please log in again.',
        });
      }

      // If user has a stored refresh token, verify it matches to prevent replay
      if (user.refreshToken && user.refreshToken !== refreshToken) {
        // Token reuse or stale token detected; clear cookies and force login
        return res.status(401).json({
          success: false,
          message: 'Invalid session state. Please log in again.',
        });
      }

      // Rotate tokens and set new cookies
      const { refreshToken: newRefresh } = generateTokens(res, user._id);
      user.refreshToken = newRefresh;
      await user.save();

      req.user = user;
      return next();
    } catch (refreshErr) {
      // Refresh token is invalid/expired
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Not authorized, please log in to access this feature.',
  });
};

export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Staff or Admin privileges required.',
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    if (decoded.iss === 'admin-portal') throw new Error('Legacy session requires sign-in');
    const user = await User.findById(decoded.id).select('-password');
    req.user = user?.isActive !== false ? user : null;
  } catch (error) {
    req.user = null;
  }
  next();
};
