import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/?(*.)+(spec|test).ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  passWithNoTests: true,
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/server.ts"],
};

export default config;
