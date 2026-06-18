# 20 - Infrastructure.md

# Cloud Infrastructure Architecture

> "Infraestrutura é um serviço da aplicação. Nunca o contrário."

---

# Objetivo

Este documento define a arquitetura de infraestrutura do Projeto Atlas.

Seu objetivo é estabelecer princípios para provisionamento, disponibilidade, escalabilidade, isolamento, resiliência, observabilidade e continuidade operacional.

Toda infraestrutura deverá ser tratada como código, ser reproduzível e independente do provedor utilizado.

---

# Escopo

Este documento cobre:

- Cloud Architecture
- Networking
- Compute
- Containers
- Orquestração
- Load Balancing
- Storage
- CDN
- DNS
- Service Discovery
- Secrets
- Backup
- Disaster Recovery
- High Availability
- Escalabilidade

---

# Não Escopo

Este documento não cobre:

- DevOps Pipeline
- Segurança Aplicacional
- Banco de Dados
- Performance

Esses tópicos possuem documentos específicos.

---

# Filosofia

Infraestrutura deve ser invisível para o domínio.

O domínio não conhece servidores.

Não conhece containers.

Não conhece regiões.

Não conhece provedores.

Toda complexidade operacional permanece isolada da aplicação.

---

# Infrastructure Principles

Toda infraestrutura deve ser:

Declarativa

↓

Imutável

↓

Escalável

↓

Observável

↓

Automatizada

↓

Auditável

↓

Reproduzível

---

# Cloud Agnostic

A arquitetura não poderá depender de recursos exclusivos de um provedor.

A troca entre provedores deverá exigir mudanças mínimas.

Evitar vendor lock-in sempre que possível.

---

# Infrastructure Layers

```text
Internet
    │
DNS
    │
CDN / Edge
    │
Load Balancer
    │
API Gateway
    │
Application Services
    │
Workers
    │
Cache
    │
Database
    │
Object Storage
    │
Backup
```

Cada camada possui responsabilidade única.

---

# Network Architecture

Separação lógica obrigatória.

```text
Public Network
        │
DMZ
        │
Private Network
        │
Application
        │
Data Layer
```

Recursos internos nunca serão expostos diretamente à Internet.

---

# Compute

A aplicação deverá executar em ambientes isolados.

Características:

Stateless

Reproduzível

Horizontalmente escalável

Efêmero

---

# Container Strategy

Todo serviço deverá ser executável em container.

Requisitos:

Imagem mínima.

Sem privilégios elevados.

Filesystem preferencialmente somente leitura.

Usuário não-root.

Health Checks.

Graceful Shutdown.

---

# Orchestration

A arquitetura deve permitir orquestração automática.

Capacidades esperadas:

Escalonamento

Auto-healing

Rolling Updates

Service Discovery

Load Distribution

Self-Healing

---

# Service Discovery

Serviços nunca deverão conhecer endereços fixos.

Toda descoberta deverá ocorrer dinamicamente.

---

# Load Balancing

Objetivos:

Distribuição uniforme.

Alta disponibilidade.

Tolerância a falhas.

Suporte a múltiplas instâncias.

---

# Auto Scaling

Escalabilidade baseada em métricas.

Exemplos:

CPU

Memória

Latência

Fila

Throughput

Nunca baseada apenas em horário.

---

# Stateless Architecture

Serviços HTTP deverão permanecer stateless.

Estado persistente pertence:

Database

Cache

Storage

Nunca à instância da aplicação.

---

# Object Storage

Arquivos enviados pelos usuários deverão ser armazenados em serviço dedicado.

Nunca no filesystem da aplicação.

---

# CDN

Conteúdo estático deverá utilizar distribuição geográfica.

Benefícios:

Baixa latência.

Menor carga no backend.

Maior disponibilidade.

---

# DNS

DNS deverá suportar:

Failover

Health Checks

Baixo TTL quando necessário

Alta disponibilidade

---

# Storage

Categorias:

Persistent Storage

Object Storage

Temporary Storage

Cache Storage

Cada categoria possui política própria.

---

# Secrets Management

Toda credencial deverá permanecer em serviço dedicado.

Características:

Rotação

Auditoria

Versionamento

Controle de acesso

Jamais em variáveis versionadas.

---

# Configuration Management

Configuração separada da aplicação.

Cada ambiente possui configuração própria.

Configuração nunca faz parte do build.

---

# High Availability

Objetivos:

Eliminar Single Points of Failure.

Toda camada crítica deverá suportar redundância.

---

# Fault Tolerance

Toda falha deve ser considerada inevitável.

A arquitetura deve continuar operando mesmo diante da indisponibilidade parcial de componentes.

---

# Disaster Recovery

Toda infraestrutura deverá possuir:

Plano documentado.

Backups.

Testes periódicos.

RPO definido.

RTO definido.

---

# Backup Strategy

Backups devem ser:

Automáticos.

Versionados.

Criptografados.

Testados.

Backups nunca são considerados válidos até que sua restauração seja comprovada.

---

# Multi-Region Readiness

A arquitetura deverá permitir expansão futura para múltiplas regiões.

Mesmo que inicialmente opere em região única.

---

# Capacity Planning

Toda infraestrutura deverá possuir planejamento para:

Usuários simultâneos.

Requests/s.

Armazenamento.

CPU.

RAM.

Network.

Crescimento anual.

---

# Cost Optimization

Custos fazem parte da arquitetura.

Princípios:

Right Sizing.

Auto Scaling.

Storage Lifecycle.

Observabilidade de custos.

Eliminação de recursos ociosos.

---

# Infrastructure Observability

Toda camada deverá produzir:

Metrics

↓

Logs

↓

Traces

↓

Events

↓

Health Checks

↓

Alerts

↓

Dashboards

---

# Infrastructure Security

Toda infraestrutura deverá seguir:

Least Privilege

Network Segmentation

Encrypted Traffic

Secrets Management

Audit Logging

Identity Federation

Sem exceções.

---

# Resilience Patterns

A infraestrutura deverá suportar:

Circuit Breakers

Retries

Timeouts

Bulkheads

Graceful Degradation

Backpressure

Health Checks

Self Healing

---

# Anti-patterns

É proibido:

❌ SSH manual em produção

❌ Alterações manuais

❌ Servidores únicos

❌ Configuração não versionada

❌ Containers privilegiados

❌ Dependência de IP fixo

❌ Estado salvo na aplicação

❌ Secrets em variáveis públicas

❌ File Upload local

❌ Recursos sem monitoramento

❌ Infraestrutura sem Backup

---

# ADR-001

## Infrastructure as Code

### Decisão

Toda infraestrutura será declarativa.

### Justificativa

Reprodutibilidade.

Auditoria.

Escalabilidade.

---

# ADR-002

## Stateless Services

### Decisão

Todos os serviços HTTP permanecerão stateless.

### Justificativa

Escalabilidade horizontal.

Resiliência.

Elasticidade.

---

# ADR-003

## Cloud Agnostic

### Decisão

Evitar dependência estrutural de um provedor específico.

### Justificativa

Flexibilidade.

Redução de risco.

Longevidade da arquitetura.

---

# ADR-004

## Object Storage

### Decisão

Arquivos nunca serão armazenados localmente.

### Justificativa

Escalabilidade.

Persistência.

Alta disponibilidade.

---

# Métricas

Disponibilidade ≥ 99.9%

Infraestrutura reproduzível = 100%

Health Checks = 100%

Backups automatizados = 100%

Recursos monitorados = 100%

Secrets externos = 100%

Single Points of Failure = 0

Deploy manual = 0

---

# Infrastructure Gates

Nenhuma alteração poderá ser implantada caso:

□ exista configuração manual;

□ haja segredo versionado;

□ infraestrutura não seja reproduzível;

□ health checks falhem;

□ backup não esteja validado;

□ observabilidade esteja incompleta.

---

# Checklist

□ Infraestrutura declarativa?

□ Escalabilidade prevista?

□ Existe redundância?

□ Existe backup?

□ Existe plano de recuperação?

□ Existe monitoramento?

□ Existe isolamento de rede?

□ Serviços são stateless?

□ Configurações externas?

□ Secrets protegidos?

---

# Referências

The Twelve-Factor App

Google SRE

AWS Well-Architected Framework

Azure Well-Architected Framework

Google Cloud Architecture Framework

Cloud Native Computing Foundation (CNCF)

NIST SP 800-190

---

# Princípio Final

A infraestrutura do Projeto Atlas deve ser tratada como um produto de engenharia.

Ela deve ser reproduzível, auditável, resiliente e evolutiva.

Mudanças de infraestrutura nunca podem comprometer a continuidade do negócio.

A aplicação deve ser capaz de evoluir independentemente da plataforma onde está sendo executada.