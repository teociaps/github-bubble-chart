import { pino } from 'pino';
import { isDevEnvironment } from './common/environment.js';

const isDev = isDevEnvironment();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

export default logger;
