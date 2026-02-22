# depresearch

> Deep research for your dependencies. Understand any JS/TS library by analyzing its source code + docs together, powered by an AI agent.

CLI alias: `dpr`

---

## What is it?

A CLI tool that deeply researches JavaScript/TypeScript libraries by analyzing their source code and documentation together, powered by an AI agent (Mastra + OpenRouter).

Standard docs often lack context. Reading source code is time-consuming. `depresearch` combines both: an AI agent clones the library's repo, reads its source, fetches its docs, and gives you a synthesized, deep answer streamed directly to your terminal.

---

## Usage

```bash
# Install globally
bun install -g depresearch

# Use (full or short alias)
depresearch zod "how does z.infer work internally"
dpr react "useEffect cleanup behavior"
dpr drizzle "how do migrations work under the hood"

# Configuration
dpr config set api-key <openrouter-key>
dpr config set model anthropic/claude-sonnet-4
dpr config set port 7891

# Server management
dpr status    # check if server is running
dpr stop      # stop the background server
```

---

## Architecture

### Overview

```
User runs:  dpr react "how does useEffect cleanup work"
                |
                v
          CLI (apps/cli)
                |
                v
   HTTP POST localhost:7891/api/research
   { library: "react", query: "how does useEffect cleanup work" }
                |
                v
        Mastra Server (apps/server)
                |
                |-- 1. Clone/fetch source code from GitHub
                |-- 2. Fetch official documentation
                |-- 3. AI agent synthesizes source + docs
                |
                v
        Streamed response (SSE / chunked HTTP)
                |
                v
          CLI prints tokens to terminal in real-time
```

### Monorepo Structure (Turborepo + Bun)

```
depresearch/
├── apps/
│   ├── cli/                  # Global CLI tool
│   │   ├── src/
│   │   │   ├── index.ts      # Entry point, citty setup
│   │   │   ├── commands/
│   │   │   │   ├── research.ts   # Main: dpr <lib> <query>
│   │   │   │   ├── config.ts     # dpr config set/get
│   │   │   │   └── status.ts     # dpr status / dpr stop
│   │   │   ├── server.ts     # Auto-start/stop server logic
│   │   │   ├── stream.ts     # Consume streamed response, print to terminal
│   │   │   └── setup.ts      # First-run: prompt API key, create ~/.depresearch/
│   │   └── package.json      # "bin": { "depresearch": ..., "dpr": ... }
│   │
│   └── server/               # Mastra AI agent server
│       ├── src/
│       │   ├── index.ts      # Mastra server entry
│       │   ├── mastra/
│       │   │   ├── agent.ts  # Research agent definition
│       │   │   └── tools.ts  # Tools: clone repo, fetch docs, search code
│       │   ├── idle.ts       # Auto-shutdown after 5min inactivity
│       │   └── health.ts     # GET /health endpoint
│       └── package.json
│
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types.ts      # Request/response types
│       │   ├── config.ts     # Config path (~/.depresearch/), port, defaults
│       │   └── constants.ts  # Port number, timeouts
│       └── package.json
│
├── turbo.json
├── package.json              # Workspace root
└── bun.lock
```

### Package Responsibilities

| Package | Purpose |
|---|---|
| `apps/cli` | CLI entry point. Parses args (citty), manages server lifecycle, streams AI response to terminal. |
| `apps/server` | Mastra server. Hosts research agent. Clones repos, fetches docs, synthesizes answers. Exposes HTTP API. |
| `packages/shared` | Shared types, config path constants, port defaults. |

---

## CLI Commands

| Command | Description |
|---|---|
| `dpr <library> <query>` | Research a library. Streams response to terminal. |
| `dpr config set <key> <value>` | Set config value (api-key, model, port). |
| `dpr config get <key>` | Get config value. |
| `dpr status` | Check if server is running. |
| `dpr stop` | Stop the background server. |

---

## Server

- **Framework**: Mastra (AI agent framework)
- **Port**: `7891` (configurable)
- **Endpoints**:
  - `GET /health` - returns `{ status: "ok" }`
  - `POST /api/research` - accepts `{ library: string, query: string }`, streams response
- **Lifecycle**: Auto-stops after 5 minutes of inactivity
- **LLM**: OpenRouter (default model: `anthropic/claude-sonnet-4`)

---

## Server Auto-Management

The user never needs to manually start the server. The CLI handles it transparently.

1. CLI sends request to `localhost:7891/health`
2. If no response: spawn server as detached background process
3. Wait for health check to pass (retry with backoff, max ~10s)
4. Proceed with request
5. Server tracks last request timestamp
6. After 5 minutes idle, server process exits

```
// Pseudocode in CLI
const isRunning = await fetch("http://localhost:7891/health").catch(() => false)
if (!isRunning) {
  const serverPath = resolve(__dirname, "../server/dist/index.js")
  spawn("bun", ["run", serverPath], { detached: true, stdio: "ignore" })
  await waitForHealthy("http://localhost:7891/health", { retries: 10, interval: 500 })
}
```

---

## Config & Storage

```
~/.depresearch/
├── .env              # OPENROUTER_API_KEY=sk-or-...
├── config.json       # { "port": 7891, "model": "anthropic/claude-sonnet-4" }
└── server.pid        # PID of background server process (for stop/status)
```

---

## First Run Flow

1. User runs `dpr zod "z.infer"`
2. No `~/.depresearch/` directory found
3. CLI prompts: `Enter your OpenRouter API key:`
4. Creates `~/.depresearch/.env` and `~/.depresearch/config.json` with defaults
5. Starts server in background
6. Makes research request
7. Streams response to terminal

---

## Tech Stack

| Component | Technology |
|---|---|
| Monorepo | Turborepo |
| Runtime | Bun |
| CLI framework | citty |
| AI agent | Mastra |
| LLM provider | OpenRouter |
| HTTP server | Mastra built-in (Hono) |
| Config storage | Flat files in `~/.depresearch/` |

---

## Installation & Packaging

The CLI is the globally-installable npm package. The server code is bundled within the same package.

```json
{
  "name": "depresearch",
  "bin": {
    "depresearch": "./bin/cli.js",
    "dpr": "./bin/cli.js"
  }
}
```

User installs once:

```bash
bun install -g depresearch
```

Both `depresearch` and `dpr` commands become available globally.

---

## Build Order

### Phase 1: Scaffold Monorepo
- Init Turborepo + Bun workspaces
- Configure workspace packages
- Set up turbo.json with build/dev pipelines

### Phase 2: packages/shared
- Define request/response types
- Config path utilities (~/.depresearch/)
- Constants (default port, idle timeout, default model)

### Phase 3: apps/server
- Mastra project setup
- Research agent with tools (clone repo, fetch docs, search code)
- POST /api/research endpoint with streaming response
- GET /health endpoint
- Idle auto-shutdown timer (5 minutes)
- Read API key from ~/.depresearch/.env

### Phase 4: apps/cli
- citty setup with command structure
- Main command: dpr <library> <query>
- Config command: dpr config set/get
- Status/stop commands
- Server auto-start logic (spawn detached, wait for health)
- Streaming response consumer (print tokens to terminal as they arrive)
- First-run setup (prompt API key, create config dir)

### Phase 5: End-to-End Testing
- Full flow: install -> first run -> research -> streaming output
- Server lifecycle: auto-start, idle shutdown, restart
- Config management

---

## Future Ideas (not in v1)

- Cache responses locally to save cost on repeated queries
- Support non-JS/TS libraries (Python, Go, Rust, etc.)
- Interactive TUI mode with rich formatting
- Embedding/vector search over cloned source code for better retrieval
- "Compare two libraries" command (`dpr compare zod yup`)
- Export research output to markdown file
- Plugin system for custom research strategies
