# ADR-0007 — Atlas AI Gateway & Workout-Generation Tools

- **Status:** Accepted
- **Date:** 2026-06-19
- **Author:** Engineering (Atlas)
- **Supersedes:** —
- **Related Blueprint docs:** `10 - Atlas AI`, `22 - AI Engineering`, `07 - Features`, `12 - Backend Architecture`, `14 - API`, `15 - Authentication`, `16 - Security`, `21 - Observability`, `23 - Engineering Governance`
- **Builds on:** ADR-0002 (LLM Provider Strategy)

---

## Context

The Atlas AI is the product's principal agent (doc 10): it converses about
training, explains exercises, and **builds workouts** for the user. Doc 22
mandates a strict engineering discipline — everything routes through the **AI
Gateway**; the provider is **abstract** (ADR-0002: Anthropic default, swappable);
**prompts are versioned assets**, never hardcoded; the model **prefers tools to
hallucination** and **never touches business rules or the database directly**;
every interaction is **observable and guardrailed**.

A real provider needs an API key (cost). To ship a runnable, testable subsystem
now, we also need a credential-free path.

## Problem

How do we implement the Atlas AI so it (a) routes every model call through one
gateway behind a provider-agnostic port, (b) lets the AI generate workouts from
the **real exercise catalogue** via tools rather than inventing data, (c) never
lets the AI bypass the domain (it calls existing use cases), (d) versions prompts
and records observability, and (e) runs with or without an API key?

## Decision

Build an `ai` domain module, layered like the rest (doc 12). Its pieces map to
the doc-22 architecture (Gateway → Context → Prompt → Tool Router → Provider →
Validator):

```text
LlmProvider (domain port)        complete(request) → assistant turn (text | tool calls)
  ├─ MockLlmProvider (infra)     deterministic, credential-free — the default
  └─ AnthropicLlmProvider (infra) @anthropic-ai/sdk; selected when AI_PROVIDER=anthropic + key

PromptRegistry (domain)          versioned prompts as assets: atlas.chat.v1 (never hardcoded
                                 at call sites; built from parameterized templates — doc 22)

AiGateway (application)          the single entry point: builds context, renders the prompt,
                                 runs the tool loop against the provider, validates the
                                 response (guardrails), records observability (model, tokens,
                                 latency, tool calls) + an audit event. No client calls a
                                 provider directly (doc 22 "AI Gateway").

Tools (application)              the AI's only way to act. Each is a typed, validated function
                                 backed by an EXISTING use case — never raw DB access:
                                   • search_exercises → ExercisesModule (catalogue, read)
                                   • create_workout   → WorkoutsModule (real Workout aggregate)
                                 The model interprets; the tool owns the data (doc 22 ADR-002).
```

Key rules, each grounded in the Blueprint:

- **Provider-agnostic, gateway-mediated** (ADR-0002, doc 22): the domain depends
  only on `LlmProvider`; `@anthropic-ai/sdk` is imported **only** inside the
  Anthropic adapter (Infrastructure). `AI_PROVIDER` (`mock` | `anthropic`)
  selects the adapter; `mock` is the default so the app runs with no key. Model
  **tiers** are config (`AI_DEFAULT_MODEL`), not code branches.
- **Mock is a first-class adapter, not a stub**: it produces deterministic,
  schema-valid responses and exercises the **same tool loop** — so chat and
  workout generation work end-to-end (creating a real workout from the catalogue)
  without a provider. Swapping to Anthropic is a config change, zero code.
- **Tools before hallucination** (doc 22 ADR-002, "Tool Calling"): the AI builds
  a workout by calling `search_exercises` (real catalogue) then `create_workout`
  (the real Workouts use case, which validates and persists). The AI never
  fabricates exercises or writes to the DB; tool inputs are validated before
  execution (doc 22 "Tool Calling sem validação" is an anti-pattern).
- **AI never owns business rules** (doc 22 Filosofia): all mutations flow through
  existing domain use cases; the domain remains the source of truth.
- **Prompts are versioned assets** (doc 22 ADR-003 "Prompt Registry"): prompts
  live in a registry keyed `atlas.chat.v1`, built from parameterized templates —
  no string concatenation at call sites, no hardcoded prompts.
- **Context engineering first** (doc 22 ADR-001): the gateway assembles context
  (the user, available tools, the catalogue's muscle/equipment vocabulary, date)
  before generation — grounding responses.
- **Guardrails & validation** (doc 22 "AI Guardrails", "Response Validation"):
  the gateway validates every response (shape, allowed tools, tool-input
  schemas); a malformed tool call is rejected, not executed. The domain is
  scoped to fitness (the system prompt + tool surface bound it).
- **Observability & audit** (doc 22 "AI Observability", doc 21): each
  interaction logs model, prompt id+version, token usage, latency, and tool
  calls, and emits an audit event (`ai.chat`) on the audit channel. Cost is
  derivable from token usage.
- **Privacy & security** (doc 22, doc 16): the AI sees only the authenticated
  user's data; the API key is config-only, never in code or logs (existing pino
  redaction); the conversation is short-term memory (per request), no
  cross-user leakage.

## Alternatives considered

1. **Gateway + provider port + mock/Anthropic adapters + tool calling (chosen).**
   Matches doc 22 exactly; runnable without a key; provider-swappable.
2. **Call the Anthropic SDK directly from a use case.** Rejected: couples the
   domain to a vendor (violates ADR-0002/doc 22 Provider Independence), no
   gateway, no mock path, hard to test.
3. **Let the AI return workout JSON for the app to save (no tools).** Rejected:
   the model would fabricate exercises not in the catalogue and the app would
   trust unvalidated output — exactly the "Tools Before Hallucination" and
   "grounded responses" anti-patterns (doc 22).

## Consequences

**Gained:** a runnable, testable Atlas AI today (mock), upgradable to real Claude
by setting `AI_PROVIDER=anthropic` + `AI_ANTHROPIC_API_KEY`; workouts generated
from real catalogue data and persisted through the real domain; full provider
portability; observability and audit from day one.

**Lost / cost:** the mock's "intelligence" is canned (good enough to demo the
flow and pass tests, not to converse freely) — real conversation needs the
Anthropic adapter and a key. Streaming, RAG over a knowledge base, long-term
memory, prompt-eval harness, rate limiting per user, and circuit breakers are
**deferred and tracked** (doc 22 lists these; they are not blockers for the first
slice).

## Trade-offs

We accept a narrow `LlmProvider` port (no vendor-only features at the boundary)
and a canned mock in exchange for the portability and runnability the Blueprint
requires (doc 22 Provider Independence, doc 24 "o domínio vem primeiro"). Tool
calling — rather than free-form JSON — costs an extra round trip but buys grounded,
validated, domain-owned results, which doc 22 mandates.

## References

- Blueprint `22 - AI Engineering` (AI Gateway, Context/Prompt/Tool engines, Prompt Registry, Guardrails, Provider Independence, Observability, ADR-001/002/003/004)
- Blueprint `10 - Atlas AI`
- ADR-0002 — LLM Provider Strategy
- ADR-0003 — Workouts Domain Model · ADR-0004 — Exercises Domain Model
