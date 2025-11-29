// backend/data/users.js
// Временное хранилище пользователей в памяти
let users = [
  {
    id: 1,
    email: "teacher@test.ru",
    password: "$2b$12$h3hOYzWA9aQnc0T95SjkaOnRm58gtOpnL2WdI4.eQreAkjRjczPEi", // password123
    firstName: "Иван",
    lastName: "Преподавателев",
    role: "teacher",
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2, 
    email: "student@test.ru",
    password: "$2b$12$h3hOYzWA9aQnc0T95SjkaOnRm58gtOpnL2WdI4.eQreAkjRjczPEi", // password123
    firstName: "Петр",
    lastName: "Студентов",
    role: "student",
    createdAt: "2024-01-01T00:00:00.000Z"
  }
];

let nextId = 3;

module.exports = { users, nextId };