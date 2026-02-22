# depresearch

Deep research for your dependencies — without leaving your project.

## The Problem

You find an open-source library that solves a problem in your app. Now you need your coding agent to understand how it works — its internals, patterns, the right way to integrate it.

But your agent only has your project context. Pasting docs floods the context window. Switching to the library's repo loses your project context. You end up manually reading source code and relaying information back and forth.

## What depresearch Does

`depresearch` (alias: `dpr`) is a CLI tool that runs a dedicated AI agent to research any JS/TS library by cloning and reading its actual source code. It runs locally, in its own sandboxed workspace, so your main coding agent's context stays clean.

Ask a question, get a detailed source-code walkthrough with file paths, line numbers, and code snippets — ready to feed back to your coding agent.

```bash
dpr research "how does zod z.infer work internally" --stream
```

```
**Entry Point** — z.infer is a conditional type defined in src/types.ts:847...

**Flow Trace** — When you call z.string().parse(data), it enters
safeParse() at src/types.ts:284, which calls _parse() on the
ZodString subclass (src/types.ts:512)...

**Design Rationale** — The type inference works entirely at the
type level through recursive conditional types...
```

## How It Works

```
dpr research "how does zod parse work"
    │
    ▼
CLI loads config from ~/.depresearch/
    │
    ▼
Mastra agent starts in-process (no server needed)
    │
    ├── repo-getter agent resolves "zod" → github.com/colinhacks/zod
    ├── clones repo into ~/.depresearch/workspace/zod
    ├── reads source code, traces execution paths
    │
    ▼
Detailed walkthrough printed to terminal
```

The agent runs entirely on your machine using [Mastra](https://mastra.ai) workspaces. It clones repos into `~/.depresearch/workspace/`, reads files, runs shell commands — all sandboxed away from your project directory.

## Install

```bash
npm install -g depresearch
```

Requires Node.js 20+ and an [OpenRouter](https://openrouter.ai) API key.

## Setup

```bash
dpr config set api-key <your-openrouter-key>
```

That's it. Run `dpr config` to see all current settings:

```
Current configuration:

  api-key   sk-or-v1...a3f2
  model     anthropic/claude-sonnet-4

Usage:
  dpr config set api-key <your-openrouter-key>
  dpr config set model <model-id>
  dpr config get <key>
```

## Usage

```bash
# Research a library (non-streaming)
dpr research "how does zod z.infer work internally"

# Stream response tokens in real-time
dpr research "how does react useEffect cleanup work" --stream

# Shorthand (skip the "research" subcommand)
dpr "how does drizzle handle migrations" --stream

# Change the AI model
dpr config set model openrouter/google/gemini-3-flash-preview
```

## Configuration

All config lives in `~/.depresearch/`:

```
~/.depresearch/
├── .env              # OPENROUTER_API_KEY=sk-or-...
├── config.json       # { "model": "anthropic/claude-sonnet-4" }
├── mastra.db         # Agent memory (conversation history)
└── workspace/        # Cloned repos live here
```

| Key | Description | Default |
|---|---|---|
| `api-key` | Your OpenRouter API key | (required) |
| `model` | AI model for the research agent | `anthropic/claude-sonnet-4` |

## How the Agent Responds

The research agent traces actual code paths and returns structured walkthroughs:

- **Entry Point** — Where the feature starts in the source code
- **Flow Trace** — Step-by-step execution path with file:line references and inline code snippets
- **How It Fits** — How this piece connects to the broader architecture
- **Design Rationale** — Why it's built this way, patterns and tradeoffs

All responses include file paths with line numbers and 3-10 line code snippets so the output is self-contained — you don't need access to the repo afterward.

## Tech Stack

| Component | Technology |
|---|---|
| CLI framework | [citty](https://github.com/unjs/citty) |
| AI agent | [Mastra](https://mastra.ai) (in-process, no server) |
| LLM provider | [OpenRouter](https://openrouter.ai) |
| Bundler | [tsup](https://github.com/egoist/tsup) |
| Monorepo | [Turborepo](https://turbo.build) + Bun |

## Development

```bash
git clone https://github.com/kristianvtr/depresearch
cd depresearch
bun install
bun run build

# Link globally for local testing
cd apps/cli && npm link

# Watch mode (rebuilds on save)
cd apps/cli && bun run dev
```

## License

MIT
