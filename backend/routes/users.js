// backend/routes/userRoutes.js
const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Все маршруты защищены аутентификацией
router.use(authenticateToken);

router.get('/:id', getUserProfile);
router.patch('/:id', updateUserProfile);

module.exports = router;