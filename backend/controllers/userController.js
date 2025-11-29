// backend/controllers/userController.js
const { users } = require('../data/users');

// Получение профиля пользователя
const getUserProfile = (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'Пользователь не найден'
    });
  }

  // Не возвращаем пароль
  const { password, ...userWithoutPassword } = user;

  res.json({
    status: 'success',
    user: userWithoutPassword
  });
};

// Обновление профиля
const updateUserProfile = (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Проверяем, что пользователь обновляет свой профиль
  if (req.user.id !== userId) {
    return res.status(403).json({
      status: 'error',
      message: 'Нельзя обновлять чужой профиль'
    });
  }

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      status: 'error',
      message: 'Пользователь не найден'
    });
  }

  // Обновляем поля
  const { firstName, lastName } = req.body;
  if (firstName) users[userIndex].firstName = firstName;
  if (lastName) users[userIndex].lastName = lastName;

  const { password, ...updatedUser } = users[userIndex];

  res.json({
    status: 'success',
    message: 'Профиль обновлен',
    user: updatedUser
  });
};

module.exports = {
  getUserProfile,
  updateUserProfile
};