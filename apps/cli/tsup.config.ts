import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  outDir: "dist",
  clean: true,
  splitting: false,
  sourcemap: true,
  // Inline workspace packages — they don't exist on npm
  noExternal: ["@depresearch/shared", "@depresearch/mastra"],
  // Keep banner for the shebang
  banner: {
    js: "#!/usr/bin/env node",
  },
});
