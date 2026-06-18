# ADR-0002 — LLM Provider Strategy

- **Status:** Accepted
- **Date:** 2026-06-18
- **Author:** Engineering (Atlas)
- **Related Blueprint docs:** `10 - Atlas AI`, `22 - AI Engineering`

---

## Context

Doc 22 mandates **Provider Independence** (ADR-004 "Provider Agnostic"): no model
is coupled directly to the system; all integration occurs through abstract
interfaces, and every model call passes through the **Atlas AI Gateway**
(authentication, rate limiting, routing, observability, audit, cost control).
Doc 22 also defines model routing across Fast / Balanced / Reasoning / Fallback
tiers.

## Problem

A default provider must exist behind the abstraction so the system is runnable,
without violating provider independence or leaking vendor specifics into the
domain or application layers.

## Alternatives considered

1. **Anthropic (Claude) as default.** The Blueprint references *Anthropic
   Constitutional AI* and the *Anthropic Prompt Engineering Guide* in doc 22,
   and lists Anthropic among the quality bar (doc 00 §13). Strong tool-calling
   and long-context support fit the Context-Engineering-first design.
2. **OpenAI as default.** Equally viable behind the abstraction.

## Decision

Define a provider-agnostic `LlmProvider` port in the AI module. Ship
**Anthropic (Claude)** as the default adapter, selected via configuration, never
imported outside the Infrastructure layer of the `ai` module. Model **tiers**
(fast / balanced / reasoning / fallback) are configuration, not code branches.

No prompt, tool, or business rule may depend on a concrete vendor. Swapping
providers must require only a new adapter + configuration change.

## Consequences

**Gained:** runnable AI subsystem from day one; alignment with cited references;
trivial provider swap.

**Lost / cost:** the abstraction must stay narrow enough to remain portable
(no leaking vendor-only features into the port).

## Trade-offs

We forgo provider-specific conveniences at the port boundary to preserve the
portability the Blueprint requires.

## References

- Blueprint `22 - AI Engineering` (ADR-004 Provider Agnostic, "AI Gateway", "Model Routing")
- Blueprint `10 - Atlas AI`
