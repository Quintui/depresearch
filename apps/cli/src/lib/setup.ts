import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import consola from "consola";
import {
  CONFIG_DIR,
  CONFIG_FILE,
  ENV_FILE,
  WORKSPACE_DIR,
} from "@depresearch/shared";
import { DEFAULT_PORT, DEFAULT_MODEL } from "@depresearch/shared";
import type { ConfigData } from "@depresearch/shared";

const DEFAULT_CONFIG: ConfigData = {
  port: DEFAULT_PORT,
  model: DEFAULT_MODEL,
};

export function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  if (!existsSync(WORKSPACE_DIR)) {
    mkdirSync(WORKSPACE_DIR, { recursive: true });
  }
}

export function ensureConfigFile(): ConfigData {
  ensureConfigDir();

  if (!existsSync(CONFIG_FILE)) {
    writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return DEFAULT_CONFIG;
  }

  const raw = readFileSync(CONFIG_FILE, "utf-8");
  return JSON.parse(raw) as ConfigData;
}

export function readConfig(): ConfigData {
  if (!existsSync(CONFIG_FILE)) {
    return DEFAULT_CONFIG;
  }
  const raw = readFileSync(CONFIG_FILE, "utf-8");
  return JSON.parse(raw) as ConfigData;
}

export function writeConfig(config: ConfigData): void {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getApiKey(): string | null {
  if (!existsSync(ENV_FILE)) {
    return null;
  }
  const raw = readFileSync(ENV_FILE, "utf-8");
  const match = raw.match(/^OPENROUTER_API_KEY=(.+)$/m);
  return match ? match[1].trim() : null;
}

export function setApiKey(key: string): void {
  ensureConfigDir();
  writeFileSync(ENV_FILE, `OPENROUTER_API_KEY=${key}\n`);
}

export function ensureApiKey(): void {
  const key = getApiKey();
  if (!key) {
    consola.error(
      "No API key configured. Run:\n\n  dpr config set api-key <your-openrouter-key>\n",
    );
    process.exit(1);
  }
}

/**
 * Full setup check: ensure config dir, config file, and API key exist.
 * Returns the loaded config.
 */
export function ensureSetup(): ConfigData {
  const config = ensureConfigFile();
  ensureApiKey();
  return config;
}
