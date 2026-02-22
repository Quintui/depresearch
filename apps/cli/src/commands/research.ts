import { defineCommand } from "citty";
import consola from "consola";
import { ensureSetup } from "../lib/setup.js";
import { ensureServer } from "../lib/server.js";
import { getClient } from "../lib/client.js";

const AGENT_ID = "research-agent";

export async function runResearch(query: string, shouldStream: boolean) {
  ensureSetup();
  await ensureServer();

  const client = getClient();
  const agent = client.getAgent(AGENT_ID);

  if (shouldStream) {
    consola.start(`Researching...\n`);

    try {
      const response = await agent.stream(query);

      await response.processDataStream({
        async onChunk(chunk) {
          if (chunk.type === "text-delta") {
            process.stdout.write(chunk.payload.text);
          }
        },
      });

      process.stdout.write("\n");
    } catch (err) {
      consola.error("Failed to stream response from agent.");
      consola.error(String(err));
      process.exit(1);
    }
  } else {
    consola.start(`Researching...`);

    try {
      const response = await agent.generate(query);
      console.log();
      console.log(response.text);
    } catch (err) {
      consola.error("Failed to get response from agent.");
      consola.error(String(err));
      process.exit(1);
    }
  }
}

export const researchCommand = defineCommand({
  meta: {
    name: "research",
    description: "Research a JS/TS library by analyzing its source code",
  },
  args: {
    query: {
      type: "positional",
      description: 'Research question (e.g. "how does zod parse work internally")',
      required: true,
    },
    stream: {
      type: "boolean",
      description: "Stream response tokens in real-time",
      default: false,
    },
  },
  async run({ args }) {
    await runResearch(args.query as string, args.stream as boolean);
  },
});
