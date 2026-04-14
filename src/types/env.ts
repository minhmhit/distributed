export type AppMode = "publisher" | "node";

export type AppEnv = {
  nodeEnv: "development" | "test" | "production";
  port: number;
  mode: AppMode;
  syncNodeName: string;
  globalDb: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
  localDb: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
};
