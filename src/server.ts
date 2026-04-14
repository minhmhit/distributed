import { createApp } from "./app";
import { closeDatabases, connectDatabases } from "./config/database";
import { getAppEnv } from "./config/env";
import { logger } from "./utils/logger";

async function bootstrap(): Promise<void> {
  const env = getAppEnv();
  await connectDatabases();

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info("Distributed HRM backend is running", {
      port: env.port,
      mode: env.mode,
    });
  });

  const shutdown = async () => {
    logger.info("Shutting down server");
    server.close(async () => {
      await closeDatabases();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error: Error) => {
  logger.error("Bootstrap failed", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
