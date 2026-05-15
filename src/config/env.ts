import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { z } from "zod";
import { AppEnv } from "../types/env";

const requestedEnvFile = process.env.ENV_FILE?.trim();
const resolvedEnvFile = requestedEnvFile
  ? path.resolve(process.cwd(), requestedEnvFile)
  : path.resolve(process.cwd(), ".env");

if (fs.existsSync(resolvedEnvFile)) {
  dotenv.config({ path: resolvedEnvFile, quiet: true });
} else {
  dotenv.config({ quiet: true });
}

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

  NODE_HCM_DB_HOST: z.string().optional(),
  NODE_HCM_DB_PORT: z.coerce.number().int().positive().optional(),
  NODE_HCM_DB_USER: z.string().optional(),
  NODE_HCM_DB_PASSWORD: z.string().optional(),
  NODE_HCM_DB_NAME: z.string().optional(),
  NODE_HCM_DB_ENCRYPT: z.string().optional().default("false"),
  NODE_HCM_DB_TRUST_SERVER_CERT: z.string().optional().default("true"),

  NODE_HN_DB_HOST: z.string().optional(),
  NODE_HN_DB_PORT: z.coerce.number().int().positive().optional(),
  NODE_HN_DB_USER: z.string().optional(),
  NODE_HN_DB_PASSWORD: z.string().optional(),
  NODE_HN_DB_NAME: z.string().optional(),
  NODE_HN_DB_ENCRYPT: z.string().optional().default("false"),
  NODE_HN_DB_TRUST_SERVER_CERT: z.string().optional().default("true"),
});

let cachedEnv: AppEnv | null = null;

function toBoolean(value: string): boolean {
  return value.toLowerCase() === "true";
}

function optionalDbConfig(input: {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  encrypt: string;
  trustServerCertificate: string;
}) {
  if (!input.host || !input.user || !input.password || !input.database) {
    return undefined;
  }

  return {
    host: input.host,
    port: input.port ?? 1433,
    user: input.user,
    password: input.password,
    database: input.database,
    encrypt: toBoolean(input.encrypt),
    trustServerCertificate: toBoolean(input.trustServerCertificate),
  };
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
    branchDbs: {
      hcm: optionalDbConfig({
        host: parsed.data.NODE_HCM_DB_HOST,
        port: parsed.data.NODE_HCM_DB_PORT,
        user: parsed.data.NODE_HCM_DB_USER,
        password: parsed.data.NODE_HCM_DB_PASSWORD,
        database: parsed.data.NODE_HCM_DB_NAME,
        encrypt: parsed.data.NODE_HCM_DB_ENCRYPT,
        trustServerCertificate: parsed.data.NODE_HCM_DB_TRUST_SERVER_CERT,
      }),
      hn: optionalDbConfig({
        host: parsed.data.NODE_HN_DB_HOST,
        port: parsed.data.NODE_HN_DB_PORT,
        user: parsed.data.NODE_HN_DB_USER,
        password: parsed.data.NODE_HN_DB_PASSWORD,
        database: parsed.data.NODE_HN_DB_NAME,
        encrypt: parsed.data.NODE_HN_DB_ENCRYPT,
        trustServerCertificate: parsed.data.NODE_HN_DB_TRUST_SERVER_CERT,
      }),
    },
  };

  return cachedEnv as AppEnv;
}
