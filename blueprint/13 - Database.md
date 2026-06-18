# 13 - Database.md

# Database

> "O banco de dados não existe para armazenar informações. Existe para preservar a verdade do domínio."

---

# Objetivo

Este documento define a arquitetura de persistência do ATLAS.

Seu propósito é estabelecer princípios para modelagem, integridade, versionamento, consistência, auditoria, escalabilidade e governança dos dados.

Toda decisão relacionada à persistência deverá respeitar as diretrizes descritas neste documento.

---

# Escopo

Este documento cobre:

- Modelagem
- Integridade
- Relacionamentos
- Agregados
- Versionamento
- Migrations
- Índices
- Estratégias de Consulta
- Auditoria
- Concorrência
- Consistência
- Escalabilidade

---

# Não Escopo

Este documento não define:

- ORM
- Engine de Banco
- Ferramentas de Migration
- Drivers
- Bibliotecas

---

# Filosofia

Os dados representam o ativo mais importante do ATLAS.

Toda modelagem deve priorizar:

- Integridade
- Clareza
- Evolução
- Performance previsível
- Baixo acoplamento

O banco deve refletir o domínio.

Nunca o contrário.

---

# Domain Driven Persistence

A persistência deve respeitar os limites do domínio.

Cada módulo possui autonomia sobre seus próprios dados.

Exemplo:

Users

↓

Workouts

↓

Exercises

↓

Progress

↓

Nutrition

↓

Missions

↓

AI

Cada módulo é proprietário exclusivo de seus dados.

Nenhum módulo poderá modificar diretamente tabelas pertencentes a outro domínio.

---

# Ownership

Toda entidade possui apenas um responsável.

Exemplo:

Workout pertence ao módulo Workouts.

Mission pertence ao módulo Missions.

Conversation pertence ao módulo AI.

Nunca existirão múltiplos owners.

---

# Aggregate Roots

Sempre que existir consistência transacional.

Utilizar Aggregate Roots.

Exemplos:

Workout

↓

Exercises

↓

Sets

Workout controla toda consistência do agregado.

---

# Entidades

Entidades representam objetos com identidade.

Características:

- Identificador imutável
- Ciclo de vida
- Estado mutável
- Regras próprias

---

# Value Objects

Objetos sem identidade.

Imutáveis.

Representam conceitos do domínio.

Exemplos:

Email

Weight

Height

Duration

Goal

Measurement

---

# Chaves Primárias

Todas as entidades deverão utilizar identificadores opacos.

Jamais utilizar informações de negócio como chave primária.

Exemplo proibido:

CPF

Email

Username

---

# Chaves Estrangeiras

Relacionamentos devem preservar integridade referencial.

Remoções devem possuir comportamento explícito.

Nunca depender do comportamento padrão do banco.

---

# Normalização

Prioridade inicial:

Terceira Forma Normal (3NF).

Desnormalizações somente quando:

- Medidas comprovarem necessidade.
- Houver benefício claro.
- A complexidade for aceitável.

Toda desnormalização deverá ser documentada.

---

# Índices

Índices existem para consultas críticas.

Nunca criar índices preventivamente.

Todo índice deve justificar:

- consulta atendida;
- impacto esperado;
- custo de escrita.

Índices redundantes são proibidos.

---

# Estratégia de Consulta

Sempre priorizar:

- consultas previsíveis;
- baixo custo computacional;
- baixo número de joins;
- paginação eficiente.

Evitar:

N+1 Queries

Table Scans desnecessários

Nested Queries excessivas

---

# Paginação

Paginação Offset deverá ser evitada em grandes volumes.

Preferir estratégias baseadas em Cursor.

Benefícios:

- melhor escalabilidade;
- estabilidade;
- performance consistente.

---

# Soft Delete

Soft Delete somente quando existir necessidade de negócio.

Caso utilizado.

Toda consulta deverá considerar registros ativos por padrão.

---

# Auditoria

Eventos importantes deverão ser auditados.

Exemplos:

Cadastro

Alteração de objetivos

Conclusão de treino

Mudança de permissões

Operações administrativas

Logs de auditoria nunca substituem logs técnicos.

---

# Versionamento

Toda alteração estrutural deverá ocorrer através de Migrations.

Regras:

Migration é imutável.

Nunca editar migrations executadas.

Correções devem ocorrer através de novas migrations.

---

# Integridade

Toda regra crítica deverá ser protegida.

Sempre que possível:

Constraints

Foreign Keys

Unique Constraints

Check Constraints

Validações no domínio

A integridade nunca dependerá apenas da aplicação.

---

# Concorrência

Operações concorrentes deverão prever:

Race Conditions

Lost Updates

Dirty Reads

Double Writes

Estratégias permitidas:

Optimistic Lock

Pessimistic Lock

Version Columns

Atomic Operations

A escolha depende do caso de uso.

---

# Transações

Transações devem ser:

Curtas.

Determinísticas.

Limitadas ao Aggregate.

Evitar transações distribuídas.

---

# Consistência

Operações internas ao Aggregate:

Consistência Forte.

Comunicação entre Aggregates:

Consistência Eventual.

---

# Idempotência

Operações críticas deverão suportar repetição segura.

Exemplos:

Criação de recursos

Pagamentos futuros

Integrações

Eventos

---

# Dados Derivados

Sempre que possível.

Calcular em tempo de leitura.

Persistir apenas quando:

- custo elevado;
- necessidade de performance;
- histórico.

Toda duplicação deverá ser documentada.

---

# Eventos

Alterações relevantes deverão gerar Domain Events.

Exemplos:

WorkoutCompleted

MissionCompleted

WeightRegistered

GoalUpdated

UserRegistered

Eventos representam fatos.

Nunca comandos.

---

# Estratégia de Cache

Cache nunca será fonte de verdade.

Hierarquia:

Application

↓

Cache

↓

Database

O banco permanece como única fonte de verdade.

---

# Retenção

Toda informação deverá possuir política de retenção.

Categorias:

Operacional

Histórica

Auditoria

Temporária

Cada categoria possui ciclo de vida próprio.

---

# Backup

Toda estratégia de persistência deverá prever:

Backups automáticos

Restauração validada

Testes periódicos

Objetivos claros de:

RPO

RTO

---

# Escalabilidade

A arquitetura deverá permitir:

Read Replicas

Partitioning

Sharding futuro

Arquivamento

Separação de workloads

Sem refatoração completa do domínio.

---

# Anti-patterns

É proibido:

❌ SELECT *

❌ N+1 Queries

❌ Cascade sem documentação

❌ Chaves naturais

❌ Regras de negócio em Triggers

❌ Procedures contendo lógica de domínio

❌ Índices duplicados

❌ Transações longas

❌ Migrations destrutivas sem estratégia

❌ Dados duplicados sem justificativa

---

# ADR-001

## Domain Ownership

### Decisão

Cada domínio é proprietário exclusivo de seus dados.

### Justificativa

Baixo acoplamento.

Maior autonomia.

Escalabilidade.

---

# ADR-002

## Aggregate Consistency

### Decisão

Transações limitadas ao Aggregate Root.

### Justificativa

Redução de lock.

Maior performance.

Arquitetura preparada para microsserviços.

---

# ADR-003

## Cursor Pagination

### Decisão

Paginação baseada em cursor.

### Justificativa

Offset degrada com grandes volumes.

Cursor mantém performance previsível.

---

# Métricas

Objetivos mínimos:

Integridade Referencial: 100%

N+1 Queries: 0

Índices sem uso: 0

Migrações reversíveis: 100%

Cobertura de Constraints críticas: 100%

Backups automatizados: 100%

Operações críticas auditadas: 100%

---

# Checklist

Antes de aprovar qualquer alteração estrutural verificar:

□ O domínio continua proprietário dos dados?

□ Existe Aggregate Root?

□ Existe violação de integridade?

□ A migration é reversível?

□ Há impacto em índices?

□ Há impacto em concorrência?

□ Existe estratégia de rollback?

□ A alteração mantém consistência?

□ Os eventos continuam corretos?

□ A mudança aumenta ou reduz complexidade?

---

# Referências Internas

11 - Frontend Architecture.md

12 - Backend Architecture.md

14 - API.md

15 - Authentication.md

16 - Security.md

17 - Performance.md

18 - Testing.md

---

# Princípio Final

A persistência do ATLAS deve ser projetada para suportar anos de evolução sem comprometer a integridade do domínio.

Modelos podem crescer.

Consultas podem evoluir.

Tecnologias podem ser substituídas.

A verdade do domínio deve permanecer consistente, íntegra e rastreável durante todo o ciclo de vida do produto.