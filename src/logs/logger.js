const { format, transports, createLogger } = require('winston');

// Error Logger
const errorLogger = createLogger({
  level: 'error',
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(), 
    format.json() 
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'src/logs/errorLogs.log', level: 'error' })
  ]
});

// Info Logger
const infoLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(), 
    format.json() 
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'src/logs/infoLogs.log', level: 'info' })
  ]
});

module.exports = {
  errorLogger,
  infoLogger
};
