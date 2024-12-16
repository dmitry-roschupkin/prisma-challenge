import * as log4js from 'log4js';
import config from './config';

log4js.configure({
  appenders: {
    stdout: { type: 'stdout' },
    stderr: { type: 'stderr' },
    message: {
      type: 'logLevelFilter',
      appender: 'stdout',
      level: 'all',
      maxLevel: 'warn',
    },
    error: {
      type: 'logLevelFilter',
      appender: 'stderr',
      level: 'error',
    },
  },
  categories: {
    default: {
      appenders: ['message', 'error'],
      level: config.debug ? 'debug' : 'info',
    },
  },
});

export const logger = log4js.getLogger();
