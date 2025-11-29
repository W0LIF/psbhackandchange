const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { logger } = require('./logger');
// Заменено: подключаем реальную БД вместо временной заглушки
const db = require('./db');

const router = express.Router();

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret-example';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-example';

function createAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

function createRefreshToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn });
}

// Helpers: hash and verify using Node crypto (scrypt)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  const [salt, keyHex] = stored.split(':');
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (keyBuf.length !== derived.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

// helper: centralized error handling
function handleError(res, err, msg = 'internal error') {
  try {
    logger.error(err && err.stack ? err.stack : String(err));
  } catch (e) {
    console.error(err);
  }
  const payload = { error: msg };
  if (process.env.NODE_ENV !== 'production') {
    payload.detail = err && err.message ? err.message : String(err);
  }
  return res.status(500).json(payload);
}

// Register endpoint - использует реальную БД
router.post('/register', async (req, res) => {
  try {
    logger.info('POST /auth/register called');

    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body is required' });
    }

    const email = req.body.email ? String(req.body.email).trim().toLowerCase() : null;
    const password = req.body.password ? String(req.body.password) : null;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 3) {
      return res.status(400).json({ error: 'Password must be at least 3 characters long' });
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      logger.warn(`Register attempt for existing user: ${email}`);
      return res.status(409).json({ error: 'User already exists' });
    }

    const hash = hashPassword(password);
    const user = await db.createUser(email, hash);

    logger.info(`User registered: id=${user.id} email=${user.email}`);
    return res.status(201).json({
      id: user.id,
      email: user.email,
      message: 'User registered successfully'
    });
  } catch (err) {
    return handleError(res, err, 'Registration failed');
  }
});

// Login endpoint - проверяет пароль и выдаёт токены
router.post('/login', async (req, res) => {
  try {
    logger.info('POST /auth/login called');

    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body is required' });
    }

    const email = req.body.email ? String(req.body.email).trim().toLowerCase() : null;
    const password = req.body.password ? String(req.body.password) : null;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      logger.warn(`Login failed - user not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = verifyPassword(password, user.password_hash);
    if (!ok) {
      logger.warn(`Login failed - invalid password: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = createAccessToken({ userId: user.id, email: user.email });
    const refreshToken = createRefreshToken({ userId: user.id }, '30d');

    await db.saveRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    logger.info(`Login successful: id=${user.id} email=${user.email}`);
    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email
      },
      message: 'Login successful'
    });
  } catch (err) {
    return handleError(res, err, 'Login failed');
  }
});

// POST /auth/refresh - проверяем наличие токена в cookie и в БД
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (!token) {
      logger.warn('Refresh attempt without token');
      return res.status(401).json({ error: 'No refresh token' });
    }

    let payload;
    try {
      payload = jwt.verify(token, REFRESH_SECRET);
    } catch (e) {
      await db.removeRefreshToken(token).catch(() => {});
      res.clearCookie('refreshToken');
      logger.info('Refresh failed: invalid token (verification)');
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Убедимся, что токен существует в БД (защита от отозванных/подменённых)
    const stored = await db.getUserByRefreshToken(token);
    if (!stored || String(stored.id) !== String(payload.userId)) {
      await db.removeRefreshToken(token).catch(() => {});
      res.clearCookie('refreshToken');
      logger.warn('Refresh failed: token not found in DB');
      return res.status(401).json({ error: 'Invalid token' });
    }

    const newAccess = createAccessToken({ userId: payload.userId, email: stored.email });
    const newRefresh = createRefreshToken({ userId: payload.userId }, '30d');
    await db.saveRefreshToken(payload.userId, newRefresh);

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    logger.info(`Token refreshed for user id=${payload.userId}`);
    return res.json({ accessToken: newAccess });
  } catch (err) {
    return handleError(res, err);
  }
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (token) {
      await db.removeRefreshToken(token).catch(() => {});
    }
    res.clearCookie('refreshToken');
    logger.info('User logged out (refresh token cleared)');
    return res.json({ ok: true });
  } catch (err) {
    return handleError(res, err);
  }
});

// Quick check endpoint
router.get('/', (req, res) => {
  return res.json({
    ok: true,
    msg: 'auth router alive',
    available: [
      'POST /auth/register',
      'POST /auth/login',
      'POST /auth/refresh',
      'POST /auth/logout',
      'GET  /auth/'
    ]
  });
});

module.exports = router;