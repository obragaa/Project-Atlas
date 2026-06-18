# 21 - Observability.md

# Observability Engineering Standard

> "Você não pode operar um sistema que não consegue observar."

---

# Objetivo

Este documento estabelece a arquitetura de Observabilidade do Projeto Atlas.

Seu objetivo é garantir que todo componente do sistema produza informações suficientes para compreender seu comportamento, diagnosticar falhas, medir desempenho e apoiar decisões operacionais baseadas em dados.

A observabilidade é um requisito arquitetural obrigatório.

---

# Escopo

Este documento cobre:

- Telemetria
- Logs
- Métricas
- Tracing Distribuído
- Dashboards
- Alertas
- SLI
- SLO
- Error Budget
- Incident Response
- Runbooks
- Health Checks

---

# Não Escopo

Este documento não cobre:

- Performance Budget
- Segurança
- Infraestrutura Física
- Testes

Esses tópicos possuem documentos próprios.

---

# Filosofia

Toda funcionalidade deve ser observável.

Se um comportamento não pode ser medido, ele não pode ser operado.

A ausência de telemetria é considerada um defeito arquitetural.

---

# Observability Pillars

Toda aplicação deverá produzir três sinais fundamentais.

```text
Logs

↓

Metrics

↓

Distributed Traces
```

Esses sinais se complementam.

Nenhum substitui o outro.

---

# Fourth Pillar

Além dos três pilares tradicionais.

O Atlas adota um quarto pilar.

```text
Events
```

Eventos representam acontecimentos relevantes do domínio.

Exemplos:

WorkoutCompleted

MissionCompleted

GoalAchieved

SubscriptionCreated

AIConversationStarted

---

# Telemetry Architecture

```text
Application

↓

Telemetry SDK

↓

Collector

↓

Storage

↓

Dashboards

↓

Alerts

↓

Engineers
```

Toda telemetria deve seguir fluxo padronizado.

---

# Structured Logging

Todos os logs devem ser estruturados.

Nunca texto livre.

Campos obrigatórios:

Timestamp

Level

Service

Environment

RequestId

CorrelationId

TraceId

UserId (quando permitido)

Message

Context

Duration

Outcome

---

# Log Levels

Permitidos:

TRACE

DEBUG

INFO

WARN

ERROR

FATAL

Cada nível possui finalidade específica.

Nunca utilizar ERROR para eventos esperados.

---

# Correlation IDs

Toda requisição recebe um Correlation ID.

Ele deve acompanhar todo o fluxo.

Exemplo:

```text
Gateway

↓

API

↓

Application

↓

Worker

↓

Database

↓

External APIs
```

O mesmo identificador deve existir em todos os logs relacionados.

---

# Distributed Tracing

Toda comunicação distribuída deverá gerar traces.

Cada trace contém:

Trace ID

Span ID

Parent Span

Duration

Status

Metadata

Objetivo:

Reconstruir o caminho completo da requisição.

---

# Metrics

Toda aplicação deverá produzir métricas de:

Latência

↓

Throughput

↓

Erros

↓

Disponibilidade

↓

Uso de Recursos

↓

Filas

↓

Cache

↓

Banco de Dados

↓

Integrações

---

# RED Method

Toda API deverá monitorar:

Rate

Errors

Duration

---

# USE Method

Toda infraestrutura deverá monitorar:

Utilization

Saturation

Errors

---

# Golden Signals

Toda operação crítica deverá possuir:

Latency

Traffic

Errors

Saturation

---

# Business Metrics

Além das métricas técnicas.

O Atlas deverá produzir métricas de negócio.

Exemplos:

Usuários ativos

Treinos concluídos

Missões completadas

Tempo médio por treino

Conversas com IA

Conversão Premium

Retenção

Engajamento

---

# SLIs

Indicadores obrigatórios:

Disponibilidade

Latência

Erro

Throughput

Tempo de resposta da IA

Tempo de autenticação

Tempo de geração de treino

---

# SLOs

Disponibilidade

≥ 99.9%

Latência P95

≤ 250ms

Erro

≤ 0.1%

Tempo IA

≤ 3 segundos

---

# Dashboards

Todo domínio deverá possuir dashboards próprios.

Exemplos:

Authentication

AI

Workouts

Missions

Infrastructure

Payments

Database

API

Frontend

Cada dashboard deve responder perguntas específicas.

---

# Alerting

Alertas devem seguir princípios:

Acionáveis

↓

Contextualizados

↓

Priorizados

↓

Sem ruído

↓

Com documentação

Nenhum alerta sem ação definida.

---

# Alert Severity

Categorias:

P1

Serviço indisponível.

P2

Funcionalidade crítica degradada.

P3

Problema moderado.

P4

Informativo.

---

# Runbooks

Todo alerta deverá possuir Runbook.

Cada Runbook deve responder:

O que aconteceu?

Como confirmar?

Como mitigar?

Como recuperar?

Como escalar?

---

# Health Checks

Todo serviço deverá expor:

Liveness

Readiness

Startup

Health Checks nunca validam regra de negócio.

---

# Synthetic Monitoring

Fluxos críticos deverão ser executados automaticamente.

Exemplos:

Login

Cadastro

Treino

Chat IA

Objetivo:

Detectar falhas antes dos usuários.

---

# Real User Monitoring (RUM)

A experiência do usuário deverá ser medida.

Indicadores:

LCP

CLS

INP

TTFB

Erros JavaScript

Tempo de carregamento

---

# Error Tracking

Toda exceção deve possuir:

Stack Trace

Contexto

Versão

Ambiente

Release

Correlation ID

Trace ID

Nunca apenas uma mensagem.

---

# Incident Timeline

Todo incidente deverá produzir cronologia.

Detection

↓

Alert

↓

Acknowledgement

↓

Mitigation

↓

Recovery

↓

Root Cause Analysis

↓

Post-Mortem

---

# Post-Mortem

Todo incidente relevante deve gerar documento contendo:

Resumo

Impacto

Linha do tempo

Causa raiz

Fatores contribuintes

Ações corretivas

Ações preventivas

Responsáveis

---

# Cardinality

Labels de métricas devem possuir baixa cardinalidade.

Evitar explosão de séries temporais.

---

# Sampling

Tracing poderá utilizar sampling inteligente.

Nunca perder traces críticos.

---

# Data Retention

Cada tipo de telemetria possui política própria.

Logs

↓

Metrics

↓

Traces

↓

Audit Events

↓

Business Events

Cada categoria possui tempo de retenção definido.

---

# Anti-patterns

É proibido:

❌ Logs em texto livre

❌ Logs sem contexto

❌ Métricas sem owner

❌ Alertas sem Runbook

❌ Dashboards sem propósito

❌ Traces incompletos

❌ Alert fatigue

❌ Health Checks complexos

❌ Exceções silenciosas

❌ Logs contendo secrets

---

# ADR-001

## OpenTelemetry First

### Decisão

Toda telemetria seguirá padrões abertos.

### Justificativa

Portabilidade.

Padronização.

Vendor Neutral.

---

# ADR-002

## Structured Logs

### Decisão

Todos os logs serão estruturados.

### Justificativa

Busca eficiente.

Automação.

Correlação.

---

# ADR-003

## Three Pillars + Events

### Decisão

Observabilidade baseada em:

Logs

Metrics

Traces

Business Events

### Justificativa

Maior capacidade investigativa.

---

# ADR-004

## Runbooks Obrigatórios

### Decisão

Nenhum alerta existe sem documentação operacional.

### Justificativa

Redução do MTTR.

Maior autonomia operacional.

---

# Métricas

100% dos serviços monitorados

100% dos endpoints com métricas

100% dos erros rastreáveis

100% dos alertas documentados

100% dos dashboards versionados

100% dos incidentes com Post-Mortem

MTTR < 30 minutos

Alertas sem owner = 0

---

# Observability Gates

Nenhuma funcionalidade poderá ser implantada caso:

□ não produza logs estruturados;

□ não exponha métricas;

□ não gere traces;

□ não possua Correlation ID;

□ não esteja presente em dashboards;

□ não possua monitoramento.

---

# Checklist

□ Logs estruturados?

□ Métricas disponíveis?

□ Tracing implementado?

□ Dashboard atualizado?

□ Alertas configurados?

□ Runbook criado?

□ SLI definido?

□ SLO definido?

□ Error Budget atualizado?

□ Business Metrics monitoradas?

---

# Referências

Google Site Reliability Engineering

Google SRE Workbook

OpenTelemetry Specification

OpenMetrics

Prometheus Best Practices

Grafana Engineering

Honeycomb Observability

The Four Golden Signals

The RED Method

The USE Method

---

# Princípio Final

O Projeto Atlas deve ser observável por definição.

Toda decisão arquitetural deve considerar não apenas como o sistema será construído, mas como será compreendido, operado e evoluído em produção.

Um sistema que não pode ser observado não pode ser confiavelmente mantido.

A observabilidade é parte integrante da arquitetura, não um recurso adicional.