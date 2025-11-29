const fs = require('fs/promises');
const path = require('path');
const { logger } = require('./logger');

const dataDir = path.join(__dirname, 'data');
const studentsFile = path.join(dataDir, 'students.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    try {
      await fs.access(studentsFile);
    } catch {
      await fs.writeFile(studentsFile, '[]', 'utf8');
    }
  } catch (err) {
    logger.error(`Failed to ensure data file: ${err.stack || err}`);
    throw err;
  }
}

async function getStudents() {
  await ensureDataFile();
  const raw = await fs.readFile(studentsFile, 'utf8');
  try {
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    logger.error(`Invalid students file format: ${err.stack || err}`);
    return [];
  }
}

async function addStudent(student) {
  const students = await getStudents();
  students.push(student);
  await fs.writeFile(studentsFile, JSON.stringify(students, null, 2), 'utf8');
  return student;
}

async function clearStudents() {
  await ensureDataFile();
  await fs.writeFile(studentsFile, '[]', 'utf8');
}

module.exports = { ensureDataFile, getStudents, addStudent, clearStudents };
