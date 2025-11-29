const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

// Создание таблицы
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

module.exports = {
  getUserByEmail,
  createUser,
  saveRefreshToken,
  getUserByRefreshToken,
  removeRefreshToken
};