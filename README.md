# LLM Observatory

A local observability dashboard for Ollama models. Streams inference in real time, surfaces token-level metrics (TTFT, TPS, context usage, cost simulation), and supports multi-model comparison and A/B prompt testing.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Ollama](https://ollama.com/) — running locally with at least one model pulled

```bash
ollama serve
ollama pull llama3.2   # or any model you want to use
```

## Setup

```bash
chmod +x setup.sh && ./setup.sh
```

This installs backend and frontend dependencies, generates the Prisma client, and runs the initial DB migration (SQLite, no external DB required).

## Running

```bash
# Terminal 1 — backend (NestJS, port 3001)
cd backend && npm run start:dev

# Terminal 2 — frontend (Next.js, port 3000)
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

API docs (Swagger): [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

## Configuration

Copy `.env.example` to `.env` in the `backend/` directory. Defaults work out of the box:

| Variable          | Default                    | Description                         |
|-------------------|----------------------------|-------------------------------------|
| `PORT`            | `3001`                     | Backend port                        |
| `OLLAMA_BASE_URL` | `http://localhost:11434`   | Ollama API endpoint                 |
| `DATABASE_URL`    | `file:./observatory.db`    | SQLite DB path (relative to backend)|
| `CORS_ORIGIN`     | `http://localhost:3000`    | Allowed frontend origin             |

## Features

| Mode        | Description                                                                 |
|-------------|-----------------------------------------------------------------------------|
| **Single**  | Stream a prompt to one model. Live token feed, TTFT, TPS, context viz.     |
| **Compare** | Same prompt → N models concurrently. Side-by-side metrics table.           |
| **A/B Test**| Two prompts → same model in parallel. Compare quality and cost.            |

**Metrics tracked per request:**
- Time to first token (TTFT)
- Tokens per second (TPS)
- Input / output / total token counts
- Context window usage (%)
- Simulated cost (GPT-4o-mini pricing as a production reference baseline)

**Hardware panel** — live CPU %, RAM, GPU VRAM, and whether Ollama is running on GPU.

**Request history** — all runs persisted to SQLite with full metrics. Paginated, clearable.

## Architecture

```
llm-observatory/
├── backend/           # NestJS (TypeScript)
│   ├── src/
│   │   ├── llm/       # Streaming, compare, A/B — Ollama client
│   │   ├── logging/   # Prisma-backed request log
│   │   └── hardware/  # systeminformation snapshot
│   └── prisma/
│       └── schema.prisma
└── frontend/          # Next.js 15, React 19, Tailwind v4
    └── src/
        ├── app/       # Single dashboard page
        ├── components/
        └── hooks/     # useStream (SSE), useModels, useHardware, useHistory
```

**Streaming protocol:** two-phase SSE. `POST /llm/stream/init` returns a `sessionId`; the client then opens `GET /llm/stream/:sessionId` as an `EventSource`. Events: `token`, `metrics` (every 5 tokens), `done`, `error`. Sessions are single-use with a 5-minute TTL.

**Token counting:** uses `gpt-tokenizer` (cl100k_base) as a pre-flight estimate. Ollama's exact counts (`eval_count`, `prompt_eval_count`) overwrite this on the final chunk.
