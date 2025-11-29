const express = require('express');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { logger, stream } = require('./logger');
const dataStore = require('./dataStore');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(morgan('combined', { stream }));

// Basic health route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Validation helpers
function isValidName(name) {
  return typeof name === 'string' && name.trim().length >= 2;
}

function isValidEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
  return typeof email === 'string' && re.test(email);
}

// Register a student
app.post('/api/students/register', async (req, res) => {
  try {
    const { name, email, group } = req.body || {};
    if (!name || !isValidName(name)) {
      return res.status(400).json({ error: 'Invalid name. Provide a name with at least 2 characters.' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    await dataStore.ensureDataFile();
    const students = await dataStore.getStudents();
    const exists = students.some(s => s.email && s.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      logger.info(`Registration failed (duplicate email) for: ${email}`);
      return res.status(409).json({ error: 'A student with this email already exists.' });
    }

    const student = {
      id: uuidv4(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      group: group ? String(group) : null,
      createdAt: new Date().toISOString()
    };

    await dataStore.addStudent(student);
    logger.info(`Student registered: ${student.id} ${student.email}`);
    res.status(201).json({ student });
  } catch (err) {
    logger.error(`Registration error: ${err.stack || err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List students
app.get('/api/students', async (req, res) => {
  try {
    await dataStore.ensureDataFile();
    const students = await dataStore.getStudents();
    res.json({ students });
  } catch (err) {
    logger.error(`List students error: ${err.stack || err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
