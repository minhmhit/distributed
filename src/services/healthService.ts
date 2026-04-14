import { getAppEnv } from "../config/env";

export function getHealthStatus(): {
  status: "ok";
  mode: "publisher" | "node";
  timestamp: string;
} {
  const env = getAppEnv();

  return {
    status: "ok",
    mode: env.mode,
    timestamp: new Date().toISOString(),
  };
}
