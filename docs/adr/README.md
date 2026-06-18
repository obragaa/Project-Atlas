# Architecture Decision Records

This directory holds the ADRs for the Atlas platform, as required by
`blueprint/23 - Engineering Governance.md` (ADR-002 "ADR Mandatory").

Every structural decision gets an ADR. ADRs are immutable once accepted; they
are superseded, never edited away. The Blueprint remains the source of truth and
outranks any ADR; an ADR records _how_ we realize the Blueprint, never a
deviation from it.

| ID                                      | Title                 | Status   |
| --------------------------------------- | --------------------- | -------- |
| [0001](./0001-technology-stack.md)      | Technology Stack      | Accepted |
| [0002](./0002-llm-provider-strategy.md) | LLM Provider Strategy | Accepted |
| [0003](./0003-workouts-domain.md)       | Workouts Domain Model | Accepted |

## Template

Each ADR contains: Title, Status, Date, Author, Context, Problem, Alternatives
considered, Decision, Consequences, Trade-offs, Migration plan (when needed),
References. Allowed statuses: Proposed, Accepted, Superseded, Deprecated,
Rejected, Archived.
