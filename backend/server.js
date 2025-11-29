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
let usersData;
try {
  usersData = require('./data/users');
  console.log('✅ Данные пользователей загружены');
} catch (error) {
  console.log('❌ Ошибка загрузки данных пользователей:', error.message);
  // Создаем временную структуру
  usersData = { users: [], nextId: 1 };
}

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

// NOTE: We removed local register/login handlers in favor of the routes defined in controllers

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