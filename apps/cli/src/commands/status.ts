import { defineCommand } from "citty";
import consola from "consola";
import { readConfig } from "../lib/setup.js";
import { getServerStatus, stopServer } from "../lib/server.js";

export const statusCommand = defineCommand({
  meta: {
    name: "status",
    description: "Check if the depresearch server is running",
  },
  async run() {
    const config = readConfig();
    const { pid, alive } = getServerStatus();

    if (!pid) {
      consola.info("Server is not running (no PID file found).");
      return;
    }

    if (!alive) {
      consola.warn(`Server PID ${pid} is stale (process not found).`);
      return;
    }

    // Check if it's actually responding
    try {
      const res = await fetch(`http://localhost:${config.port}/api/agents`);
      if (res.ok) {
        consola.success(`Server is running (PID ${pid}, port ${config.port}).`);
      } else {
        consola.warn(
          `Server process is alive (PID ${pid}) but not responding on port ${config.port}.`,
        );
      }
    } catch {
      consola.warn(
        `Server process is alive (PID ${pid}) but not reachable on port ${config.port}.`,
      );
    }
  },
});

export const stopCommand = defineCommand({
  meta: {
    name: "stop",
    description: "Stop the depresearch server",
  },
  async run() {
    const stopped = await stopServer();

    if (stopped) {
      consola.success("Server stopped.");
    } else {
      consola.info("Server is not running.");
    }
  },
});
