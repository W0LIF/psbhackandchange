// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const { users, nextId } = require('../data/users');
const { generateToken } = require('../middleware/auth');

console.log('✅ AuthController загружен');

// Регистрация нового пользователя
const register = async (req, res) => {
  console.log('📝 Register called from controller', req.body);
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Проверяем обязательные поля
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        status: 'error',
        message: 'Все поля обязательны для заполнения'
      });
    }

    // Проверяем валидность роли
    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Роль должна быть student или teacher'
      });
    }

    // Проверяем, нет ли пользователя с таким email
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Пользователь с таким email уже существует'
      });
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем нового пользователя
    const newUser = {
      id: nextId,
      email,
      password: hashedPassword,
      firstName,
      lastName, 
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    nextId++;

    // Создаем токен
    const token = generateToken(newUser.id);

    // Возвращаем ответ без пароля
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      status: 'success',
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({
      status: 'error',
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Вход пользователя
const login = async (req, res) => {
  console.log('🔐 Login called from controller', req.body);
  try {
    const { email, password } = req.body;

    // Проверяем обязательные поля
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email и пароль обязательны'
      });
    }

    // Ищем пользователя
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Неверный email или пароль'
      });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error', 
        message: 'Неверный email или пароль'
      });
    }

    // Создаем токен
    const token = generateToken(user.id);

    // Возвращаем ответ без пароля
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: 'success',
      message: 'Вход выполнен успешно',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({
      status: 'error',
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Получение текущего пользователя
const getMe = (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  
  res.json({
    status: 'success',
    user: userWithoutPassword
  });
};

module.exports = {
  register,
  login,
  getMe
};