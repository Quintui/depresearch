import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";
import { ensureOpenRouterModel } from "@depresearch/shared";

import { createResearchAgent } from "./agents/research-agent.js";
import { repoGetterAgent } from "./agents/repo-getter-agent.js";

export { createResearchAgent } from "./agents/research-agent.js";
export { repoGetterAgent } from "./agents/repo-getter-agent.js";
export { getRepoUrlTool } from "./tools/get-repo-url-tool.js";

export interface CreateMastraOptions {
  storageUrl: string;
  model?: string;
  logLevel?: "warn" | "info" | "debug";
}

export function createMastra(opts: CreateMastraOptions): Mastra {
  const model = opts.model ? ensureOpenRouterModel(opts.model) : undefined;
  const researchAgent = createResearchAgent(model);

  return new Mastra({
    agents: { researchAgent, repoGetterAgent },
    storage: new LibSQLStore({
      id: "mastra-storage",
      url: opts.storageUrl,
    }),
    logger: new PinoLogger({
      name: "Mastra",
      level: opts.logLevel ?? "warn",
    }),
  });
}
