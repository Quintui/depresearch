import { defineCommand } from "citty";
import consola from "consola";
import { ensureSetup } from "../lib/setup.js";
import { getMastra } from "../mastra/index.js";

export async function runResearch(query: string, shouldStream: boolean) {
  ensureSetup();

  const mastra = getMastra();
  const agent = mastra.getAgent("researchAgent");

  if (shouldStream) {
    consola.start(`Researching...\n`);

    try {
      const response = await agent.stream(query, {maxSteps: 999});

      for await (const chunk of response.textStream) {
        process.stdout.write(chunk);
      }

      process.stdout.write("\n");
    } catch (err) {
      consola.error("Failed to stream response from agent.");
      consola.error(String(err));
      process.exit(1);
    }
  } else {
    consola.start(`Researching...`);

    try {
      const response = await agent.generate(query, {maxSteps: 999});
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
      description:
        'Research question (e.g. "how does zod parse work internally")',
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
