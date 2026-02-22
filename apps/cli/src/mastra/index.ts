import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";
import { CONFIG_DIR } from "@depresearch/shared";
import { researchAgent } from "./agents/research-agent.js";
import { repoGetterAgent } from "./agents/repo-getter-agent.js";

let _mastra: Mastra | null = null;

/**
 * Lazily initialise and return the Mastra instance.
 *
 * The caller MUST ensure that `process.env.OPENROUTER_API_KEY` is set
 * (via `loadEnv()` in setup.ts) before calling this for the first time.
 */
export function getMastra(): Mastra {
  if (_mastra) return _mastra;

  _mastra = new Mastra({
    agents: { researchAgent, repoGetterAgent },
    storage: new LibSQLStore({
      id: "mastra-storage",
      url: `file:${CONFIG_DIR}/mastra.db`,
    }),
    logger: new PinoLogger({
      name: "Mastra",
      level: "warn",
    }),
  });

  return _mastra;
}
