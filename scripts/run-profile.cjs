const path = require("path");
const { spawn } = require("child_process");

const [, , envFile, ...commandParts] = process.argv;

if (!envFile || commandParts.length === 0) {
  console.error(
    "Usage: node scripts/run-profile.cjs <env-file> <command> [args...]",
  );
  process.exit(1);
}

const resolvedEnvFile = path.resolve(process.cwd(), envFile);
const [command, ...args] = commandParts;

const child = spawn(command, args, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    ENV_FILE: resolvedEnvFile,
  },
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(`Failed to start command with ${resolvedEnvFile}:`, error);
  process.exit(1);
});
