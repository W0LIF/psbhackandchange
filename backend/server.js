// backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Отладка всех запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Импортируем данные и middleware
let users, nextId;
try {
  const usersData = require('./data/users');
  users = usersData.users;
  nextId = usersData.nextId;
  console.log('✅ Данные пользователей загружены');
} catch (error) {
  console.log('❌ Ошибка загрузки данных пользователей:', error.message);
  // Создаем временные данные
  users = [];
  nextId = 1;
}

// Функция для генерации токена (временно здесь)
const generateToken = (userId) => {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = 'education-platform-secret-key';
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Простой тестовый маршрут
app.get('/', (req, res) => {
  res.json({
    status: 'success', 
    message: 'Добро пожаловать в PSB Education API!',
    endpoints: {
      test: 'GET /api/test',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login', 
        me: 'GET /api/auth/me'
      }
    }
  });
});

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'API работает!',
    timestamp: new Date().toISOString()
  });
});

// РЕГИСТРАЦИЯ
app.post('/api/auth/register', async (req, res) => {
  console.log('🔐 Register endpoint called');
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

    console.log('✅ Новый пользователь создан:', { id: newUser.id, email: newUser.email });

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
    console.error('❌ Ошибка регистрации:', error);
    res.status(500).json({
      status: 'error',
      message: 'Внутренняя ошибка сервера: ' + error.message
    });
  }
});

// ЛОГИН
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login endpoint called');
  try {
    const { email, password } = req.body;

    // Проверяем обязательные поля
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email и пароль обязательны'
      });
    }

    console.log('🔍 Ищем пользователя:', email);
    console.log('📊 Все пользователи:', users.map(u => ({ id: u.id, email: u.email })));

    // Ищем пользователя
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('❌ Пользователь не найден');
      return res.status(401).json({
        status: 'error',
        message: 'Неверный email или пароль'
      });
    }

    console.log('✅ Пользователь найден:', user.email);

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔑 Проверка пароля:', isPasswordValid);
    
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
    console.error('❌ Ошибка входа:', error);
    res.status(500).json({
      status: 'error',
      message: 'Внутренняя ошибка сервера: ' + error.message
    });
  }
});

// Пробуем загрузить маршруты из файлов
console.log('\n=== ПОПЫТКА ЗАГРУЗКИ МАРШРУТОВ ИЗ ФАЙЛОВ ===');

// Пробуем auth routes
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes из файла подключены');
} catch (error) {
  console.log('❌ Ошибка загрузки auth routes из файла:', error.message);
}

// Пробуем user routes  
try {
  const userRoutes = require('./routes/users');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes из файла подключены');
} catch (error) {
  console.log('❌ Ошибка загрузки user routes из файла:', error.message);
}

// Обработка 404
app.use((req, res) => {
  console.log(`❌ 404 - Маршрут не найден: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: 'Маршрут не найден',
    attempted: `${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /api/test', 
      'POST /api/auth/register',
      'POST /api/auth/login'
    ]
  });
});

// Глобальный обработчик ошибок
app.use((error, req, res, next) => {
  console.error('💥 Необработанная ошибка:', error);
  res.status(500).json({
    status: 'error',
    message: 'Внутренняя ошибка сервера: ' + error.message
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📚 API доступно по http://localhost:${PORT}`);
  console.log('\n🔧 ДОСТУПНЫЕ ENDPOINTS:');
  console.log('   GET  /              - Информация о API');
  console.log('   GET  /api/test      - Тест сервера');
  console.log('   POST /api/auth/register - Регистрация');
  console.log('   POST /api/auth/login    - Вход');
  console.log('\n👤 Тестовые пользователи:');
  console.log('   teacher@test.ru / password123');
  console.log('   student@test.ru / password123');
  console.log('\n🔍 Для отладки смотрите логи в консоли');
});