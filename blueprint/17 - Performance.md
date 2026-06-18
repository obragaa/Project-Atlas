# 17 - Performance.md

# Performance Engineering Standard

> "Performance não é uma consequência da otimização. É uma propriedade arquitetural."

---

# Objetivo

Este documento estabelece os padrões de Performance Engineering do ATLAS.

Seu objetivo é definir requisitos funcionais e não funcionais relacionados à latência, throughput, escalabilidade, utilização de recursos, observabilidade e capacidade operacional.

Toda funcionalidade implementada deverá respeitar os limites estabelecidos neste documento.

---

# Escopo

Este documento cobre:

- Performance Budget
- Escalabilidade
- Caching
- Observabilidade
- SLI
- SLO
- Capacity Planning
- Benchmarking
- Profiling
- Concorrência
- Processamento Assíncrono

---

# Não Escopo

Não cobre:

- Infraestrutura Física
- Banco de Dados (Database.md)
- Segurança (Security.md)

---

# Filosofia

Performance não deve depender de hardware.

Ela deve surgir de decisões arquiteturais corretas.

Toda otimização deverá ser baseada em medições.

Nunca em percepção.

---

# Performance Principles

Todo componente deve buscar:

Low Latency

↓

High Throughput

↓

Predictable Performance

↓

Horizontal Scalability

↓

Resource Efficiency

↓

Graceful Degradation

---

# Performance Budget

## Frontend

Largest Contentful Paint (LCP)

≤ 2.5 s

Interaction to Next Paint (INP)

≤ 200 ms

Cumulative Layout Shift (CLS)

≤ 0.10

Time to First Byte (TTFB)

≤ 500 ms

Initial JavaScript (gzip)

≤ 250 KB

Critical CSS

≤ 50 KB

Web Fonts

≤ 2 famílias

Third-party Scripts

≤ 3

---

## Backend

P50

≤ 80 ms

P95

≤ 250 ms

P99

≤ 500 ms

Erro 5xx

< 0.1%

CPU Média

< 70%

Memória Média

< 75%

---

# Service Level Indicators (SLI)

Os seguintes indicadores deverão ser monitorados continuamente:

- Disponibilidade
- Latência
- Taxa de Erros
- Throughput
- Saturação
- Tempo de Recuperação

---

# Service Level Objectives (SLO)

Disponibilidade

≥ 99.9%

Latência P95

≤ 250 ms

Latência P99

≤ 500 ms

Erro de Requisições

< 0.1%

Deploy com sucesso

≥ 99%

Tempo médio de recuperação (MTTR)

< 30 minutos

---

# Error Budget

Error Budget Mensal

0.1%

Caso o orçamento seja excedido:

- novas features poderão ser suspensas;
- foco passa para estabilidade;
- incidentes tornam-se prioridade máxima.

---

# Caching Strategy

A estratégia de cache deverá seguir múltiplas camadas.

Client Cache

↓

Edge Cache (CDN)

↓

Application Cache

↓

Database Cache

↓

Persistent Storage

Cada camada possui responsabilidade própria.

---

# Cache Principles

Cache nunca é fonte da verdade.

Cache deve ser descartável.

Toda entrada deve possuir política explícita de invalidação.

---

# Async Processing

Operações demoradas devem ser assíncronas.

Exemplos:

- envio de e-mails;
- geração de relatórios;
- processamento de IA;
- notificações;
- importações.

O usuário não deve aguardar tarefas longas.

---

# Backpressure

Todo serviço deverá ser capaz de reduzir carga quando necessário.

Estratégias permitidas:

- filas;
- limitação de concorrência;
- rate limiting;
- circuit breakers.

---

# Circuit Breaker

Integrações externas devem prever falhas.

Estados:

Closed

↓

Open

↓

Half Open

Objetivo:

Evitar falhas em cascata.

---

# Bulkhead Pattern

Recursos críticos devem permanecer isolados.

A falha de um serviço não deve comprometer outros domínios.

---

# Connection Pooling

Toda comunicação persistente deverá utilizar pool de conexões quando aplicável.

Objetivos:

- reduzir overhead;
- diminuir latência;
- melhorar throughput.

---

# Lazy Loading

Carregar apenas recursos necessários.

Aplicável para:

- módulos;
- imagens;
- componentes;
- dados;
- rotas.

---

# Prefetching

Recursos previsíveis poderão ser pré-carregados.

Sempre baseado em comportamento do usuário.

Nunca de forma indiscriminada.

---

# Streaming

Sempre que aplicável.

Grandes respostas deverão ser transmitidas progressivamente.

Evitar bloquear o usuário aguardando processamento completo.

---

# Compression

Compressão obrigatória para payloads relevantes.

Preferir algoritmos modernos.

Nunca comprimir conteúdo já comprimido.

---

# Database Performance

Toda consulta crítica deverá possuir:

- plano de execução analisado;
- índices documentados;
- custo conhecido.

N+1 Queries são proibidas.

---

# Memory Management

Evitar:

- retenção desnecessária;
- objetos gigantes;
- cópias redundantes;
- vazamentos.

Toda utilização excessiva deve ser monitorada.

---

# Concurrency

Operações paralelas devem possuir:

- sincronização adequada;
- isolamento;
- idempotência;
- proteção contra race conditions.

---

# Scalability

Arquitetura preparada para:

Scale Up

↓

Scale Out

↓

Stateless Services

↓

Workers

↓

Queues

↓

Read Replicas

↓

Sharding futuro

Sem alterações profundas na aplicação.

---

# Capacity Planning

Todo serviço deverá possuir capacidade estimada.

Métricas mínimas:

Requests/s

Concurrent Users

Peak Load

CPU

RAM

Storage

Network

---

# Benchmarking

Toda funcionalidade crítica deverá possuir benchmark reproduzível.

Medições devem ser automatizadas sempre que possível.

---

# Profiling

Problemas de performance deverão ser investigados com profiling.

Nunca por tentativa e erro.

---

# Observabilidade

Performance deve ser medida através de:

Metrics

↓

Logs

↓

Distributed Tracing

↓

Dashboards

↓

Alertas

Toda decisão deve ser orientada por dados.

---

# Performance Anti-patterns

É proibido:

❌ N+1 Queries

❌ SELECT *

❌ Cache sem invalidação

❌ Processamento síncrono desnecessário

❌ Loops com chamadas externas

❌ Carregamento antecipado excessivo

❌ Overfetching

❌ Underfetching

❌ Polling agressivo

❌ Bloqueio de Thread Principal

❌ Dependências lentas em cadeia

❌ Premature Optimization

---

# ADR-001

## Performance Budget

### Decisão

Toda funcionalidade nasce com orçamento de performance.

### Justificativa

Evita degradação progressiva.

---

# ADR-002

## Cache Multicamadas

### Decisão

Cache distribuído em níveis independentes.

### Justificativa

Maior previsibilidade.

Menor latência.

---

# ADR-003

## Async First

### Decisão

Operações longas serão assíncronas.

### Justificativa

Melhor experiência.

Maior throughput.

---

# ADR-004

## Observability Driven Performance

### Decisão

Nenhuma otimização será feita sem métricas.

### Justificativa

Evita complexidade desnecessária.

---

# Métricas Obrigatórias

100% dos endpoints monitorados

100% das operações críticas rastreadas

100% dos serviços com health checks

100% dos deploys com comparação de performance

100% das integrações com timeout

100% dos incidentes com post-mortem

---

# Performance Gates

Nenhum Pull Request poderá ser aprovado caso:

□ aumente significativamente a latência;

□ ultrapasse o Performance Budget;

□ introduza N+1 Queries;

□ reduza cobertura de monitoramento;

□ aumente consumo de memória sem justificativa;

□ remova métricas existentes.

---

# Checklist

□ Performance Budget respeitado?

□ Há benchmark?

□ Existe cache quando necessário?

□ Há profiling?

□ Existe observabilidade?

□ Há estratégia de escalabilidade?

□ Há timeout?

□ Existe retry seguro?

□ Existe backpressure?

□ Existe graceful degradation?

---

# Referências

Google Web Vitals

Google SRE Workbook

Google Site Reliability Engineering

AWS Well-Architected Framework

Azure Architecture Center

Cloudflare Performance Best Practices

Martin Fowler - Performance Patterns

---

# Princípio Final

O ATLAS deve manter desempenho previsível independentemente do crescimento do produto.

Novas funcionalidades não podem degradar a experiência existente.

Performance é um contrato arquitetural entre engenharia e usuários.

Esse contrato deve ser medido, protegido e continuamente aprimorado.