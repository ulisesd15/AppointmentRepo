const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const authenticateToken = require('../../middleware/authenticateToken');

const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-only-change-me';
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    authProvider: user.authProvider,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function issueToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    getJwtSecret(),
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

router.get('/health', (req, res) => {
  res.json({ module: 'auth', ok: true });
});

router.post('/register', async (req, res, next) => {
  try {
    const fullName = String(req.body.fullName || '').trim();
    const email = normalizeEmail(req.body.email);
    const phone = String(req.body.phone || '').trim() || null;
    const password = String(req.body.password || '');

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email,
      phone,
      password: passwordHash,
      authProvider: 'local',
      role: 'user',
      isVerified: false,
    });

    return res.status(201).json({
      token: issueToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    return res.json({
      token: issueToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (_req, res) => {
  res.json({ ok: true });
});

module.exports = router;
