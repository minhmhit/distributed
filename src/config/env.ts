import dotenv from "dotenv";
import { z } from "zod";
import { AppEnv } from "../types/env";

dotenv.config({ quiet: true });

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  MODE: z.enum(["publisher", "node"]),
  SYNC_NODE_NAME: z.string().min(1).default("node-unknown"),
  JWT_SECRET: z.string().min(16).default("change-this-jwt-secret-now"),

  GLOBAL_DB_HOST: z.string().min(1),
  GLOBAL_DB_PORT: z.coerce.number().int().positive().default(1433),
  GLOBAL_DB_USER: z.string().min(1),
  GLOBAL_DB_PASSWORD: z.string().min(1),
  GLOBAL_DB_NAME: z.string().min(1),
  GLOBAL_DB_ENCRYPT: z.string().optional().default("false"),
  GLOBAL_DB_TRUST_SERVER_CERT: z.string().optional().default("true"),

  LOCAL_DB_HOST: z.string().min(1),
  LOCAL_DB_PORT: z.coerce.number().int().positive().default(1433),
  LOCAL_DB_USER: z.string().min(1),
  LOCAL_DB_PASSWORD: z.string().min(1),
  LOCAL_DB_NAME: z.string().min(1),
  LOCAL_DB_ENCRYPT: z.string().optional().default("false"),
  LOCAL_DB_TRUST_SERVER_CERT: z.string().optional().default("true"),
});

let cachedEnv: AppEnv | null = null;

function toBoolean(value: string): boolean {
  return value.toLowerCase() === "true";
}

export function getAppEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  cachedEnv = {
    nodeEnv: parsed.data.NODE_ENV,
    port: parsed.data.PORT,
    mode: parsed.data.MODE,
    syncNodeName: parsed.data.SYNC_NODE_NAME,
    jwtSecret: parsed.data.JWT_SECRET,
    globalDb: {
      host: parsed.data.GLOBAL_DB_HOST,
      port: parsed.data.GLOBAL_DB_PORT,
      user: parsed.data.GLOBAL_DB_USER,
      password: parsed.data.GLOBAL_DB_PASSWORD,
      database: parsed.data.GLOBAL_DB_NAME,
      encrypt: toBoolean(parsed.data.GLOBAL_DB_ENCRYPT),
      trustServerCertificate: toBoolean(
        parsed.data.GLOBAL_DB_TRUST_SERVER_CERT,
      ),
    },
    localDb: {
      host: parsed.data.LOCAL_DB_HOST,
      port: parsed.data.LOCAL_DB_PORT,
      user: parsed.data.LOCAL_DB_USER,
      password: parsed.data.LOCAL_DB_PASSWORD,
      database: parsed.data.LOCAL_DB_NAME,
      encrypt: toBoolean(parsed.data.LOCAL_DB_ENCRYPT),
      trustServerCertificate: toBoolean(parsed.data.LOCAL_DB_TRUST_SERVER_CERT),
    },
  };

  return cachedEnv as AppEnv;
}
