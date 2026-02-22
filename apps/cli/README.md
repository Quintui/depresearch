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

You get back a walkthrough with file paths, code snippets, and enough context to act on it.

## Works as a sub-agent

`dpr` is a CLI, so your coding agent (Cursor, Claude Code, OpenCode, etc.) can shell out to it directly. The agent gets back what it needs without having to clone and read through a foreign codebase itself.

```
Your coding agent
    ├── shells out: dpr "how does X work in <repo-url>"
    │       ├── clones the repo
    │       ├── research agent reads source code
    │       └── returns walkthrough
    └── continues working on your project
```

## Add as an Agent Skill

You can install depresearch as an [agent skill](https://github.com/anthropics/skills) so your coding agent knows how to use it automatically:

```bash
npx skills add https://github.com/Quintui/depresearch
```

Once installed, your agent can call `dpr` on its own whenever it needs to research an external codebase — no manual prompting required.

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
  model     openrouter/anthropic/claude-haiku-4.5

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

- **Overview** — What the feature does
- **Key Files & Entry Points** — The map of every file and export involved
- **Implementation Walkthrough** — Step-by-step code trace with generous snippets
- **Interfaces & Types** — Full type definitions, schemas, API contracts
- **Dependencies & Config** — External packages, env vars, setup needed
- **Patterns & Gotchas** — Non-obvious decisions, edge cases, tradeoffs

All responses include file paths with line numbers and code snippets so the output is self-contained — you don't need access to the repo afterward.

## Configuration

All config lives in `~/.depresearch/`:

```
~/.depresearch/
├── .env              # OPENROUTER_API_KEY=sk-or-...
├── config.json       # { "model": "openrouter/anthropic/claude-haiku-4.5" }
├── mastra.db         # Agent memory (conversation history)
└── workspace/        # Cloned repos live here
```

| Key | Description | Default |
|---|---|---|
| `api-key` | Your OpenRouter API key | (required) |
| `model` | AI model for the research agent (OpenRouter format) | `openrouter/anthropic/claude-haiku-4.5` |

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
