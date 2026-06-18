# 14 - API.md

# API Architecture

> "Uma API não conecta sistemas. Ela estabelece contratos entre domínios independentes."

---

# Objetivo

Este documento define os princípios arquiteturais da API do ATLAS.

Seu propósito é garantir consistência, previsibilidade, compatibilidade, observabilidade e evolução contínua da camada de comunicação entre clientes e serviços.

Toda API exposta pelo ATLAS deverá seguir estas diretrizes.

---

# Escopo

Este documento cobre:

- Design de APIs
- Contratos
- Versionamento
- Compatibilidade
- HTTP Semantics
- Error Handling
- Idempotência
- Paginação
- Filtros
- Observabilidade
- Rate Limiting
- Governança

---

# Não Escopo

Este documento não define:

- Framework HTTP
- Biblioteca de Rotas
- Implementação dos Controllers
- Gateway específico
- Reverse Proxy

---

# Filosofia

A API é um contrato público.

Ela não pertence ao Frontend.

Ela não pertence ao Mobile.

Ela pertence ao domínio.

Clientes são consumidores.

Nunca proprietários.

---

# API First

Toda alteração começa pelo contrato.

Fluxo obrigatório:

Business Requirement

↓

API Contract

↓

Review

↓

Implementação

↓

Testes

↓

Deploy

A implementação nunca antecede o contrato.

---

# Contract First

Toda interface pública deverá possuir especificação formal.

Preferencialmente utilizando OpenAPI.

A documentação é a fonte da verdade.

Nunca o código.

---

# Resource-Oriented Design

A API representa recursos.

Não ações.

Exemplo:

Correto

/users

/workouts

/exercises

/missions

Incorreto

/createWorkout

/updateWeight

/deleteExercise

---

# HTTP Semantics

Os verbos HTTP devem refletir a intenção da operação.

GET

Operação segura.

Nunca altera estado.

---

POST

Criação.

Ou comandos não idempotentes.

---

PUT

Substituição completa.

Idempotente.

---

PATCH

Atualização parcial.

---

DELETE

Remoção lógica ou física conforme regra do domínio.

---

# Idempotência

Operações críticas deverão suportar repetição segura.

Utilizar Idempotency-Key quando necessário.

Especialmente para:

- criação de recursos;
- pagamentos futuros;
- integrações;
- processamento assíncrono.

---

# Versionamento

Toda quebra de contrato exige nova versão.

Mudanças compatíveis não alteram versão principal.

Estratégia:

v1

↓

v2

↓

v3

Versionamento deve ocorrer apenas quando inevitável.

---

# Backward Compatibility

Sempre que possível.

Mudanças devem ser compatíveis.

É permitido:

Adicionar campos opcionais.

Adicionar endpoints.

Adicionar filtros.

Não é permitido:

Remover campos.

Alterar significado.

Alterar tipos.

Quebrar consumidores existentes.

---

# API Deprecation Policy

Endpoints obsoletos passam por quatro fases.

Stage 1

Supported

↓

Stage 2

Deprecated

↓

Stage 3

Sunset

↓

Stage 4

Removed

Toda descontinuação deverá possuir comunicação antecipada.

---

# Payload Design

Payloads devem ser:

Pequenos.

Explícitos.

Previsíveis.

Consistentes.

Nunca retornar informações desnecessárias.

---

# Naming

Regras:

camelCase para propriedades JSON.

Plural para coleções.

/users

/workouts

/exercises

Nomes devem representar conceitos do domínio.

Nunca detalhes técnicos.

---

# Error Handling

Toda falha deverá seguir RFC 7807 (Problem Details for HTTP APIs).

Estrutura mínima:

- type
- title
- status
- detail
- instance
- traceId

Erros devem ser previsíveis.

---

# Error Taxonomy

Categorias:

Validation Error

Authentication Error

Authorization Error

Business Rule Error

Conflict Error

Resource Not Found

Infrastructure Error

Unexpected Error

Cada categoria possui tratamento específico.

---

# Status Codes

Utilizar apenas códigos coerentes.

200 OK

201 Created

202 Accepted

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

412 Precondition Failed

422 Unprocessable Entity

429 Too Many Requests

500 Internal Server Error

Nunca utilizar 200 para representar erro.

---

# Pagination

Grandes coleções deverão utilizar Cursor Pagination.

Estrutura:

items

nextCursor

previousCursor

hasNext

Evitar Offset Pagination em grandes volumes.

---

# Filtering

Filtros devem ser declarativos.

Exemplo:

status

createdAfter

createdBefore

goal

search

Filtros devem ser combináveis.

---

# Sorting

Ordenações explícitas.

Exemplo:

sort=name

sort=-createdAt

Nunca depender da ordem natural do banco.

---

# Field Selection

Clientes poderão solicitar apenas os campos necessários.

Exemplo conceitual:

fields=id,name,goal

Reduz payload.

Melhora performance.

---

# Rate Limiting

Toda API pública deverá possuir limites.

Objetivos:

Proteger infraestrutura.

Evitar abuso.

Garantir disponibilidade.

---

# Caching

GET poderá utilizar:

ETag

If-None-Match

Cache-Control

Conditional Requests

Sempre que fizer sentido.

---

# Compression

Payloads deverão ser comprimidos quando apropriado.

Reduz latência.

Melhora experiência.

---

# Correlation ID

Toda requisição recebe um Correlation ID.

Objetivos:

Tracing

Debugging

Observabilidade

Auditoria

---

# Traceability

Toda requisição deverá ser rastreável.

Fluxo:

Client

↓

Gateway

↓

API

↓

Application

↓

Database

↓

Logs

↓

Metrics

↓

Tracing

---

# Observabilidade

Toda API deverá produzir:

Structured Logs

Metrics

Distributed Tracing

Health Checks

Readiness

Liveness

---

# Timeouts

Toda comunicação externa deverá possuir timeout explícito.

Nunca depender do timeout padrão da linguagem.

---

# Retry Policy

Retries somente quando seguros.

Nunca repetir automaticamente operações não idempotentes.

Utilizar:

Exponential Backoff

Jitter

Circuit Breaker

quando aplicável.

---

# Security

Toda API deverá seguir as diretrizes do documento:

15 - Authentication.md

16 - Security.md

Nenhuma regra de segurança poderá ser implementada de forma ad-hoc.

---

# Anti-patterns

É proibido:

❌ Versionar por endpoint quando desnecessário

❌ Utilizar verbo na URL

❌ Retornar stack trace

❌ Expor exceções internas

❌ Payloads gigantes

❌ Endpoint fazendo múltiplas responsabilidades

❌ Quebrar compatibilidade silenciosamente

❌ Utilizar HTTP 200 para erro

❌ Alterar contrato sem documentação

---

# ADR-001

## Contract First

### Decisão

Toda API será especificada antes da implementação.

### Justificativa

Reduz retrabalho.

Facilita integração.

Melhora documentação.

---

# ADR-002

## Cursor Pagination

### Decisão

Coleções utilizarão Cursor Pagination.

### Justificativa

Performance previsível.

Escalabilidade.

Consistência.

---

# ADR-003

## RFC 7807

### Decisão

Todos os erros seguirão Problem Details.

### Justificativa

Padronização.

Observabilidade.

Experiência consistente.

---

# ADR-004

## Backward Compatibility

### Decisão

Toda alteração deverá preservar consumidores existentes sempre que possível.

### Justificativa

Redução de impacto.

Evolução contínua.

Confiabilidade.

---

# Métricas

Objetivos mínimos:

99,9% de disponibilidade

P95 < 250ms

P99 < 500ms

Erro 5xx < 0,1%

100% das APIs documentadas

100% dos endpoints rastreáveis

100% dos erros padronizados

0 breaking changes sem versionamento

---

# Checklist

Antes de publicar qualquer endpoint verificar:

□ O contrato foi aprovado?

□ Existe documentação OpenAPI?

□ O endpoint respeita HTTP Semantics?

□ O payload é mínimo?

□ Há suporte à observabilidade?

□ O endpoint é idempotente quando necessário?

□ O erro segue RFC 7807?

□ Existe política de versionamento?

□ Há testes de contrato?

□ A alteração mantém backward compatibility?

---

# Referências Internas

12 - Backend Architecture.md

13 - Database.md

15 - Authentication.md

16 - Security.md

17 - Performance.md

18 - Testing.md

19 - DevOps.md

---

# Princípio Final

A API do ATLAS deve evoluir continuamente sem surpreender seus consumidores.

Cada contrato representa um compromisso de longo prazo entre o domínio e seus clientes.

Implementações podem mudar.

Infraestruturas podem ser substituídas.

Frameworks podem desaparecer.

O contrato permanece.