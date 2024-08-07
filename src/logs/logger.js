const { format, transports, createLogger } = require('winston');
const path = require('path');
const { env } = process;

// Define common formats
const commonFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

// Define error logger
const errorLogger = createLogger({
  level: 'error',
  format: commonFormat,
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.simple()
      )
    }),
    new transports.File({
      filename: path.join(__dirname, 'logs/error.log'),
      level: 'error'
    })
  ]
});

// Define info logger
const infoLogger = createLogger({
  level: 'info',
  format: commonFormat,
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.simple()
      )
    }),
    new transports.File({
      filename: path.join(__dirname, 'logs/info.log'),
      level: 'info'
    })
  ]
});

module.exports = {
  errorLogger,
  infoLogger
};
