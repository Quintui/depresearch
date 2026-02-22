# depresearch

Research any open-source repo without leaving your project.

## The Problem

You're building an AI chat interface. You see someone on X share their open-source chat app with a slick streaming implementation, or a clever context window optimization, or a feature you want in your app.

**Without agents:** You go to their repo, read the source code, figure out how the feature works, then manually bring that knowledge back to your project.

**With agents:** You clone their repo, ask AI how the feature works, copy the response, paste it into the AI chat session that has your project context. Better, but still a lot of friction.

**With depresearch:** You run one command:

```bash
dpr "how does the streaming implementation work in https://github.com/someone/cool-chat-app"
```

You get back a detailed source-code walkthrough — entry points, execution flow, file paths, code snippets — ready to act on.

## The Real Power: Agent-to-Agent

The CLI (`dpr`) is designed to be called by your coding agent as a sub-agent.

Your agent sees a repo it needs to understand? It shells out to `dpr`, gets back implementation-ready knowledge, and keeps working — without polluting its own context window with an entire foreign codebase.

```
Your coding agent (e.g. Claude, Cursor, OpenCode)
    │
    │  "I need to understand how this repo handles X"
    │
    ├── shells out: dpr "how does X work in <repo-url>"
    │       │
    │       ├── clones the repo
    │       ├── dedicated research agent reads source code
    │       └── returns structured walkthrough
    │
    ├── receives concise, implementation-focused answer
    │
    └── continues working on YOUR project with that knowledge
```

No context window pollution. No manual copy-paste. No repo switching.

## How It Works

```
dpr "your question about a feature in <repo-url>"
    │
    ▼
CLI loads config from ~/.depresearch/
    │
    ▼
Mastra agent starts in-process (no server needed)
    │
    ├── clones repo into ~/.depresearch/workspace/
    ├── reads source code, traces execution paths
    │
    ▼
Detailed walkthrough printed to stdout
```

The agent runs entirely on your machine using [Mastra](https://mastra.ai). It clones repos into `~/.depresearch/workspace/`, reads files, runs shell commands — all sandboxed away from your project directory.

## Install

```bash
npm install -g depresearch
```

Requires Node.js 20+ and an [OpenRouter](https://openrouter.ai) API key.

## Setup

```bash
dpr config set api-key <your-openrouter-key>
```

Run `dpr config` to see all current settings:

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
# Research a feature in a specific repo
dpr "how does the streaming response work in https://github.com/mckaywrigley/chatbot-ui"

# Stream response tokens in real-time
dpr "how do they handle the AI context window in https://github.com/steven-tey/chathn" --stream

# It can also resolve repos by library name
dpr "how does zod z.infer work internally"

# Change the AI model
dpr config set model openrouter/google/gemini-3-flash-preview
```

## What You Get Back

The research agent traces actual code paths and returns structured walkthroughs:

- **Entry Point** — Where the feature starts in the source code
- **Flow Trace** — Step-by-step execution path with file:line references and code snippets
- **How It Fits** — How this piece connects to the broader architecture
- **Design Rationale** — Why it's built this way, patterns and tradeoffs

All responses include file paths with line numbers and code snippets so the output is self-contained — you don't need access to the repo afterward.

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
