# Project Rules

## Architecture

- Turborepo monorepo with Bun workspaces
- Publishable package: `apps/cli` (npm: `depresearch`)
- Internal packages (`@depresearch/shared`, `@depresearch/mastra`) are `private: true` and bundled inline by tsup

## Publishing to npm

- Publish from `apps/cli` with `npm publish`
- `prepublishOnly` runs the build automatically
- Must bump version (`npm version patch/minor/major`) before every publish -- npm does not allow republishing the same version, even for README-only changes
- Workspace deps (`@depresearch/shared`, `@depresearch/mastra`) are bundled via tsup `noExternal` -- they must NOT be listed in `dependencies`
- Only `citty` and `consola` remain as external runtime dependencies
- Sourcemaps are excluded from the published tarball via the `files` field
- `apps/cli/README.md` is a copy of the root `README.md` -- keep them in sync when updating

## Build

- Root: `bun run build` (turbo)
- CLI: tsup (ESM, node20 target, shebang banner)
- Packages: plain `tsc`

## Code Style

- ESM only (`"type": "module"`)
- TypeScript strict mode
- Target: Node 20+
