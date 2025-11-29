const express = require('express');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const db = require('./db');

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

// Настройки загрузки файлов для домашних заданий
const uploadsDir = path.join(__dirname, 'data', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Middlewares в правильном порядке
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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

// Простейшие курсы и темы в памяти (для прототипа трека «студент»)
const courses = [
  {
    id: 1,
    title: 'Основы веб-разработки',
    description: 'Базовый курс по HTML, CSS и JS',
    totalTopics: 4
  },
  {
    id: 2,
    title: 'React для начинающих',
    description: 'Создание SPA на React',
    totalTopics: 3
  },
  {
    id: 3,
    title: 'Проектный практикум',
    description: 'Практический трек по созданию учебной платформы',
    totalTopics: 2
  }
];

const topics = [
  { 
    id: 1, 
    courseId: 1, 
    title: 'Введение в веб', 
    description: 'Как работает веб и браузер', 
    content: 'Веб-технологии представляют собой набор стандартов и протоколов, которые позволяют обмениваться информацией через интернет. Браузер - это приложение, которое интерпретирует HTML, CSS и JavaScript для отображения веб-страниц пользователю.',
    materials: [
      { type: 'text', content: 'Основные понятия: HTTP, HTML, CSS, JavaScript. Браузер отправляет запросы на сервер и получает ответы в виде HTML-документов.' }
    ]
  },
  { 
    id: 2, 
    courseId: 1, 
    title: 'HTML и структура страницы', 
    description: 'Основные теги HTML', 
    content: 'HTML (HyperText Markup Language) - язык разметки для создания структуры веб-страниц. Основные теги: <html>, <head>, <body>, <div>, <p>, <h1>-<h6>, <a>, <img> и другие.',
    materials: [
      { type: 'text', content: 'Структура HTML-документа включает DOCTYPE, html, head (метаданные) и body (видимый контент).' }
    ]
  },
  { 
    id: 3, 
    courseId: 1, 
    title: 'CSS и стили', 
    description: 'Как оформить страницу', 
    content: 'CSS (Cascading Style Sheets) используется для оформления HTML-элементов. Можно задавать цвета, шрифты, отступы, позиционирование и анимации.',
    materials: [
      { type: 'text', content: 'CSS селекторы позволяют выбрать элементы для стилизации. Стили можно задавать через inline-стили, тег <style> или внешние файлы .css' }
    ]
  },
  { 
    id: 4, 
    courseId: 1, 
    title: 'JavaScript в браузере', 
    description: 'Базовый JS', 
    content: 'JavaScript - язык программирования, который делает веб-страницы интерактивными. Можно обрабатывать события, изменять DOM, отправлять запросы на сервер.',
    materials: [
      { type: 'text', content: 'Основы JS: переменные (let, const), функции, объекты, массивы. DOM API для работы с элементами страницы.' }
    ]
  },

  { 
    id: 5, 
    courseId: 2, 
    title: 'Создание React-проекта', 
    description: 'Vite + React', 
    content: 'React - библиотека для создания пользовательских интерфейсов. Vite - современный инструмент сборки, который обеспечивает быструю разработку.',
    materials: [
      { type: 'text', content: 'Создание проекта: npm create vite@latest my-app -- --template react. Запуск: npm run dev' }
    ]
  },
  { 
    id: 6, 
    courseId: 2, 
    title: 'Компоненты и пропсы', 
    description: 'React компоненты', 
    content: 'Компоненты - это переиспользуемые части UI. Пропсы (props) - это данные, которые передаются от родительского компонента к дочернему.',
    materials: [
      { type: 'text', content: 'Функциональные компоненты используют хуки (useState, useEffect). Пропсы неизменяемы и передаются сверху вниз.' }
    ]
  },
  { 
    id: 7, 
    courseId: 2, 
    title: 'Маршрутизация', 
    description: 'react-router', 
    content: 'React Router позволяет создавать одностраничные приложения (SPA) с навигацией между страницами без перезагрузки.',
    materials: [
      { type: 'text', content: 'Основные компоненты: BrowserRouter, Routes, Route, Link, useNavigate. Динамические маршруты с параметрами.' }
    ]
  },

  { 
    id: 8, 
    courseId: 3, 
    title: 'Постановка задачи', 
    description: 'Трек студента ПСБ', 
    content: 'В рамках хакатона ПСБ Hack&Change 2025 необходимо разработать прототип образовательной платформы для студентов.',
    materials: [
      { type: 'text', content: 'Требования: изучение материалов, загрузка домашних заданий, получение обратной связи от преподавателей. Дополнительно: версионирование заданий, журнал успеваемости, прогресс обучения.' }
    ]
  },
  { 
    id: 9, 
    courseId: 3, 
    title: 'Реализация прототипа', 
    description: 'Сборка фронта и бэка', 
    content: 'Прототип включает фронтенд на React и бэкенд на Node.js с Express. База данных SQLite для хранения данных.',
    materials: [
      { type: 'text', content: 'Архитектура: REST API на бэкенде, React Router на фронтенде. Загрузка файлов через Multer, аутентификация через JWT.' }
    ]
  }
];

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

// Register a student
app.post('/api/students/register', async (req, res) => {
  try {
    logger.info('POST /api/students/register called');
    
    const { name, email, group } = req.body || {};
    
    // Валидация
    if (!name || !isValidName(name)) {
      return res.status(400).json({ 
        error: 'Invalid name', 
        message: 'Name must be at least 2 characters long' 
      });
    }
    
    if (!email || !isValidEmail(email)) {
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
      student.email && student.email.toLowerCase() === email.trim().toLowerCase()
    );
    
    if (emailExists) {
      logger.warn(`Registration failed - duplicate email: ${email}`);
      return res.status(409).json({ 
        error: 'Email already exists', 
        message: 'A student with this email is already registered' 
      });
    }

    // Создание студента
    const student = {
      id: uuidv4(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      group: group ? String(group).trim() : null,
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
    logger.error(`Registration error: ${err.message}`, { stack: err.stack });
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
    logger.error(`List students error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve students list'
    });
  }
});

// ===== API КУРСОВ И ТЕМ =====

// Список курсов, опционально с прогрессом студента по email
app.get('/api/courses', async (req, res) => {
  try {
    const email = (req.query.email || '').toString().trim().toLowerCase();
    let homeworks = [];

    if (email && isValidEmail(email)) {
      try {
        homeworks = await db.getHomeworksWithFeedbackByEmail(email);
      } catch (e) {
        // если не получилось прочитать домашки, просто считаем, что их нет
        homeworks = [];
      }
    }

    const result = courses.map(course => {
      const totalTopics = course.totalTopics || 0;
      if (!email || !totalTopics) {
        return { ...course, progress: 0 };
      }

      const completedForCourse = homeworks.filter(hw => 
        hw && hw.course_id === course.id && hw.grade != null
      ).length;

      const ratio = Math.max(0, Math.min(1, completedForCourse / totalTopics));
      const progress = Math.round(ratio * 100);
      return { ...course, progress };
    });

    res.json({ count: result.length, courses: result });
  } catch (err) {
    logger.error(`Courses list error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal server error', message: 'Failed to retrieve courses' });
  }
});

// Информация по одному курсу + его темам
app.get('/api/courses/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid course id' });
  }

  const course = courses.find(c => c.id === id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const courseTopics = topics.filter(t => t.courseId === id);
  res.json({ course, topics: courseTopics });
});

// Темы по курсу
app.get('/api/courses/:id/topics', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid course id' });
  }

  const courseTopics = topics.filter(t => t.courseId === id);
  res.json({ count: courseTopics.length, topics: courseTopics });
});

// Одна тема по id
app.get('/api/topics/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid topic id' });
  }

  const topic = topics.find(t => t.id === id);
  if (!topic) {
    return res.status(404).json({ error: 'Topic not found' });
  }

  res.json(topic);
});

// Приём домашних заданий (с файлом) - поддерживает версионирование
app.post('/api/homeworks', upload.single('file'), async (req, res) => {
  try {
    logger.info('POST /api/homeworks called');

    const { lastName, firstName, email, taskDescription, courseId, topicId, parentHomeworkId } = req.body || {};
    if (!lastName || !firstName || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const numericCourseId = courseId !== undefined && courseId !== null && courseId !== ''
      ? Number(courseId)
      : null;
    const numericTopicId = topicId !== undefined && topicId !== null && topicId !== ''
      ? Number(topicId)
      : null;
    const numericParentId = parentHomeworkId !== undefined && parentHomeworkId !== null && parentHomeworkId !== ''
      ? Number(parentHomeworkId)
      : null;

    const hw = await db.createHomework({
      userEmail: String(email).trim().toLowerCase(),
      lastName: String(lastName).trim(),
      firstName: String(firstName).trim(),
      taskDescription: taskDescription ? String(taskDescription).trim() : null,
      filePath: req.file.path,
      originalName: req.file.originalname,
      courseId: Number.isFinite(numericCourseId) ? numericCourseId : null,
      topicId: Number.isFinite(numericTopicId) ? numericTopicId : null,
      parentHomeworkId: Number.isFinite(numericParentId) ? numericParentId : null
    });

    logger.info(`Homework saved id=${hw.id} email=${hw.user_email} version=${hw.version || 1}`);

    res.status(201).json({
      message: 'Homework submitted successfully',
      homework: {
        id: hw.id,
        email: hw.user_email,
        lastName: hw.last_name,
        firstName: hw.first_name,
        taskDescription: hw.task_description,
        filePath: hw.file_path,
        originalName: hw.original_name,
        version: hw.version || 1,
        parentHomeworkId: hw.parent_homework_id,
        createdAt: hw.created_at
      }
    });
  } catch (err) {
    logger.error(`Homework submit error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal server error', message: 'Failed to submit homework' });
  }
});

// Получение домашних заданий студента с комментариями и оценками
app.get('/api/homeworks', async (req, res) => {
  try {
    const email = (req.query.email || '').toString().trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const homeworks = await db.getHomeworksWithFeedbackByEmail(email);

    // Обогащаем домашки названиями курса и темы для удобного отображения на фронте
    const enriched = homeworks.map(hw => {
      const course = typeof hw.course_id === 'number'
        ? courses.find(c => c.id === hw.course_id)
        : null;
      const topic = typeof hw.topic_id === 'number'
        ? topics.find(t => t.id === hw.topic_id)
        : null;

      return {
        ...hw,
        courseTitle: course ? course.title : null,
        topicTitle: topic ? topic.title : null
      };
    });

    res.json({
      count: enriched.length,
      homeworks: enriched
    });
  } catch (err) {
    logger.error(`List homeworks error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal server error', message: 'Failed to retrieve homeworks' });
  }
});

// Добавление/обновление комментария и оценки преподавателя по домашке
app.patch('/api/homeworks/:id/feedback', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid homework id' });
    }

    const { grade, comment } = req.body || {};
    const numericGrade = grade === undefined || grade === null ? null : Number(grade);

    const feedback = await db.createHomeworkFeedback(id, numericGrade, comment || null);

    res.status(201).json({
      message: 'Feedback saved',
      feedback
    });
  } catch (err) {
    logger.error(`Homework feedback error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal server error', message: 'Failed to save feedback' });
  }
});

// Получение всех версий домашнего задания
app.get('/api/homeworks/:id/versions', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid homework id' });
    }

    const versions = await db.getHomeworkVersions(id);

    // Обогащаем версии названиями курса и темы
    const enriched = versions.map(hw => {
      const course = typeof hw.course_id === 'number'
        ? courses.find(c => c.id === hw.course_id)
        : null;
      const topic = typeof hw.topic_id === 'number'
        ? topics.find(t => t.id === hw.topic_id)
        : null;

      return {
        ...hw,
        courseTitle: course ? course.title : null,
        topicTitle: topic ? topic.title : null
      };
    });

    res.json({
      count: enriched.length,
      versions: enriched
    });
  } catch (err) {
    logger.error(`Get homework versions error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal server error', message: 'Failed to retrieve versions' });
  }
});

// Расписание дедлайнов для студента
app.get('/api/schedule', async (req, res) => {
  try {
    const email = (req.query.email || '').toString().trim().toLowerCase();
    
    // Получаем все домашние задания студента
    let homeworks = [];
    if (email && isValidEmail(email)) {
      try {
        homeworks = await db.getHomeworksWithFeedbackByEmail(email);
      } catch (e) {
        homeworks = [];
      }
    }

    // Создаем расписание на основе тем курсов
    // Для каждой темы устанавливаем дедлайн (например, через 7 дней после начала курса)
    const schedule = [];
    const now = new Date();
    
    topics.forEach((topic, index) => {
      const course = courses.find(c => c.id === topic.courseId);
      if (!course) return;

      // Вычисляем дедлайн: базовая дата + индекс темы * 7 дней
      const deadlineDate = new Date(now);
      deadlineDate.setDate(deadlineDate.getDate() + (index + 1) * 7);
      
      // Проверяем, есть ли уже отправленное задание
      const homework = homeworks.find(hw => hw.topic_id === topic.id);
      const isCompleted = homework && homework.grade != null;
      const isSubmitted = homework != null;
      
      schedule.push({
        id: topic.id,
        courseId: topic.courseId,
        courseTitle: course.title,
        topicTitle: topic.title,
        topicDescription: topic.description,
        deadline: deadlineDate.toISOString(),
        deadlineFormatted: deadlineDate.toLocaleDateString('ru-RU'),
        isCompleted,
        isSubmitted,
        homeworkId: homework?.id,
        grade: homework?.grade,
        daysRemaining: Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))
      });
    });

    // Сортируем по дате дедлайна
    schedule.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    res.json({
      count: schedule.length,
      schedule
    });
  } catch (err) {
    logger.error(`Schedule error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal server error', message: 'Failed to retrieve schedule' });
  }
});

// Все учебные материалы
app.get('/api/materials', async (req, res) => {
  try {
    const courseIdParam = req.query.courseId;
    const courseId = courseIdParam ? Number(courseIdParam) : null;
    
    let filteredTopics = topics;
    if (courseId && Number.isFinite(courseId)) {
      filteredTopics = topics.filter(t => t.courseId === courseId);
    }

    // Формируем список материалов
    const materials = filteredTopics.map(topic => {
      const course = courses.find(c => c.id === topic.courseId);
      return {
        id: topic.id,
        courseId: topic.courseId,
        courseTitle: course ? course.title : `Курс ${topic.courseId}`,
        topicTitle: topic.title,
        topicDescription: topic.description,
        content: topic.content,
        materials: topic.materials || []
      };
    });

    res.json({
      count: materials.length,
      materials,
      courses: courses.map(c => ({ id: c.id, title: c.title }))
    });
  } catch (err) {
    logger.error(`Materials error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal server error', message: 'Failed to retrieve materials' });
  }
});

// Журнал успеваемости студента
app.get('/api/students/:email/grades', async (req, res) => {
  try {
    const email = (req.params.email || '').toString().trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const homeworks = await db.getHomeworksWithFeedbackByEmail(email);

    // Группируем по курсам и темам
    const gradesByCourse = {};
    let totalGrade = 0;
    let gradedCount = 0;

    homeworks.forEach(hw => {
      if (hw.grade != null) {
        totalGrade += hw.grade;
        gradedCount++;
      }

      const courseId = hw.course_id;
      if (!courseId) return;

      if (!gradesByCourse[courseId]) {
        const course = courses.find(c => c.id === courseId);
        gradesByCourse[courseId] = {
          courseId,
          courseTitle: course ? course.title : `Курс ${courseId}`,
          topics: {},
          averageGrade: 0,
          totalGraded: 0
        };
      }

      const topicId = hw.topic_id;
      if (topicId) {
        if (!gradesByCourse[courseId].topics[topicId]) {
          const topic = topics.find(t => t.id === topicId);
          gradesByCourse[courseId].topics[topicId] = {
            topicId,
            topicTitle: topic ? topic.title : `Тема ${topicId}`,
            grades: [],
            averageGrade: 0
          };
        }

        if (hw.grade != null) {
          gradesByCourse[courseId].topics[topicId].grades.push({
            homeworkId: hw.id,
            version: hw.version || 1,
            grade: hw.grade,
            comment: hw.comment,
            createdAt: hw.created_at,
            feedbackCreatedAt: hw.feedback_created_at
          });
        }
      }
    });

    // Вычисляем средние оценки
    Object.keys(gradesByCourse).forEach(courseId => {
      const course = gradesByCourse[courseId];
      let courseTotal = 0;
      let courseCount = 0;

      Object.keys(course.topics).forEach(topicId => {
        const topic = course.topics[topicId];
        if (topic.grades.length > 0) {
          const topicTotal = topic.grades.reduce((sum, g) => sum + g.grade, 0);
          topic.averageGrade = Math.round((topicTotal / topic.grades.length) * 10) / 10;
          courseTotal += topic.averageGrade;
          courseCount++;
        }
      });

      if (courseCount > 0) {
        course.averageGrade = Math.round((courseTotal / courseCount) * 10) / 10;
      }
      course.totalGraded = Object.values(course.topics).reduce((sum, t) => sum + t.grades.length, 0);
    });

    const overallAverage = gradedCount > 0 ? Math.round((totalGrade / gradedCount) * 10) / 10 : 0;

    res.json({
      email,
      overallAverage,
      totalGraded,
      totalSubmitted: homeworks.length,
      courses: Object.values(gradesByCourse)
    });
  } catch (err) {
    logger.error(`Get grades error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Internal server error', message: 'Failed to retrieve grades' });
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