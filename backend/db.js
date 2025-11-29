const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

// Создание таблиц
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password_hash TEXT,
      refresh_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS homeworks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      last_name TEXT,
      first_name TEXT,
      task_description TEXT,
      file_path TEXT,
      original_name TEXT,
      course_id INTEGER,
      topic_id INTEGER,
      version INTEGER DEFAULT 1,
      parent_homework_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(parent_homework_id) REFERENCES homeworks(id) ON DELETE CASCADE
    )`
  );

  // Отдельная таблица для комментариев и оценок по домашкам
  db.run(
    `CREATE TABLE IF NOT EXISTS homework_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      homework_id INTEGER NOT NULL,
      grade INTEGER,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(homework_id) REFERENCES homeworks(id) ON DELETE CASCADE
    )`
  );
});

function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function createUser(email, passwordHash) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash],
      function (err) {
        if (err) return reject(err);
        // ИСПРАВЛЕННАЯ СТРОКА: убрано SELECT FROM, должно быть SELECT *
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (e, row) => {
          if (e) return reject(e);
          resolve(row);
        });
      }
    );
  });
}

function saveRefreshToken(userId, token) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [token, userId],
      function (err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

function getUserByRefreshToken(token) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE refresh_token = ?', [token], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function removeRefreshToken(token) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET refresh_token = NULL WHERE refresh_token = ?',
      [token],
      function (err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

// Домашние задания
function createHomework({ userEmail, lastName, firstName, taskDescription, filePath, originalName, courseId = null, topicId = null, parentHomeworkId = null }) {
  return new Promise((resolve, reject) => {
    // Если есть родительское задание, находим максимальную версию и увеличиваем
    if (parentHomeworkId) {
      db.get('SELECT MAX(version) as maxVersion FROM homeworks WHERE parent_homework_id = ? OR id = ?', 
        [parentHomeworkId, parentHomeworkId], 
        (err, row) => {
          if (err) return reject(err);
          const nextVersion = (row && row.maxVersion ? row.maxVersion : 0) + 1;
          const actualParentId = parentHomeworkId;
          
          db.run(
            'INSERT INTO homeworks (user_email, last_name, first_name, task_description, file_path, original_name, course_id, topic_id, version, parent_homework_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userEmail, lastName, firstName, taskDescription, filePath, originalName, courseId, topicId, nextVersion, actualParentId],
            function (err) {
              if (err) return reject(err);
              db.get('SELECT * FROM homeworks WHERE id = ?', [this.lastID], (e, row) => {
                if (e) return reject(e);
                resolve(row);
              });
            }
          );
        }
      );
    } else {
      // Новое задание без родителя
      db.run(
        'INSERT INTO homeworks (user_email, last_name, first_name, task_description, file_path, original_name, course_id, topic_id, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
        [userEmail, lastName, firstName, taskDescription, filePath, originalName, courseId, topicId],
        function (err) {
          if (err) return reject(err);
          db.get('SELECT * FROM homeworks WHERE id = ?', [this.lastID], (e, row) => {
            if (e) return reject(e);
            resolve(row);
          });
        }
      );
    }
  });
}

function getHomeworksByEmail(userEmail) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM homeworks WHERE user_email = ? ORDER BY created_at DESC', [userEmail], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// Домашки + последняя оценка/комментарий
function getHomeworksWithFeedbackByEmail(userEmail) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        h.id,
        h.user_email,
        h.last_name,
        h.first_name,
        h.task_description,
        h.file_path,
        h.original_name,
        h.course_id,
        h.topic_id,
        h.version,
        h.parent_homework_id,
        h.created_at,
        (
          SELECT grade FROM homework_feedback hf 
          WHERE hf.homework_id = h.id 
          ORDER BY hf.created_at DESC 
          LIMIT 1
        ) AS grade,
        (
          SELECT comment FROM homework_feedback hf 
          WHERE hf.homework_id = h.id 
          ORDER BY hf.created_at DESC 
          LIMIT 1
        ) AS comment,
        (
          SELECT created_at FROM homework_feedback hf 
          WHERE hf.homework_id = h.id 
          ORDER BY hf.created_at DESC 
          LIMIT 1
        ) AS feedback_created_at
      FROM homeworks h
      WHERE h.user_email = ?
      ORDER BY h.created_at DESC
    `;

    db.all(sql, [userEmail], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// Получить все версии задания по родительскому ID или самому ID
function getHomeworkVersions(homeworkId) {
  return new Promise((resolve, reject) => {
    // Сначала находим родительское задание или само задание
    db.get('SELECT COALESCE(parent_homework_id, id) as parent_id FROM homeworks WHERE id = ?', [homeworkId], (err, row) => {
      if (err) return reject(err);
      if (!row) {
        return resolve([]);
      }
      
      const parentId = row.parent_id;
      
      // Получаем все версии
      const sql = `
        SELECT 
          h.id,
          h.user_email,
          h.last_name,
          h.first_name,
          h.task_description,
          h.file_path,
          h.original_name,
          h.course_id,
          h.topic_id,
          h.version,
          h.parent_homework_id,
          h.created_at,
          (
            SELECT grade FROM homework_feedback hf 
            WHERE hf.homework_id = h.id 
            ORDER BY hf.created_at DESC 
            LIMIT 1
          ) AS grade,
          (
            SELECT comment FROM homework_feedback hf 
            WHERE hf.homework_id = h.id 
            ORDER BY hf.created_at DESC 
            LIMIT 1
          ) AS comment
        FROM homeworks h
        WHERE h.id = ? OR h.parent_homework_id = ?
        ORDER BY h.version ASC
      `;
      
      db.all(sql, [parentId, parentId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  });
}

function createHomeworkFeedback(homeworkId, grade, comment) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO homework_feedback (homework_id, grade, comment) VALUES (?, ?, ?)',
      [homeworkId, grade, comment],
      function (err) {
        if (err) return reject(err);
        db.get('SELECT * FROM homework_feedback WHERE id = ?', [this.lastID], (e, row) => {
          if (e) return reject(e);
          resolve(row);
        });
      }
    );
  });
}

module.exports = {
  getUserByEmail,
  createUser,
  saveRefreshToken,
  getUserByRefreshToken,
  removeRefreshToken,
  createHomework,
  getHomeworksByEmail,
  getHomeworksWithFeedbackByEmail,
  createHomeworkFeedback,
  getHomeworkVersions
};
