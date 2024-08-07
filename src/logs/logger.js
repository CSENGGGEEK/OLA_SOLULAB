const { format, transports, createLogger } = require('winston');
const { timestamp, combine, json, printf, errors } = format;
const path = require('path');
const { env } = process;

// Define custom format for production
const productionFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// Define custom format for development
const developmentFormat = combine(
  timestamp(),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
  })
);

// Common log file path
const logFilePath = path.join(__dirname, 'logs');

// Error Logger
const errorLogger = createLogger({
  level: 'error',
  format: env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  transports: [
    new transports.Console({
      format: env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
    }),
    new transports.File({
      filename: path.join(logFilePath, 'error.log'),
      level: 'error',
    })
  ]
});

// Info Logger
const infoLogger = createLogger({
  level: 'info',
  format: env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  transports: [
    new transports.Console({
      format: env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
    }),
    new transports.File({
      filename: path.join(logFilePath, 'info.log'),
      level: 'info',
    })
  ]
});

// Add log rotation (using winston-daily-rotate-file)
const { DailyRotateFile } = require('winston-daily-rotate-file');

const rotateTransport = new DailyRotateFile({
  filename: path.join(logFilePath, '%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d', // Keep logs for 14 days
  level: 'info',
  format: productionFormat
});

infoLogger.add(rotateTransport);

module.exports = {
  errorLogger,
  infoLogger
};
