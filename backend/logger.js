const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, printf, colorize } = winston.format;
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), logFormat),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'server.log') }),
    new winston.transports.Console({ format: combine(colorize(), timestamp(), logFormat) })
  ]
});

// morgan stream
const stream = {
  write: (message) => {
    // message already ends with a newline
    logger.info(message.trim());
  }
};

module.exports = { logger, stream };
