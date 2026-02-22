import { defineCommand } from "citty";
import consola from "consola";
import {
  ensureConfigDir,
  readConfig,
  writeConfig,
  getApiKey,
  setApiKey,
} from "../lib/setup.js";

function printConfigOverview(): void {
  const config = readConfig();
  const apiKey = getApiKey();

  console.log("Current configuration:\n");
  console.log(
    `  api-key   ${apiKey ? apiKey.slice(0, 8) + "..." + apiKey.slice(-4) : "(not set)"}`,
  );
  console.log(`  model     ${config.model}`);
  console.log();
  console.log("Usage:");
  console.log("  dpr config set api-key <your-openrouter-key>");
  console.log("  dpr config set model <model-id>");
  console.log("  dpr config get <key>");
}

export const configCommand = defineCommand({
  meta: {
    name: "config",
    description: "Manage depresearch configuration",
  },
  subCommands: {
    set: defineCommand({
      meta: {
        name: "set",
        description: "Set a config value (api-key, model)",
      },
      args: {
        key: {
          type: "positional",
          description: "api-key | model",
          required: true,
        },
        value: {
          type: "positional",
          description: "Config value",
          required: true,
        },
      },
      run({ args }) {
        ensureConfigDir();

        const key = args.key as string;
        const value = args.value as string;

        switch (key) {
          case "api-key": {
            setApiKey(value);
            consola.success("API key saved.");
            break;
          }
          case "model": {
            const config = readConfig();
            config.model = value;
            writeConfig(config);
            consola.success(`Model set to: ${value}`);
            break;
          }
          default: {
            consola.error(
              `Unknown config key: "${key}"\n\nAvailable keys:\n  api-key   Your OpenRouter API key (required)\n  model     AI model to use (e.g. openrouter/google/gemini-3-flash-preview)`,
            );
            process.exit(1);
          }
        }
      },
    }),
    get: defineCommand({
      meta: {
        name: "get",
        description: "Get a config value (api-key, model)",
      },
      args: {
        key: {
          type: "positional",
          description: "api-key | model",
          required: true,
        },
      },
      run({ args }) {
        const key = args.key as string;

        switch (key) {
          case "api-key": {
            const apiKey = getApiKey();
            if (apiKey) {
              const masked = apiKey.slice(0, 8) + "..." + apiKey.slice(-4);
              console.log(masked);
            } else {
              consola.warn(
                "No API key configured. Run:\n\n  dpr config set api-key <your-openrouter-key>",
              );
            }
            break;
          }
          case "model": {
            const config = readConfig();
            console.log(config.model);
            break;
          }
          default: {
            consola.error(
              `Unknown config key: "${key}"\n\nAvailable keys:\n  api-key   Your OpenRouter API key (required)\n  model     AI model to use (e.g. openrouter/google/gemini-3-flash-preview)`,
            );
            process.exit(1);
          }
        }
      },
    }),
  },
  run() {
    printConfigOverview();
  },
});
