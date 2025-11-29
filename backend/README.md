# Backend server for student registration

This directory contains an Express server that supports student registration and logging.

Features:
- POST /api/students/register — Registers a student (name, email, optional group).
- GET /api/students — Returns list of registered students.
- GET /health — Health check.
- Logging via morgan and winston; logs written to `backend/logs/server.log` and console.

Setup:
1. Install dependencies from the `backend` folder:

```powershell
cd backend
npm install
```

2. Start the server:

```powershell
npm start
```

3. Dev mode (auto-reload):

```powershell
npm run dev
```

Example requests:

Register a student (curl):

```powershell
curl -X POST http://localhost:3000/api/students/register -H "Content-Type: application/json" -d '{"name":"Ivan Petrov","email":"ivan@example.com","group":"B1"}'
```

List students:

```powershell
curl http://localhost:3000/api/students
```

Notes:
- Data is persisted in `backend/data/students.json`. This simple local JSON store is fine for demo or small projects, but for production use an actual database.
- Logging writes to `backend/logs/server.log` and the console using winston.
