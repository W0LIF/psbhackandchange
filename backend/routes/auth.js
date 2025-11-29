// backend/routes/auth.js
const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

console.log('✅ Auth routes файл загружен');

// Публичные маршруты
router.post('/register', register);
router.post('/login', login);

// Защищенные маршруты
router.get('/me', authenticateToken, getMe);

module.exports = router;