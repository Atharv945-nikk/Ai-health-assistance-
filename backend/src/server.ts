import { createApp } from './app.js';
import { config } from './config/env.js';
import { runMigrations } from './database/migrations.js';
import { seedDatabase } from './database/seed.js';
import { closeDb } from './database/connection.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  try {
    // 1. Run database migrations & check seed
    runMigrations();
    seedDatabase();

    // 2. Initialize Express application
    const app = createApp();

    // 3. Start listening
    const server = app.listen(config.port, () => {
      logger.info(`========================================================`);
      logger.info(` AI Healthcare Assistant API Server`);
      logger.info(` Running on: http://localhost:${config.port}`);
      logger.info(` Environment: ${config.nodeEnv}`);
      logger.info(` AI Provider: ${config.aiProvider}`);
      logger.info(` Health Check: http://localhost:${config.port}/health`);
      logger.info(`========================================================`);
    });

    // 4. Graceful Shutdown
    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}. Gracefully terminating HTTP server...`);
      server.close(() => {
        logger.info('HTTP server closed. Closing database connections...');
        closeDb();
        logger.info('Database closed. Exiting process cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Fatal bootstrap error in server initialization:', err);
    process.exit(1);
  }
}

bootstrap();
