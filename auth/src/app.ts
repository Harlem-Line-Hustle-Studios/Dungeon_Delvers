import 'reflect-metadata'; // We need this in order to use @Decorators

import config from './config';

import express from 'express';

import Logger from './loaders/logger';

async function startServer() {
  const app = express();
  const { default: loaders } = await import('./loaders');
  console.log(loaders);
  loaders(app);
  app.listen(config.port, () => {
    Logger.info(`
      ################################################
      🛡️  Auth Server listening on port: ${config.port} 🛡️
      ################################################
    `);
  });
}

startServer();
