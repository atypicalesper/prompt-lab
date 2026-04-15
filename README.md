# Prompt Lab

A local LLM observability and prompt engineering dashboard running entirely on-device via Ollama. Three modes:

- **Single** — stream a prompt against any local model with live token throughput, TTFT, and a context window usage gauge
- **Compare** — same prompt across up to 4 models side-by-side, with response quality and token economics compared
- **A/B Test** — two prompt variants against the same model to measure which is more efficient or effective

Across all modes it tracks **token economics**: input/output counts, tokens/sec, context usage %, and simulated cloud cost (GPT-4o-mini rates) so you can reason about scale cost while running locally for free. A hardware sidebar shows live CPU/RAM/GPU utilization during inference. All runs are persisted with re-run support and prompt templates can be saved.

Stack: NestJS backend, Next.js 15 frontend, Ollama runtime. Supports Llama, Qwen, Mistral, Gemma, Phi, DeepSeek, and ~30 other model families.

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

Installs backend and frontend dependencies, generates the Prisma client, and runs the initial DB migration (SQLite, no external DB required).

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

**Model parameters** — per-run sliders for temperature, top-p, top-k, and max tokens. Collapsed by default; a "custom" badge appears when any value overrides the model default.

**Saved prompts** — name and persist prompt + system prompt pairs to SQLite. Load any saved prompt in one click; manage (delete) from the panel.

**Live token counter** — real-time cl100k_base estimate shown next to the prompt field as you type.

**Streaming output** — rendered Markdown by default with a Raw toggle. Copy button available once generation completes.

**Request history** — all runs persisted to SQLite with full metrics. Expandable rows show full prompt, system prompt, and response with copy and re-run buttons. Export to CSV or JSON. Paginated, clearable.

**Metrics tracked per request:**
- Time to first token (TTFT)
- Tokens per second (TPS)
- Input / output / total token counts
- Context window usage (%)
- Simulated cost (GPT-4o-mini pricing as a production reference baseline)

**Hardware panel** — live CPU %, RAM, GPU VRAM, and whether Ollama is running on GPU.

## Architecture

```
prompt-lab/
├── backend/           # NestJS (TypeScript)
│   ├── src/
│   │   ├── llm/       # Streaming, compare, A/B — Ollama client
│   │   ├── logging/   # Prisma-backed request log
│   │   ├── templates/ # Saved prompt CRUD (PromptTemplate)
│   │   └── hardware/  # systeminformation snapshot
│   └── prisma/
│       └── schema.prisma
└── frontend/          # Next.js 15, React 19, Tailwind v4
    └── src/
        ├── app/       # Single dashboard page
        ├── components/
        └── hooks/     # useStream (SSE), useModels, useHardware, useHistory, useTemplates
```

**Streaming protocol:** two-phase SSE. `POST /llm/stream/init` accepts prompt, model, system prompt, and optional generation parameters (temperature, top-p, top-k, num-predict); returns a `sessionId`. The client opens `GET /llm/stream/:sessionId` as an `EventSource`. Events: `token`, `metrics` (every 5 tokens), `done`, `error`. Sessions are single-use with a 5-minute TTL.

**Token counting:** uses `gpt-tokenizer` (cl100k_base) as a pre-flight estimate. Ollama's exact counts (`eval_count`, `prompt_eval_count`) overwrite this on the final chunk.
