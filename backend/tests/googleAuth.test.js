import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { OAuth2Client } from 'google-auth-library';
import app from '../app.js';
import User from '../models/User.js';
import { connectDB, closeDB } from '../config/db.js';

process.env.NODE_ENV = 'test';
process.env.GOOGLE_CLIENT_ID = 'test-dulia-client-id.apps.googleusercontent.com';
process.env.JWT_SECRET = 'test_jwt_secret_key_1234567890';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_1234567890';

describe('Google OAuth 2.0 & Authentication Security Test Suite', () => {
  let server;
  let baseUrl;
  let originalVerifyIdToken;

  before(async () => {
    await connectDB();
    originalVerifyIdToken = OAuth2Client.prototype.verifyIdToken;

    // Start ephemeral HTTP test server
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    OAuth2Client.prototype.verifyIdToken = originalVerifyIdToken;
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await User.create({
      name: 'Dulia Administrator',
      email: 'admin@duliatrendz.com',
      password: 'Admin@12345',
      role: 'admin',
      isVerified: true,
    });
    await User.create({
      name: 'Aanya Sharma',
      email: 'customer@duliatrendz.com',
      password: 'Customer@12345',
      role: 'customer',
      isVerified: true,
    });
    await closeDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  const apiRequest = async (method, path, { body, headers = {}, cookie = '' } = {}) => {
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (cookie) {
      reqHeaders['Cookie'] = cookie;
    }

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    const setCookieHeaders = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean);

    return {
      status: res.status,
      body: data,
      headers: res.headers,
      cookies: setCookieHeaders,
    };
  };

  test('1. Valid Google ID token: creates new customer with verified Google profile', async () => {
    OAuth2Client.prototype.verifyIdToken = async () => ({
      getPayload: () => ({
        sub: 'google_sub_1001',
        email: 'priya.sharma@example.com',
        name: 'Priya Sharma',
        picture: 'https://lh3.googleusercontent.com/avatar_priya.jpg',
        email_verified: true,
        aud: process.env.GOOGLE_CLIENT_ID,
        iss: 'https://accounts.google.com',
      }),
    });

    const res = await apiRequest('POST', '/api/auth/google', {
      body: { credential: 'mock_valid_google_jwt_credential' },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.name, 'Priya Sharma');
    assert.equal(res.body.user.email, 'priya.sharma@example.com');
    assert.equal(res.body.user.role, 'customer');
    assert.equal(res.body.user.avatar, 'https://lh3.googleusercontent.com/avatar_priya.jpg');
    assert.equal(res.body.user.emailVerified, true);

    // Verify cookies set: token and refreshToken
    const hasTokenCookie = res.cookies.some((c) => c.includes('token='));
    const hasRefreshCookie = res.cookies.some((c) => c.includes('refreshToken='));
    assert.ok(hasTokenCookie, 'Access token cookie should be set');
    assert.ok(hasRefreshCookie, 'Refresh token cookie should be set');

    // Verify saved in DB
    const dbUser = await User.findOne({ googleId: 'google_sub_1001' });
    assert.ok(dbUser, 'User must exist in Turso database');
    assert.equal(dbUser.provider, 'google');
  });

  test('2. Expired Google ID token: rejects with 401 Unauthorized', async () => {
    OAuth2Client.prototype.verifyIdToken = async () => {
      throw new Error('Token used too late, exp 1700000000 < now 1700001000');
    };

    const res = await apiRequest('POST', '/api/auth/google', {
      body: { credential: 'expired_google_jwt_token' },
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid or expired/i);

    const count = await User.countDocuments();
    assert.equal(count, 0, 'No user should be created for expired token');
  });

  test('3. Wrong Audience (aud): rejects with 401 Unauthorized', async () => {
    OAuth2Client.prototype.verifyIdToken = async () => ({
      getPayload: () => ({
        sub: 'google_sub_1002',
        email: 'attacker@example.com',
        name: 'Attacker',
        email_verified: true,
        aud: 'malicious-foreign-client-id.apps.googleusercontent.com',
        iss: 'https://accounts.google.com',
      }),
    });

    const res = await apiRequest('POST', '/api/auth/google', {
      body: { credential: 'token_with_wrong_audience' },
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid audience/i);
  });

  test('4. Wrong Issuer (iss): rejects untrusted token issuer', async () => {
    OAuth2Client.prototype.verifyIdToken = async () => ({
      getPayload: () => ({
        sub: 'google_sub_1003',
        email: 'spoofed@example.com',
        name: 'Spoofed',
        email_verified: true,
        aud: process.env.GOOGLE_CLIENT_ID,
        iss: 'https://fake-google-accounts.org',
      }),
    });

    const res = await apiRequest('POST', '/api/auth/google', {
      body: { credential: 'token_with_fake_issuer' },
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /untrusted token issuer/i);
  });

  test('5. Unverified email: rejects if email_verified is false', async () => {
    OAuth2Client.prototype.verifyIdToken = async () => ({
      getPayload: () => ({
        sub: 'google_sub_1004',
        email: 'unverified@example.com',
        name: 'Unverified User',
        email_verified: false,
        aud: process.env.GOOGLE_CLIENT_ID,
        iss: 'https://accounts.google.com',
      }),
    });

    const res = await apiRequest('POST', '/api/auth/google', {
      body: { credential: 'unverified_email_token' },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /unverified/i);
  });

  test('6. Forged profile in request body: server reads ONLY verified payload', async () => {
    OAuth2Client.prototype.verifyIdToken = async () => ({
      getPayload: () => ({
        sub: 'google_sub_1005',
        email: 'authentic.user@example.com',
        name: 'Authentic User',
        picture: 'https://lh3.googleusercontent.com/real_pic.jpg',
        email_verified: true,
        aud: process.env.GOOGLE_CLIENT_ID,
        iss: 'https://accounts.google.com',
      }),
    });

    // Attacker sends forged admin role and forged email/name in request body
    const res = await apiRequest('POST', '/api/auth/google', {
      body: {
        credential: 'valid_credential',
        role: 'admin',
        name: 'Evil Hacker',
        email: 'hacker@malicious.com',
        picture: 'https://evil.com/hacker.png',
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'customer', 'Role MUST remain customer regardless of request body');
    assert.equal(res.body.user.name, 'Authentic User', 'Name must be from verified Google token');
    assert.equal(res.body.user.email, 'authentic.user@example.com', 'Email must be from verified Google token');
    assert.equal(res.body.user.avatar, 'https://lh3.googleusercontent.com/real_pic.jpg');

    const dbUser = await User.findOne({ email: 'authentic.user@example.com' });
    assert.equal(dbUser.role, 'customer');
  });

  test('7. Existing user login: finds by googleId and updates lastLogin and avatar', async () => {
    const existingUser = await User.create({
      name: 'Existing Customer',
      email: 'existing@example.com',
      googleId: 'google_sub_existing',
      provider: 'google',
      avatar: 'https://old-avatar.com/old.jpg',
      lastLogin: new Date(Date.now() - 86400000),
    });

    OAuth2Client.prototype.verifyIdToken = async () => ({
      getPayload: () => ({
        sub: 'google_sub_existing',
        email: 'existing@example.com',
        name: 'Existing Customer',
        picture: 'https://lh3.googleusercontent.com/new_avatar.jpg',
        email_verified: true,
        aud: process.env.GOOGLE_CLIENT_ID,
        iss: 'https://accounts.google.com',
      }),
    });

    const res = await apiRequest('POST', '/api/auth/google', {
      body: { credential: 'existing_user_token' },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.user._id.toString(), existingUser._id.toString());
    assert.equal(res.body.user.avatar, 'https://lh3.googleusercontent.com/new_avatar.jpg');

    const updatedUser = await User.findById(existingUser._id);
    assert.ok(updatedUser.lastLogin.getTime() > existingUser.lastLogin.getTime());
  });

  test('8. Linked user: finds by email, links local account by saving googleId', async () => {
    const localUser = await User.create({
      name: 'Aanya Verma',
      email: 'aanya.verma@gmail.com',
      password: 'StrongPassword123!',
      provider: 'local',
      googleId: undefined,
      emailVerified: false,
    });

    OAuth2Client.prototype.verifyIdToken = async () => ({
      getPayload: () => ({
        sub: 'google_sub_aanya',
        email: 'aanya.verma@gmail.com',
        name: 'Aanya Verma',
        picture: 'https://lh3.googleusercontent.com/aanya.jpg',
        email_verified: true,
        aud: process.env.GOOGLE_CLIENT_ID,
        iss: 'https://accounts.google.com',
      }),
    });

    const res = await apiRequest('POST', '/api/auth/google', {
      body: { credential: 'aanya_google_token' },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.user._id.toString(), localUser._id.toString());

    const linkedUser = await User.findById(localUser._id);
    assert.equal(linkedUser.googleId, 'google_sub_aanya', 'googleId must now be linked');
    assert.equal(linkedUser.emailVerified, true, 'emailVerified must be set to true');
  });

  test('9. Block login if account is disabled: returns 403 Forbidden', async () => {
    await User.create({
      name: 'Blocked User',
      email: 'blocked@example.com',
      googleId: 'google_sub_blocked',
      provider: 'google',
      isActive: false,
    });

    OAuth2Client.prototype.verifyIdToken = async () => ({
      getPayload: () => ({
        sub: 'google_sub_blocked',
        email: 'blocked@example.com',
        name: 'Blocked User',
        email_verified: true,
        aud: process.env.GOOGLE_CLIENT_ID,
        iss: 'https://accounts.google.com',
      }),
    });

    const res = await apiRequest('POST', '/api/auth/google', {
      body: { credential: 'blocked_user_token' },
    });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /disabled/i);
  });

  test('10. Logout: clears token and refreshToken cookies, revokes session in DB', async () => {
    const user = await User.create({
      name: 'Logout Test User',
      email: 'logout@example.com',
      googleId: 'google_sub_logout',
      refreshToken: 'active_refresh_token_xyz',
    });

    const res = await apiRequest('POST', '/api/auth/logout', {
      cookie: 'token=valid_access_token; refreshToken=active_refresh_token_xyz',
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const hasClearedToken = res.cookies.some((c) => c.includes('token=;') || c.includes('token=; Max-Age=0') || c.includes('token=; Expires=Thu, 01 Jan 1970'));
    assert.ok(hasClearedToken, 'Cookies should be cleared on logout');

    const dbUser = await User.findById(user._id);
    assert.equal(dbUser.refreshToken, null, 'Refresh token must be revoked in DB');
  });
});
