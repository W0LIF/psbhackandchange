// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { users } = require('../data/users');

const JWT_SECRET = 'education-platform-secret-key';

// Создание токена
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Проверка токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Токен доступа отсутствует'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: 'error', 
        message: 'Неверный токен'
      });
    }

    // Находим пользователя по ID из токена
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(403).json({
        status: 'error',
        message: 'Пользователь не найден'
      });
    }

    req.user = user;
    next();
  });
};

module.exports = {
  generateToken,
  authenticateToken
};