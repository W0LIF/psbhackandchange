const express = require('express');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cookieParser = require('cookie-parser');

// Импорт логгера с обработкой ошибок
let logger, stream;
try {
  const loggerModule = require('./logger');
  logger = loggerModule.logger;
  stream = loggerModule.stream;
} catch (error) {
  console.error('Logger import failed, using console fallback:', error.message);
  // Fallback logger
  logger = {
    info: (...args) => console.log('[INFO]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args)
  };
  stream = {
    write: (msg) => console.log('[MORGAN]', msg.trim())
  };
}

// Импорт dataStore с обработкой ошибок
let dataStore;
try {
  dataStore = require('./dataStore');
} catch (error) {
  console.error('DataStore import failed:', error.message);
  // Fallback dataStore
  dataStore = {
    ensureDataFile: async () => {
      console.log('ensureDataFile called (fallback)');
      return Promise.resolve();
    },
    getStudents: async () => {
      console.log('getStudents called (fallback)');
      return Promise.resolve([]);
    },
    addStudent: async (student) => {
      console.log('addStudent called (fallback)', student);
      return Promise.resolve();
    }
  };
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares в правильном порядке - УВЕЛИЧИМ ЛИМИТ ДЛЯ JSON
app.use(morgan('combined', { stream }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Try to load auth router and normalize various export shapes
let authRouter = null;
try {
  const authModule = require('./auth');
  authRouter = authModule && (authModule.router || authModule.default || authModule.auth || authModule);
  if (typeof authRouter === 'function' && !(authRouter.handle && authRouter.stack)) {
    try {
      const maybe = authRouter();
      if (maybe && (typeof maybe === 'function' || (maybe.handle && maybe.stack))) authRouter = maybe;
    } catch (e) {
      // ignore factory invocation errors, keep original
    }
  }
  if (!(typeof authRouter === 'function' || (authRouter && authRouter.handle && authRouter.stack))) {
    authRouter = null;
  }
} catch (e) {
  logger && logger.warn ? logger.warn('Auth module not found or failed to load') : console.warn('Auth module load failed');
}

if (authRouter) {
  app.use('/auth', authRouter);
} else {
  logger && logger.warn ? logger.warn('Auth router not mounted (module missing or invalid)') : console.warn('Auth router not mounted');
}

// ===== МАРШРУТЫ =====

// Корневой маршрут - ОБЯЗАТЕЛЬНО ДОБАВИТЬ
app.get('/', (req, res) => {
  logger.info('GET / requested');
  res.json({ 
    message: 'Student API is running successfully!', 
    version: '1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /health',
      registerStudent: 'POST /api/students/register',
      listStudents: 'GET /api/students'
    }
  });
});

// Также добавляем POST для корня чтобы избежать "Cannot POST /"
app.post('/', (req, res) => {
  logger.info('POST / requested');
  res.status(405).json({ 
    error: 'Method Not Allowed',
    message: 'Use POST /api/students/register to register a student',
    allowedMethods: ['GET']
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Validation helpers
function isValidName(name) {
  return typeof name === 'string' && name.trim().length >= 2;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
}

// Register a student - ПОЛНОСТЬЮ ПЕРЕПИСАННЫЙ ОБРАБОТЧИК
app.post('/api/students/register', async (req, res) => {
  try {
    logger.info('POST /api/students/register called');
    logger.info('Request body:', JSON.stringify(req.body));
    
    // Детальная проверка тела запроса
    if (!req.body) {
      return res.status(400).json({ 
        error: 'Missing request body',
        message: 'Request body is required' 
      });
    }

    if (typeof req.body !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid request body',
        message: 'Request body must be a JSON object' 
      });
    }

    // Извлекаем поля с защитой от undefined
    const name = req.body.name;
    const email = req.body.email;
    const group = req.body.group;

    // Проверяем наличие обязательных полей
    if (name === undefined || name === null) {
      return res.status(400).json({ 
        error: 'Missing name',
        message: 'Name field is required' 
      });
    }

    if (email === undefined || email === null) {
      return res.status(400).json({ 
        error: 'Missing email',
        message: 'Email field is required' 
      });
    }

    // Преобразуем в строки и обрезаем пробелы
    const nameStr = String(name).trim();
    const emailStr = String(email).trim().toLowerCase();
    const groupStr = group ? String(group).trim() : null;

    // Валидация
    if (!isValidName(nameStr)) {
      return res.status(400).json({ 
        error: 'Invalid name', 
        message: 'Name must be at least 2 characters long' 
      });
    }
    
    if (!isValidEmail(emailStr)) {
      return res.status(400).json({ 
        error: 'Invalid email', 
        message: 'Provide a valid email address' 
      });
    }

    // Работа с данными
    await dataStore.ensureDataFile();
    const students = await dataStore.getStudents();
    
    // Проверка дубликата email
    const emailExists = students.some(student => 
      student.email && student.email.toLowerCase() === emailStr
    );
    
    if (emailExists) {
      logger.warn(`Registration failed - duplicate email: ${emailStr}`);
      return res.status(409).json({ 
        error: 'Email already exists', 
        message: 'A student with this email is already registered' 
      });
    }

    // Создание студента
    const student = {
      id: uuidv4(),
      name: nameStr,
      email: emailStr,
      group: groupStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dataStore.addStudent(student);
    
    logger.info(`Student registered successfully: ${student.id} - ${student.email}`);
    
    res.status(201).json({ 
      message: 'Student registered successfully',
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        group: student.group,
        createdAt: student.createdAt
      }
    });
    
  } catch (err) {
    logger.error(`Registration error: ${err && err.message ? err.message : String(err)}`, { stack: err && err.stack });
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to register student'
    });
  }
});

// List all students
app.get('/api/students', async (req, res) => {
  try {
    logger.info('GET /api/students called');
    
    await dataStore.ensureDataFile();
    const students = await dataStore.getStudents();
    
    logger.info(`Returning ${students.length} students`);
    
    res.json({
      count: students.length,
      students: students.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        group: student.group,
        createdAt: student.createdAt
      }))
    });
    
  } catch (err) {
    logger.error(`List students error: ${err && err.message ? err.message : String(err)}`, { stack: err && err.stack });
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve students list'
    });
  }
});

// Route for debugging - показывает все зарегистрированные маршруты
app.get('/debug/routes', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Прямые маршруты app
      const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
      routes.push({
        path: middleware.route.path,
        methods: methods
      });
    } else if (middleware.name === 'router') {
      // Роутеры
      if (middleware.handle && middleware.handle.stack) {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
            routes.push({
              path: handler.route.path,
              methods: methods
            });
          }
        });
      }
    }
  });
  
  res.json({
    message: 'Registered routes',
    count: routes.length,
    routes: routes
  });
});

// 404 handler - ДОЛЖЕН БЫТЬ ПОСЛЕДНИМ
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    suggestedRoutes: [
      'GET /',
      'GET /health',
      'POST /api/students/register',
      'GET /api/students',
      'GET /debug/routes'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'Something went wrong!'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  logger.info(`🚀 Server started successfully on port ${PORT}`);
  logger.info(`📋 Available endpoints:`);
  logger.info(`   GET  http://localhost:${PORT}/`);
  logger.info(`   GET  http://localhost:${PORT}/health`);
  logger.info(`   POST http://localhost:${PORT}/api/students/register`);
  logger.info(`   GET  http://localhost:${PORT}/api/students`);
  logger.info(`   GET  http://localhost:${PORT}/debug/routes`);
  
  console.log(`✅ Server is running! Open http://localhost:${PORT} in your browser`);
});

module.exports = app;