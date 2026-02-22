import { defineCommand, runMain } from "citty";
import { researchCommand } from "./commands/research.js";
import { configCommand } from "./commands/config.js";

const SUB_COMMANDS = ["research", "config"];

const main = defineCommand({
  meta: {
    name: "depresearch",
    version: "0.0.1",
    description:
      "Research any open-source repo without leaving your project.",
  },
  subCommands: {
    research: researchCommand,
    config: configCommand,
  },
  args: {
    query: {
      type: "positional",
      description:
        'Research question (e.g. "how does streaming work in https://github.com/user/repo")',
      required: false,
    },
    stream: {
      type: "boolean",
      description: "Stream response tokens in real-time",
      default: false,
    },
  },
  async run({ args }) {
    const query = args.query as string | undefined;

    // If the first arg matched a subcommand, citty already ran it — bail out
    if (query && SUB_COMMANDS.includes(query)) {
      return;
    }

    if (!query) {
      console.log('Usage: dpr "<query>" [--stream]');
      console.log("       dpr config set|get <key> [value]");
      console.log("\nRun `dpr --help` for more info.");
      return;
    }

    const { runResearch } = await import("./commands/research.js");
    await runResearch(query, args.stream as boolean);
  },
});

runMain(main);
