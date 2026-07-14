# SPEC — Sessão de Treino Realizada (WorkoutSession)

> Especificação gerada via spec-driven-development em 2026-07-14.
> Fundamentada no Blueprint (fonte da verdade). **Não** é implementação — é o
> contrato a ser aprovado antes de qualquer código.

---

## 0. Contexto e problema

A auditoria de backend (jul/2026) revelou que o Atlas modela **template de treino**,
não **treino realizado**. O que existe hoje:

- `Workout` (`apps/api/src/modules/workouts/domain/workout.ts`) é um plano editável
  com `items`/`sets` **planejados**.
- `POST /workouts/:id/completion` → `complete()` (`workout.ts:74-82`) apenas muda
  `status` para `completed` e grava `completedAt`. **Não captura nada do que foi
  executado** (reps reais, carga real, data escolhida).
- Um treino `completed` fica **congelado** (`workout.ts:61-66` lança 409 em edição),
  então repetir uma rotina obriga a *duplicar* → lixo de templates.
- `WorkoutCompleted` (`domain/events.ts`) carrega só `aggregateId` + `userId`; a
  gamificação (`record-activity.use-case.ts:34`) conta **dias distintos**, não
  treinos — o achievement "10 treinos" mente.

O Blueprint **já prevê** o que falta:
- **07 - Features.md:112-116** — "Registrar séries / repetições / carga /
  observações" e **"Histórico de treinos"** (feature listada, não implementada).
- **02 - Product Rules.md:92-98** — "Menos cliques: existe uma forma mais simples?"
- **02:80,84** — frequência de treino e histórico como contexto de personalização.

---

## 1. Objetivo

Introduzir o agregado **`WorkoutSession`**: o registro de um treino *efetivamente
realizado*, com os dados reais de execução, alimentando **histórico**, **progresso**
e **gamificação**.

**Usuário-alvo:** o praticante que, ao terminar (ou durante) o treino do dia, quer
registrar o que fez — com o mínimo de fricção — e ver isso refletido na sua evolução.

**Resultado esperado (definição de pronto do épico):**
1. Um clique em "Treinar agora" a partir de um template cria uma sessão
   pré-preenchida com os exercícios/séries planejados; o usuário só ajusta os
   valores reais e salva.
2. A **data da sessão é hoje por padrão** (o usuário nunca é obrigado a digitá-la;
   pode alterá-la para registrar um treino passado).
3. O **template nunca congela** — pode ser treinado quantas vezes quiser; cada
   execução gera uma sessão nova no histórico.
4. Streak, missões e achievements passam a contar **sessões realizadas** (com data
   e volume reais), corrigindo o bug "10 treinos = 10 dias".

### Decisões de produto (confirmadas pelo dono, 2026-07-14)
- **Início da sessão:** um clique a partir do template, **pré-preenchido**.
- **Dados por série capturados:** reps reais, carga real, **check** (série
  concluída/pulada), **observação** por série, **RPE** (esforço percebido 1–10).
- **Template ↔ sessão:** template **reutilizável para sempre**; remove-se o
  `completed` terminal do template.
- **Gamificação:** **cada sessão realizada conta** (não dias distintos).

---

## 2. Escopo

### Dentro do escopo (Fase A — Backend)
- Novo agregado `WorkoutSession` no módulo `workouts` (mesmo módulo, é o mesmo
  bounded context de treino — blueprint/12).
- Entidades filhas: `SessionExercise` (exercício executado) → `PerformedSet`
  (série executada, com reps/carga/check/RPE/observação reais).
- Contrato em `@atlas/contracts` (contract-first — blueprint/14): views, requests,
  tipos de sessão.
- Endpoints REST versionados (`/v1`).
- Migração de schema (blueprint/13): tabelas `workout_sessions`,
  `session_exercises`, `performed_sets`.
- Novo evento de domínio `WorkoutSessionCompleted` (com data e volume) e ligação
  à gamificação; correção da contagem por sessão.
- Remoção do `completed` terminal do template `Workout` (torná-lo reutilizável).
- Testes de domínio + integração para todo o novo caminho.

### Fora do escopo (fases seguintes, não neste spec)
- **Frontend** (será um spec/entrega própria após o backend — o dono priorizou
  backend agora, mas o front consumirá este contrato).
- Pesquisa/ingestão de novas **bibliotecas de exercícios** (trilha separada).
- Campo de mídia por exercício (lacuna registrada, não deste épico).
- Timezone do usuário (bug de UTC registrado; corrigir aqui *apenas* se barato,
  senão vira item próprio).

---

## 3. Modelo de domínio (blueprint/12, 13)

### Agregado `WorkoutSession` (novo aggregate root)
| Campo | Tipo | Regra |
|---|---|---|
| `id` | `WorkoutSessionId` (opaque, doc 13) | gerado |
| `userId` | string | dono; ownership enforced nos use-cases |
| `sourceWorkoutId` | `WorkoutId \| null` | template de origem (null = sessão avulsa, fase futura) |
| `title` | `WorkoutName` (VO reusado) | nome no momento da execução (snapshot do template) |
| `performedOn` | `SessionDate` (novo VO) | **default = hoje**; aceita data passada; nunca futura |
| `status` | `in_progress \| completed` | sessão viva vs. finalizada |
| `exercises` | `SessionExercise[]` | ordenados; consistência pelo root |
| `notes` | string \| null (≤280) | observação geral da sessão |
| `createdAt` / `completedAt` | Date / Date\|null | |

### Entidade `SessionExercise`
`exerciseName` (snapshot, 1–120), `order`, `sets: PerformedSet[]`.

### Entidade `PerformedSet`
| Campo | Regra |
|---|---|
| `reps` | int 1–1000 (reusa validação de `ExerciseSet`) |
| `load` | `Load \| null` (VO reusado; null = peso corporal) |
| `completed` | boolean (check — série feita/pulada) |
| `rpe` | int 1–10 \| null (novo VO `Rpe`) |
| `notes` | string \| null ≤280 |

### Comportamentos do root
- `WorkoutSession.startFromTemplate(workout, today)` — cria sessão `in_progress`
  copiando itens/séries do template como valores **planejados** (que o usuário
  ajusta). `performedOn = today`.
- `updateExecution(...)` — substitui exercícios/séries com os valores reais (PUT).
- `complete()` — valida (≥1 série concluída), marca `completed`, emite
  `WorkoutSessionCompleted { userId, performedOn, totalVolume }`.
- Ownership: `isOwnedBy(userId)`.

### Mudança no agregado `Workout` (template)
- Remover o estado terminal `completed` e o guard de 409 em `replaceContent`
  (`workout.ts:61-66`). O template passa a ter só `draft`/`active`.
- Deprecar `complete()` e o endpoint `POST /:id/completion` (ver §7 — migração).

---

## 4. API (blueprint/14 — contract-first, RFC 7807, cursor)

Novos endpoints, todos sob `JwtAuthGuard`, ownership nos use-cases:

| Método | Rota | Ação |
|---|---|---|
| `POST` | `/v1/workouts/:id/sessions` | "Treinar agora": cria sessão `in_progress` pré-preenchida do template `:id`. Body opcional: `{ performedOn? }` (default hoje). → 201 `WorkoutSessionView` |
| `GET` | `/v1/sessions` | Histórico do usuário (cursor pagination). → `CursorPage<WorkoutSessionSummaryView>` |
| `GET` | `/v1/sessions/:sid` | Detalhe de uma sessão. → `WorkoutSessionView` |
| `PUT` | `/v1/sessions/:sid` | Salvar valores reais (exercícios/séries executados). → `WorkoutSessionView` |
| `POST` | `/v1/sessions/:sid/completion` | Finalizar a sessão (emite evento, alimenta gamificação). → `WorkoutSessionView` |
| `DELETE` | `/v1/sessions/:sid` | Remover uma sessão do histórico. → 204 |

Nota REST: mantém-se `/completion` como já existe no projeto (consistência interna
> pureza REST). Sessão é sub-recurso de nível superior (`/sessions`) porque tem
ciclo de vida próprio e é consultável independentemente do template.

---

## 5. Persistência (blueprint/13)

Migração aditiva em `apps/api/src/shared/database/schema/`:
- `workout_sessions` (id, user_id, source_workout_id FK nullable, title,
  performed_on DATE, status, notes, created_at, completed_at). Índice
  `(user_id, performed_on desc)` para histórico + keyset cursor.
- `session_exercises` (id, session_id FK cascade, name, position).
- `performed_sets` (id, session_exercise_id FK cascade, reps, load_weight,
  load_unit, completed bool, rpe smallint null, notes).
- Nenhuma alteração destrutiva nas tabelas de `workouts` (template preservado).

---

## 6. Gamificação (blueprint/09)

- Handler passa a ouvir `WorkoutSessionCompleted` (além de manter
  `MeasurementRecorded`). `WorkoutCompleted` do template é aposentado.
- **Contagem por sessão:** o `activity` de treino passa a ser append **por sessão**
  (id da sessão como chave de idempotência), não por dia — corrige
  `record-activity.use-case.ts:34` e `postgres-activity.repository.ts:22-25`. O
  achievement "N treinos" volta a significar N treinos.
- Volume real (`totalVolume` no evento) fica disponível para futuras conquistas de
  carga/progressão (não obrigatório nesta fase, mas o dado passa a existir).

---

## 7. Estratégia de migração / compatibilidade (blueprint/23)

1. Introduzir sessão como caminho novo; **não** quebrar o template.
2. `POST /:id/completion` (template) → **deprecado**: passa a redirecionar
   conceitualmente para "criar sessão"; remове-se o congelamento. Documentar no
   contrato como deprecated por 1 ciclo, depois remover.
3. ADR novo (`docs/adr/ADR-000X-workout-session.md`) registrando a separação
   template × sessão e o motivo (doc 23: decisões são registradas).
4. Atualizar os docs do Blueprint tocados: **07** (marcar histórico/registro como
   implementados), **13** (novas entidades), **09** (contagem por sessão), **12**
   se necessário. Docs evoluem com o código (doc 23).

---

## 8. Estilo de código (herdado, sem novidade)

- TypeScript `strict`; Domain layer sem framework/ORM/DB (doc 12).
- Value Objects validam no domínio; DTOs validam na borda (defesa em profundidade,
  doc 16). Reusar `Load`, `WorkoutName`; novos VOs `SessionDate`, `Rpe`.
- Erros de domínio → RFC 7807; correlação/observabilidade (docs 14, 21).
- Nomes e comentários no idioma e densidade do código existente do módulo.

---

## 9. Estratégia de testes (blueprint/18)

- **Domínio (unit):** `WorkoutSession` (startFromTemplate, updateExecution,
  complete com/sem séries, performedOn default/passado/futuro rejeitado),
  `PerformedSet` (reps, rpe 1–10, load null), `SessionDate`, `Rpe`. Espelha os
  `.spec.ts` já existentes (`workout.spec.ts`, `exercise-set` etc.).
- **Integração:** repositório Postgres (round-trip sessão→exercícios→séries),
  fluxo evento→gamificação (sessão conta como 1 treino; 2 sessões no mesmo dia
  contam 2), ownership (usuário A não acessa sessão de B → 404).
- **Contrato:** tipos de `@atlas/contracts` compilando ponta a ponta.
- Gate: `typecheck` + `lint` + `test` verdes antes de cada commit incremental.

---

## 10. Boundaries (o que sempre fazer / perguntar antes / nunca fazer)

**Sempre:**
- Consultar o Blueprint antes de cada sub-parte e atualizar o doc impactado no
  mesmo change (doc 23).
- Entregar incremental e testado (um agregado/rota por vez; commits pequenos).
- Manter o template funcionando durante toda a migração.

**Perguntar antes:**
- Qualquer mudança destrutiva de schema/dados existentes.
- Remover de fato o endpoint `/:id/completion` do template (só depois do ciclo de
  deprecação).
- Introduzir timezone do usuário (decidir se entra aqui ou vira item próprio).

**Nunca:**
- Colocar regra de negócio no controller (doc 12).
- Introduzir padrão paralelo ou duplicar regra do Blueprint (CLAUDE.md).
- Obrigar o usuário a digitar a data quando "hoje" é o default óbvio (doc 02).
- Commitar/push sem o dono pedir.

---

## 11. Ordem de implementação sugerida (para o /plan seguinte)

1. Contrato `@atlas/contracts` (tipos de sessão) — contract-first.
2. Value objects + entidades + agregado `WorkoutSession` (+ specs de domínio).
3. Migração de schema + repositório Postgres (+ spec de integração).
4. Use-cases + controller + DTOs (start, list, get, update, complete, delete).
5. Evento `WorkoutSessionCompleted` + ligação/correção na gamificação.
6. Aposentar congelamento do template + deprecar `/:id/completion`.
7. ADR + atualização dos docs do Blueprint (07, 09, 13).
8. (Fase B, spec próprio) Frontend consumindo o novo contrato.
