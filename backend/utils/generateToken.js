import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET || 'dulia_trenz_jwt_secret_dev_key_2026_super_secure';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${ACCESS_SECRET}_refresh_rotator`;

/**
 * Generates access token and rotating refresh token, sets secure httpOnly cookies
 * @param {import('express').Response} res - Express response object
 * @param {string} userId - User ID
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export const generateTokens = (res, userId) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Short-lived access JWT (15 minutes)
  const accessToken = jwt.sign({ id: userId }, ACCESS_SECRET, {
    expiresIn: '15m',
  });

  // Rotating refresh token (7 days)
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, {
    expiresIn: '7d',
  });

  if (res) {
    // Access token cookie (httpOnly, Secure in prod, SameSite=Lax)
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
      path: '/',
    });

    // Refresh token cookie (httpOnly, Secure in prod, SameSite=Lax)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  return { accessToken, refreshToken };
};

/**
 * Backward compatibility wrapper for existing code expecting `generateToken(res, userId)`
 */
export const generateToken = (res, userId) => {
  const { accessToken } = generateTokens(res, userId);
  return accessToken;
};

/**
 * Clears authentication and refresh cookies from response
 * @param {import('express').Response} res
 */
export const clearTokenCookie = (res) => {
  if (res) {
    const isProduction = process.env.NODE_ENV === 'production';
    const clearOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    };
    res.cookie('token', '', clearOptions);
    res.cookie('refreshToken', '', clearOptions);
  }
};
