import sql, { config as SqlConfig, ConnectionPool } from "mssql";
import { getAppEnv } from "./env";
import { logger } from "../utils/logger";

let globalDbPool: ConnectionPool | null = null;
let localDbPool: ConnectionPool | null = null;

function buildSqlConfig(config: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  encrypt: boolean;
  trustServerCertificate: boolean;
}): SqlConfig {
  return {
    user: config.user,
    password: config.password,
    server: config.host,
    port: config.port,
    database: config.database,
    options: {
      encrypt: config.encrypt,
      trustServerCertificate: config.trustServerCertificate,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

async function connectPool(
  label: string,
  config: SqlConfig,
): Promise<ConnectionPool> {
  const pool = new sql.ConnectionPool(config);

  pool.on("error", (error) => {
    logger.error(`Database pool error on ${label}`, { error: error.message });
  });

  await pool.connect();
  logger.info(`Connected ${label} database`, { database: config.database });
  return pool;
}

export async function connectDatabases(): Promise<{
  globalDb: ConnectionPool;
  localDb: ConnectionPool;
}> {
  const env = getAppEnv();

  if (!globalDbPool || !globalDbPool.connected) {
    globalDbPool = await connectPool("globalDb", buildSqlConfig(env.globalDb));
  }

  if (!localDbPool || !localDbPool.connected) {
    localDbPool = await connectPool("localDb", buildSqlConfig(env.localDb));
  }

  return {
    globalDb: globalDbPool,
    localDb: localDbPool,
  };
}

export function getGlobalDbPool(): ConnectionPool {
  if (!globalDbPool || !globalDbPool.connected) {
    throw new Error("globalDb pool is not connected");
  }

  return globalDbPool;
}

export function getLocalDbPool(): ConnectionPool {
  if (!localDbPool || !localDbPool.connected) {
    throw new Error("localDb pool is not connected");
  }

  return localDbPool;
}

export function getCurrentDbPool(): ConnectionPool {
  const env = getAppEnv();

  if (env.mode === "publisher") {
    return getGlobalDbPool();
  }

  return getLocalDbPool();
}

export async function closeDatabases(): Promise<void> {
  if (globalDbPool?.connected) {
    await globalDbPool.close();
  }

  if (localDbPool?.connected) {
    await localDbPool.close();
  }

  globalDbPool = null;
  localDbPool = null;
}
