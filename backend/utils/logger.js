// utils/logger.js
import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [new transports.Console()],
});

// Morgan compatibility
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export default logger;
