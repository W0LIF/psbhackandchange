// backend/data/users.js
// Временное хранилище пользователей в памяти
let users = [
  {
    id: 1,
    email: "teacher@test.ru",
    password: "$2a$12$LQv3c1yqBNWB1DM3Z5kZPuMhV2QYQHTPc8UYV9p9G9pZ7J5Z5J5J5", // password123
    firstName: "Иван",
    lastName: "Преподавателев",
    role: "teacher",
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2, 
    email: "student@test.ru",
    password: "$2a$12$LQv3c1yqBNWB1DM3Z5kZPuMhV2QYQHTPc8UYV9p9G9pZ7J5Z5J5J5", // password123
    firstName: "Петр",
    lastName: "Студентов",
    role: "student",
    createdAt: "2024-01-01T00:00:00.000Z"
  }
];

let nextId = 3;

module.exports = { users, nextId };