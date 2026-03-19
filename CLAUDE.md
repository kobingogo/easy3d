# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**easy3d v2.0** is an **AI Frontend Engineer Capability Showcase Platform** - demonstrating core AI engineering skills through a practical 3D product showcase generator.

### Goals

1. 🎯 **Interview Portfolio** - Demonstrate RAG/Agent/Fine-tuning capabilities
2. 💰 **Side Business** - Validate commercial viability
3. 📚 **Learning Path** - Systematically master AI frontend tech stack

### Core Capabilities to Showcase

| Capability      | Interview Focus                               | Implementation                           |
| --------------- | --------------------------------------------- | ---------------------------------------- |
| **RAG**         | Vector retrieval, knowledge base construction | 3D model knowledge base + e-commerce Q&A |
| **Agent**       | Task planning, tool orchestration             | Automated 3D generation workflow         |
| **Fine-tuning** | LoRA/Prompt optimization                      | E-commerce prompt optimizer              |

## Tech Stack

### Frontend

| Technology              | Purpose              |
| ----------------------- | -------------------- |
| Next.js 14 (App Router) | Full-stack framework |
| TypeScript 5            | Type safety          |
| Three.js + R3F          | 3D rendering         |
| Tailwind + shadcn/ui    | Styling              |
| Framer Motion           | Animations           |

### AI Layer (Core Showcase)

| Technology   | Purpose                                                |
| ------------ | ------------------------------------------------------ |
| Qdrant       | Vector database for RAG                                |
| 阿里云百炼   | LLM API (qwen3.5-plus, qwen-vl-max, text-embedding-v3) |
| Tripo AI     | 3D model generation                                    |
| Custom Agent | ReAct + Template planner (面试能讲清原理)              |

### Backend

| Technology  | Purpose                     |
| ----------- | --------------------------- |
| Supabase    | PostgreSQL + Storage + Auth |
| NextAuth.js | Authentication              |
| Vercel KV   | Caching/Rate limiting       |

## Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Type check
npm run type-check

# Lint
npm run lint

# Test (Phase 5)
npm run test
```

## Project Structure

```
easy3d/
├── app/
│   ├── page.tsx                # Landing page
│   ├── generate/               # 3D generation
│   ├── agent/                  # ⭐ Agent showcase
│   │   ├── page.tsx            # Agent console
│   │   └── workflow/[id]/      # Workflow execution
│   ├── knowledge/              # ⭐ RAG showcase
│   │   ├── page.tsx            # Knowledge base management
│   │   └── search/page.tsx     # Vector search demo
│   ├── fine-tune/              # ⭐ Fine-tuning showcase
│   │   ├── page.tsx            # Training data management
│   │   └── evaluate/page.tsx   # Effect comparison
│   └── api/
│       ├── rag/                # RAG APIs
│       ├── agent/              # Agent APIs
│       └── generate/           # 3D generation APIs
├── lib/
│   ├── rag/                    # ⭐ RAG engine
│   │   ├── qdrant.ts           # Vector DB client
│   │   ├── embedding.ts        # Embedding functions
│   │   └── knowledge-base.ts   # Knowledge data
│   ├── agent/                  # ⭐ Agent engine
│   │   ├── tools.ts            # Tool definitions
│   │   ├── workflow.ts         # Workflow orchestration
│   │   └── planner.ts          # Task planning
│   ├── fine-tune/              # ⭐ Fine-tuning tools
│   │   ├── data.ts             # Data preparation
│   │   ├── prompt-optimizer.ts # Prompt optimization
│   │   └── evaluate.ts         # Evaluation
│   └── tripo/                  # Tripo API wrapper
├── components/
│   ├── rag/                    # RAG UI components
│   ├── agent/                  # Agent UI components
│   └── 3d/                     # Three.js components
├── scripts/
│   └── build-knowledge.ts      # Build knowledge base
├── tests/                      # Unit tests (target: 80%+)
└── docs/
    ├── architecture.md
    ├── ai-design.md
    └── interview-guide.md      # Interview talking points
```

## RAG Implementation

### Knowledge Base Schema

```typescript
interface KnowledgeEntry {
  id: string;
  text: string; // Expert knowledge text
  vector: number[]; // Embedding vector
  tags: string[]; // ["化妆品", "灯光"]
  category: string; // "beauty" | "electronics" | ...
}
```

### Key Functions (lib/rag/)

- `buildIndex()` - Vectorize and store knowledge entries
- `searchKnowledge(query, limit)` - Semantic search with similarity threshold
- `suggestDisplay(productDesc)` - RAG-powered 3D display suggestions

### Metrics Target

- Retrieval accuracy: > 85%
- Search latency: < 500ms

## Agent Implementation

### Tools (lib/agent/tools/)

1. `analyze_product` - Vision model (qwen-vl-max) to identify product category/style
2. `optimize_prompt` - RAG-enhanced prompt generation
3. `generate_3d` - Tripo API call
4. `quality_check` - Vision model quality verification
5. `export_model` - Export to GLB/GIF/MP4

### Workflow (lib/agent/workflow.ts)

```typescript
// User: "帮我生成一个适合小红书的女包 3D 展示"
// Agent auto-executes:
// 1. analyze_product(image) → { category: "bag", style: "luxury" }
// 2. optimize_prompt(analysis) → "Professional product photography..."
// 3. generate_3d(prompt, image) → taskId
// 4. quality_check(modelUrl) → { passed: true }
// 5. export_model(model, "glb") → { url: "..." }
```

### Metrics Target

- Workflow success rate: > 90%
- Tool call accuracy: > 95%

## Fine-tuning Implementation

### Training Data Format

```typescript
interface TrainingSample {
  input: string; // "女包，棕色，皮质"
  output: string; // "Professional product photography of a brown leather handbag..."
}
// Target: 500+ samples
```

### Prompt Templates (lib/fine-tune/prompt-optimizer.ts)

- `default` - Standard product photography
- `luxury` - Premium/elegant style
- `tech` - Futuristic/metallic style

### Metrics Target

- Prompt quality improvement: > 40%
- Professional score: > 8/10

## Environment Variables

```bash
# 阿里云百炼 API
DASHSCOPE_API_KEY=sk-xxx

# Tripo AI
TRIPO_API_KEY=

# Qdrant (RAG)
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=                    # Optional, for Qdrant Cloud

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

## Development Phases

| Phase | Weeks | Focus            | Deliverable                          |
| ----- | ----- | ---------------- | ------------------------------------ |
| 1     | 1-2   | Basic framework  | Working MVP                          |
| 2     | 3-4   | RAG capability   | Knowledge Q&A + tech blog            |
| 3     | 5-6   | Agent capability | Auto workflow + tech blog            |
| 4     | 7-8   | Fine-tuning      | Prompt optimizer + comparison report |
| 5     | 9     | Interview prep   | Documentation + portfolio            |

## Key Implementation Notes

### RAG

- Use Qdrant locally via Docker for development
- Embedding: 阿里云百炼 text-embedding-v3 (1024 维)
- Reranker: qwen3.5-plus 打分重排序，提升准确率 5-10%
- Score threshold: 0.7 for relevance filtering

### Agent

- ReAct planning pattern (Reason → Act → Observe)
- Tool definition aligned with OpenAI Function Calling format
- Tracer module for execution tracking (面试展示用)
- Each tool should be idempotent and retryable

### Three.js

- Always use `'use client'` directive
- Canvas and hooks only work in client components

### Supabase Client

- Browser: `lib/supabase/client.ts` - sync `createClient()`
- Server: `lib/supabase/server.ts` - async `createClient()`

## Interview Showcase Strategy

When demonstrating this project:

1. **RAG Demo** (2 min): Show knowledge search returning relevant 3D display suggestions
2. **Agent Demo** (3 min): Input natural language, watch automatic workflow execution
3. **Fine-tune Demo** (2 min): Compare before/after prompt quality

## Related Documentation

- `PRD-v2.0-AI-Frontend.md` - Product requirements (AI showcase focus)
- `ARCH-v1.0.md` - Architecture design (reference, may need update)
- `CLAUDE_CODE_PROMPT_v2.md` - Development instructions
- `TASKS.md` - Task tracking (needs update for v2.0)
