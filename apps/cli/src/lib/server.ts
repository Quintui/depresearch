import { spawn } from "child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import consola from "consola";
import { PID_FILE } from "@depresearch/shared";
import { readConfig } from "./setup.js";

const HEALTH_RETRIES = 20;
const HEALTH_INTERVAL_MS = 500;

function getServerDir(): string {
  // Resolve relative to this file: cli/src/lib/server.ts -> ../../server
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return resolve(__dirname, "..", "..", "..", "server");
}

async function isServerHealthy(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${port}/api/agents`);
    return res.ok;
  } catch {
    return false;
  }
}

function readPid(): number | null {
  if (!existsSync(PID_FILE)) return null;
  const raw = readFileSync(PID_FILE, "utf-8").trim();
  const pid = parseInt(raw, 10);
  return isNaN(pid) ? null : pid;
}

function writePid(pid: number): void {
  writeFileSync(PID_FILE, String(pid));
}

export function removePidFile(): void {
  if (existsSync(PID_FILE)) {
    unlinkSync(PID_FILE);
  }
}

export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function getServerStatus(): {
  pid: number | null;
  alive: boolean;
} {
  const pid = readPid();
  if (!pid) return { pid: null, alive: false };
  return { pid, alive: isProcessAlive(pid) };
}

export async function stopServer(): Promise<boolean> {
  const pid = readPid();
  if (!pid) return false;

  if (isProcessAlive(pid)) {
    process.kill(pid, "SIGTERM");
  }

  removePidFile();
  return true;
}

function spawnServer(port: number): number {
  const serverDir = getServerDir();

  consola.start(`Starting Mastra dev server on port ${port}...`);

  const child = spawn("npx", ["mastra", "dev"], {
    cwd: serverDir,
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      PORT: String(port),
    },
  });

  child.unref();

  if (!child.pid) {
    consola.error("Failed to spawn server process.");
    process.exit(1);
  }

  writePid(child.pid);
  return child.pid;
}

async function waitForHealthy(port: number): Promise<void> {
  for (let i = 0; i < HEALTH_RETRIES; i++) {
    if (await isServerHealthy(port)) {
      return;
    }
    await new Promise((r) => setTimeout(r, HEALTH_INTERVAL_MS));
  }
  throw new Error(
    `Server did not become healthy after ${(HEALTH_RETRIES * HEALTH_INTERVAL_MS) / 1000}s`,
  );
}

/**
 * Ensure the Mastra server is running.
 * If not, spawn `mastra dev` as a background process and wait for it.
 */
export async function ensureServer(): Promise<void> {
  const config = readConfig();
  const port = config.port;

  // Already running?
  if (await isServerHealthy(port)) {
    return;
  }

  // Check stale PID
  const { pid, alive } = getServerStatus();
  if (pid && !alive) {
    removePidFile();
  }

  // Spawn new server
  spawnServer(port);

  try {
    await waitForHealthy(port);
    consola.success(`Server is ready on port ${port}`);
  } catch (err) {
    consola.error(
      `Server failed to start. Make sure the server package is built.\n` +
        `Try running: cd apps/server && npx mastra dev`,
    );
    process.exit(1);
  }
}
