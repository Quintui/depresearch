import { Agent } from "@mastra/core/agent";

export const repoGetterAgent = new Agent({
  id: "repo-getter-agent",
  name: "Repo Getter Agent",
  instructions: `You resolve a JS/TS library or project name to its GitHub repository URL.

Given a library name (e.g. "zod", "drizzle-orm", "react") or a project description, determine the correct GitHub URL for its source code. Use the npm registry or package metadata to find the repo. Return the full GitHub URL (e.g. https://github.com/colinhacks/zod).

If the name is ambiguous, pick the most popular/canonical package.`,
  model: "openrouter/perplexity/sonar",
});
