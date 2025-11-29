const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/courses', require('./routes/courses'));
// app.use('/api/assignments', require('./routes/assignments'));
// app.use('/api/chat', require('./routes/chat'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});