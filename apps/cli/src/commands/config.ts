import { defineCommand } from "citty";
import consola from "consola";
import {
  ensureConfigDir,
  readConfig,
  writeConfig,
  getApiKey,
  setApiKey,
} from "../lib/setup.js";

export const configCommand = defineCommand({
  meta: {
    name: "config",
    description: "Manage depresearch configuration",
  },
  subCommands: {
    set: defineCommand({
      meta: {
        name: "set",
        description: "Set a config value",
      },
      args: {
        key: {
          type: "positional",
          description: "Config key (api-key, model, port)",
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
          case "port": {
            const port = parseInt(value, 10);
            if (isNaN(port) || port < 1 || port > 65535) {
              consola.error("Port must be a number between 1 and 65535.");
              process.exit(1);
            }
            const config = readConfig();
            config.port = port;
            writeConfig(config);
            consola.success(`Port set to: ${port}`);
            break;
          }
          default: {
            consola.error(
              `Unknown config key: ${key}\nValid keys: api-key, model, port`,
            );
            process.exit(1);
          }
        }
      },
    }),
    get: defineCommand({
      meta: {
        name: "get",
        description: "Get a config value",
      },
      args: {
        key: {
          type: "positional",
          description: "Config key (api-key, model, port)",
          required: true,
        },
      },
      run({ args }) {
        const key = args.key as string;

        switch (key) {
          case "api-key": {
            const apiKey = getApiKey();
            if (apiKey) {
              // Mask the key for display
              const masked =
                apiKey.slice(0, 8) + "..." + apiKey.slice(-4);
              console.log(masked);
            } else {
              consola.warn("No API key configured.");
            }
            break;
          }
          case "model": {
            const config = readConfig();
            console.log(config.model);
            break;
          }
          case "port": {
            const config = readConfig();
            console.log(config.port);
            break;
          }
          default: {
            consola.error(
              `Unknown config key: ${key}\nValid keys: api-key, model, port`,
            );
            process.exit(1);
          }
        }
      },
    }),
  },
});
