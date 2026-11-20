import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getTurso } from '../config/turso.js';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { generateTokens, clearTokenCookie } from '../utils/generateToken.js';

// @desc    Register a new customer (email/password)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone?.trim() || '',
      role: 'customer', // strictly enforce customer role
      provider: 'local',
      authProvider: 'local',
      emailVerified: false,
      lastLogin: new Date(),
    });

    const { accessToken, refreshToken } = generateTokens(res, user._id);
    user.refreshToken = refreshToken;
    await user.save();

    console.log(`[SECURITY] New local customer registered (ID: ${user._id})`);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token: accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        provider: user.provider,
        emailVerified: user.emailVerified,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

const migrateLegacyAdmin = async (email, password) => {
  const client = await getTurso();
  const { rows } = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'admins'"
  );
  if (!rows.length) return null;

  const { rows: admins } = await client.execute({
    sql: `SELECT email, password_hash, role FROM admins
          WHERE email = ? COLLATE NOCASE AND role IN ('admin', 'staff') LIMIT 1`,
    args: [email],
  });
  const legacy = admins[0];
  if (typeof legacy?.password_hash !== 'string' || !(await bcrypt.compare(password, legacy.password_hash))) {
    return null;
  }

  const id = crypto.randomBytes(12).toString('hex');
  const now = new Date().toISOString();
  const user = {
    _id: id,
    id,
    email,
    name: legacy.role === 'admin' ? 'Dulia Administrator' : 'Dulia Staff',
    role: legacy.role,
    password: legacy.password_hash,
    provider: 'local',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await client.execute({
    sql: `INSERT INTO users (id, data, createdAt, updatedAt)
          SELECT ?, ?, ?, ? FROM admins
          WHERE email = ? COLLATE NOCASE AND password_hash = ? AND role = ?
            AND NOT EXISTS (
              SELECT 1 FROM users WHERE json_extract(data, '$.email') = ? COLLATE NOCASE
            )
          LIMIT 1`,
    args: [id, JSON.stringify(user), now, now, email, legacy.password_hash, legacy.role, email],
  });

  return User.findOne({ email });
};

// @desc    Authenticate user with email & password
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password || password.length > 128) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) user = await migrateLegacyAdmin(normalizedEmail, password);
    if (!user && (normalizedEmail === 'admin@duliatrendz.com' || normalizedEmail === 'admin@duliatrenz.com')) {
      user = await User.findOne({ email: { $in: ['admin@duliatrendz.com', 'admin@duliatrenz.com'] } });
    }

    if (!user || (req.path === '/admin/login' && !['admin', 'staff'].includes(user.role))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isActive === false) {
      console.warn(`[SECURITY] Disabled user attempted login (ID: ${user._id})`);
      return res.status(403).json({
        success: false,
        message: 'Account has been disabled. Please contact customer support.',
      });
    }

    // If account was created with Google without a password
    if (user.provider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was created with Google. Please use "Continue with Google" to sign in.',
      });
    }

    const isMatch = user ? await user.matchPassword(password) : false;
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const { accessToken, refreshToken } = generateTokens(res, user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    console.log(`[SECURITY] User logged in successfully (ID: ${user._id})`);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token: accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        provider: user.provider,
        emailVerified: user.emailVerified,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user, clear cookies & revoke session
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
      console.log(`[SECURITY] User session revoked for User ID: ${req.user._id}`);
    } else if (req.cookies?.refreshToken) {
      await User.findOneAndUpdate({ refreshToken: req.cookies.refreshToken }, { refreshToken: null });
    }
  } catch (err) {
    console.warn('[SECURITY] Notice on logout session cleanup:', err.message);
  } finally {
    clearTokenCookie(res);
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isActive === false) {
      clearTokenCookie(res);
      return res.status(403).json({ success: false, message: 'Account is disabled.' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        provider: user.provider,
        emailVerified: user.emailVerified,
        addresses: user.addresses,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

    if (req.body.email && req.body.email.toLowerCase() !== user.email) {
      const emailTaken = await User.findOne({ email: req.body.email.toLowerCase() });
      if (emailTaken) {
        return res.status(400).json({ success: false, message: 'This email is already taken.' });
      }
      user.email = req.body.email.toLowerCase();
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        provider: updatedUser.provider,
        emailVerified: updatedUser.emailVerified,
        addresses: updatedUser.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const user = await User.findById(req.user._id);

    if (user.provider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'Google authenticated accounts do not have a password. Use Google to sign in.',
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Generic success to prevent user enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been dispatched.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset link generated.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    generateTokens(res, user._id);

    res.status(200).json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate with Google OAuth 2.0 (Google Identity Services)
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    // 1. Enforce credential presence - NEVER trust profile or user data sent by browser
    if (!credential || typeof credential !== 'string') {
      console.warn('[SECURITY] Google OAuth attempt rejected: missing or invalid credential token');
      return res.status(400).json({
        success: false,
        message: 'Invalid Google authentication request. Credential token is required.',
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('[SECURITY ERROR] GOOGLE_CLIENT_ID is not configured in backend environment variables');
      return res.status(500).json({
        success: false,
        message: 'Authentication service is temporarily unavailable.',
      });
    }

    const client = new OAuth2Client(clientId);
    let payload;

    // 2. Verify Google ID token signature, expiration and audience using official google-auth-library
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.warn('[SECURITY] Google ID token verification rejected:', verifyErr.message);
      return res.status(401).json({
        success: false,
        message: 'Google sign-in verification failed. Token is invalid or expired.',
      });
    }

    if (!payload) {
      console.warn('[SECURITY] Google token ticket returned empty payload');
      return res.status(401).json({
        success: false,
        message: 'Google sign-in verification failed. Unable to extract token claims.',
      });
    }

    // 3. Strict Audience (aud) check
    if (payload.aud !== clientId) {
      console.warn(`[SECURITY] Google token aud mismatch: expected ${clientId}, received ${payload.aud}`);
      return res.status(401).json({
        success: false,
        message: 'Google sign-in verification failed. Invalid audience.',
      });
    }

    // 4. Strict Issuer (iss) check
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) {
      console.warn(`[SECURITY] Google token invalid issuer: ${payload.iss}`);
      return res.status(401).json({
        success: false,
        message: 'Google sign-in verification failed. Untrusted token issuer.',
      });
    }

    // 5. Strict Email Verification check
    if (!payload.email_verified) {
      console.warn(`[SECURITY] Google token rejected: email is not verified by Google`);
      return res.status(400).json({
        success: false,
        message: 'Your Google email address is unverified. Please verify your Google account before signing in.',
      });
    }

    // 6. Read user data (sub, email, name, picture) ONLY from verified payload, NEVER from request body
    const googleId = payload.sub;
    const verifiedEmail = payload.email.toLowerCase().trim();
    const verifiedName = payload.name?.trim() || verifiedEmail.split('@')[0];
    const verifiedAvatar = payload.picture || '';

    // 7. MongoDB Lookup Logic:
    // Step A: Find by googleId
    let user = await User.findOne({ googleId });

    if (user) {
      if (user.isActive === false) {
        console.warn(`[SECURITY] Disabled user attempted Google login (User ID: ${user._id})`);
        return res.status(403).json({
          success: false,
          message: 'Account has been disabled. Please contact customer support.',
        });
      }

      // Update lastLogin & avatar from verified Google payload
      user.lastLogin = new Date();
      if (verifiedAvatar) user.avatar = verifiedAvatar;
      if (verifiedName && !user.name) user.name = verifiedName;
      user.emailVerified = true;
      user.isVerified = true;
      console.log(`[SECURITY] Google OAuth login verified for existing user ID: ${user._id}`);
    } else {
      // Step B: Otherwise find by verified email
      user = await User.findOne({ email: verifiedEmail });

      if (user) {
        if (user.isActive === false) {
          console.warn(`[SECURITY] Disabled user attempted Google account link (User ID: ${user._id})`);
          return res.status(403).json({
            success: false,
            message: 'Account has been disabled. Please contact customer support.',
          });
        }

        // Link existing local account to Google OAuth
        user.googleId = googleId;
        user.emailVerified = true;
        user.isVerified = true;
        user.lastLogin = new Date();
        if (verifiedAvatar && !user.avatar) user.avatar = verifiedAvatar;
        console.log(`[SECURITY] Linked existing local account to Google OAuth (User ID: ${user._id})`);
      } else {
        // Step C: Otherwise create a new customer account
        // Security requirement: NEVER let the client set role (role defaults strictly to 'customer')
        user = new User({
          name: verifiedName,
          email: verifiedEmail,
          googleId,
          avatar: verifiedAvatar,
          provider: 'google',
          authProvider: 'google',
          emailVerified: true,
          isVerified: true,
          role: 'customer',
          lastLogin: new Date(),
        });
        console.log(`[SECURITY] New customer created via verified Google OAuth`);
      }
    }

    // 8. Start secure session: Issue short-lived access JWT and rotating refresh token in httpOnly, SameSite=Lax cookies
    const { accessToken, refreshToken } = generateTokens(res, user._id);
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Signed in with Google successfully.',
      token: accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.role,
        provider: user.provider,
        emailVerified: user.emailVerified,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    console.error('[SECURITY ERROR] Unexpected Google OAuth error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again later.',
    });
  }
};
