import { createTool } from "@mastra/core/tools";
import z from "zod";

export const getRepoUrlTool = createTool({
  id: "get-repo-url-tool",
  description:
    "Resolves a JS/TS library or project name (e.g. 'zod', 'react', 'drizzle-orm') to its GitHub repository URL by querying the repo-getter agent.",
  inputSchema: z.object({
    libraryName: z.string(),
  }),

  outputSchema: z.object({
    url: z.string(),
  }),

  execute: async ({ libraryName }, { mastra }) => {
    const repoGetterAgent = mastra?.getAgentById("repo-getter-agent");

    const result = await repoGetterAgent?.generate(
      "Please get the github url of this project:  " + libraryName,
      {
        structuredOutput: {
          schema: z.object({
            url: z.string(),
          }),
        },
      },
    );

    return {
      url: result?.object.url ?? "",
    };
  },
});
