# 12 - Backend Architecture.md

# Backend Architecture

> "O Backend do ATLAS não é apenas um provedor de APIs. Ele é o núcleo responsável por preservar as regras de negócio, garantir consistência dos dados e manter a evolução do produto sustentável."

---

# Objetivo

Este documento define os princípios arquiteturais, restrições, responsabilidades e padrões para toda a camada Backend do ATLAS.

Toda implementação deverá seguir estas diretrizes independentemente da tecnologia utilizada.

---

# Escopo

Este documento cobre:

* Arquitetura da aplicação
* Organização dos módulos
* Regras de negócio
* Casos de uso
* Serviços
* Persistência
* Eventos
* Integrações
* Observabilidade
* Escalabilidade
* Performance
* Segurança (arquitetural)

---

# Não Escopo

Este documento **não** define:

* Banco de Dados (13 - Database.md)
* API Contracts (14 - API.md)
* Autenticação (15 - Authentication.md)
* Segurança Aplicacional (16 - Security.md)

Esses assuntos possuem documentos próprios.

---

# Missão

Construir um Backend desacoplado da interface.

A UI deve poder ser completamente substituída sem exigir alterações significativas nas regras de negócio.

O domínio deve permanecer independente da tecnologia.

---

# Filosofia

Toda regra de negócio pertence ao Backend.

Nunca ao Frontend.

O Backend existe para proteger a integridade do domínio.

---

# Arquitetura

O Backend deverá seguir uma arquitetura em camadas.

```text
Presentation Layer
        │
Application Layer
        │
Domain Layer
        │
Infrastructure Layer
```

Cada camada possui responsabilidades bem definidas.

---

# Dependency Rule

As dependências sempre apontam para dentro.

```text
Infrastructure
        ↓
Application
        ↓
Domain
```

O Domain nunca conhece Infrastructure.

O Domain nunca conhece Frameworks.

O Domain nunca conhece Banco de Dados.

---

# Domain First

O domínio representa o ativo mais importante do sistema.

Frameworks.

ORMs.

Mensageria.

Cache.

Tudo isso é substituível.

O domínio não.

---

# Estrutura de Módulos

O Backend deverá ser organizado por domínio.

Exemplo conceitual:

```text
modules/

    auth/

    users/

    workouts/

    exercises/

    nutrition/

    missions/

    ai/

    progress/

    notifications/
```

Cada módulo deve ser independente.

---

# Responsabilidades

Cada módulo é responsável apenas por seu próprio domínio.

Nenhum módulo poderá manipular diretamente os dados internos de outro módulo.

Toda comunicação deverá ocorrer através de contratos bem definidos.

---

# Casos de Uso

Toda regra de negócio deverá existir dentro de um Use Case.

Exemplos:

* CreateWorkout
* FinishWorkout
* RegisterWeight
* CompleteMission
* GenerateInsights

Controllers nunca implementam regras de negócio.

---

# Controllers

Responsabilidades:

* Validar entrada
* Delegar execução
* Retornar resposta

Nunca:

* Consultar banco diretamente
* Implementar regras
* Fazer cálculos
* Coordenar múltiplos domínios

---

# Services

Services representam comportamentos do domínio.

Devem ser pequenos.

Coesos.

Testáveis.

---

# Repositories

Repositories representam abstrações da persistência.

O domínio nunca conhece SQL.

Nunca conhece ORM.

Nunca conhece tecnologia de armazenamento.

---

# DTOs

Objetos de transferência existem apenas para comunicação entre camadas.

Nunca representarão entidades do domínio.

---

# Entidades

As entidades representam conceitos do negócio.

Exemplos:

* User
* Workout
* Exercise
* Mission
* Progress
* Conversation

Entidades devem proteger sua própria consistência.

---

# Value Objects

Sempre que possível, conceitos imutáveis devem ser representados como Value Objects.

Exemplos:

* Weight
* Height
* Email
* Password
* Duration

---

# Domain Events

Eventos representam acontecimentos importantes.

Exemplos:

WorkoutCompleted

MissionCompleted

WeightUpdated

GoalAchieved

UserRegistered

Os eventos desacoplam módulos.

---

# Event Driven

Sempre que apropriado.

Preferir eventos a chamadas diretas entre domínios.

Isso reduz acoplamento.

---

# Transactions

Toda operação crítica deve ser atômica.

Nenhum estado inconsistente poderá ser persistido.

---

# Idempotência

Operações críticas devem suportar repetição sem efeitos colaterais.

Especialmente:

* pagamentos futuros;
* criação de recursos;
* integrações.

---

# Concorrência

O Backend deverá prever acesso concorrente.

Evitar race conditions.

Garantir integridade dos dados.

---

# Observabilidade

Toda operação relevante deve gerar informações suficientes para:

* auditoria;
* debugging;
* monitoramento;
* métricas.

---

# Logging

Logs devem ser estruturados.

Nunca registrar:

* senhas;
* tokens;
* dados sensíveis;
* informações pessoais desnecessárias.

---

# Tratamento de Erros

Todo erro deve possuir:

* código;
* mensagem;
* contexto;
* categoria.

Erros internos nunca devem ser expostos diretamente ao cliente.

---

# Cache

O uso de cache deve ser transparente para o domínio.

O domínio nunca deve depender de cache para funcionar corretamente.

---

# Escalabilidade

A arquitetura deve permitir:

* múltiplas instâncias;
* processamento assíncrono;
* filas;
* workers;
* serviços independentes.

Sem necessidade de grandes refatorações.

---

# Performance

Toda operação deverá buscar:

* baixa latência;
* mínimo número de consultas;
* uso eficiente de memória;
* processamento previsível.

Premature optimization deve ser evitada.

Problemas reais devem ser medidos antes de otimizações complexas.

---

# Anti-patterns

É proibido:

* Regras de negócio em Controllers.
* SQL espalhado pela aplicação.
* Dependência direta entre módulos.
* Entidades anêmicas.
* Services gigantes.
* Objetos Deus.
* Imports circulares.
* Acoplamento ao framework.
* Lógica duplicada.

---

# ADR-001

## Organização por Domínio

### Decisão

A aplicação será organizada por domínios de negócio.

### Motivo

Favorece escalabilidade.

Melhora ownership.

Reduz acoplamento.

Facilita evolução.

### Alternativas descartadas

* Organização por tipo (controllers/, services/, repositories/)
* Organização por camada global

---

# ADR-002

## Domain First

### Decisão

Toda regra de negócio pertence ao domínio.

### Motivo

Permite troca de frameworks.

Facilita testes.

Protege o conhecimento do negócio.

---

# Métricas

Objetivos mínimos:

* Cobertura de testes > 90%
* Complexidade ciclomática ≤ 10
* Tempo médio de resposta < 200ms (operações simples)
* Zero dependências circulares
* Build reproduzível
* Módulos independentes
* Logs estruturados em 100% das operações críticas

---

# Checklist

Antes de aprovar qualquer implementação Backend verificar:

* Existe responsabilidade única?
* O domínio permanece independente?
* Há baixo acoplamento?
* Existe alta coesão?
* O caso de uso está isolado?
* Há tratamento de erro adequado?
* A operação é testável?
* A implementação respeita os ADRs?
* A mudança aumenta ou reduz a complexidade?

---

# Referências Internas

* 02 - Product Rules.md
* 07 - Features.md
* 10 - Atlas AI.md
* 13 - Database.md
* 14 - API.md
* 16 - Security.md
* 17 - Performance.md

---

# Princípio Final

A arquitetura Backend do ATLAS deve permitir que o produto evolua durante anos sem que suas regras de negócio precisem ser reescritas.

Frameworks serão substituídos.

Bibliotecas mudarão.

Tecnologias evoluirão.

O domínio permanecerá.
