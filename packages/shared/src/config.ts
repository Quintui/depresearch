import { join } from "path";
import { homedir } from "os";

export const CONFIG_DIR = join(homedir(), ".depresearch");
export const CONFIG_FILE = join(CONFIG_DIR, "config.json");
export const ENV_FILE = join(CONFIG_DIR, ".env");
export const PID_FILE = join(CONFIG_DIR, "server.pid");
export const WORKSPACE_DIR = join(CONFIG_DIR, "workspace");
