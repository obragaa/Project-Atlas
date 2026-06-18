# Atlas Blueprint

> Entry Point para qualquer IA trabalhando no Projeto Atlas.

---

# Objetivo

Este documento é o ponto inicial de navegação do Blueprint.

Antes de realizar qualquer alteração no projeto, a IA deve consultar este arquivo para identificar quais documentos são relevantes para a tarefa solicitada.

Este arquivo não contém regras completas.

Ele apenas direciona para a documentação correta.

---

# Como utilizar este Blueprint

Sempre siga esta ordem:

1. Leia este documento (`main.md`).
2. Identifique o tipo da tarefa.
3. Consulte apenas os documentos necessários.
4. Nunca assuma regras que não estejam documentadas.
5. Caso exista conflito entre documentos, siga a hierarquia definida neste arquivo.
6. Caso uma alteração impacte outro módulo, atualize ambos os documentos.

---

# Hierarquia da Documentação

Em caso de conflito entre documentos, siga a seguinte prioridade:

1. Engineering Principles (24)
2. Engineering Governance (23)
3. Vision (00)
4. Experience Blueprint (03) e Product Rules (02)
5. Regras Arquiteturais
6. Regras Técnicas
7. Implementação

Nenhuma implementação pode contradizer documentos superiores.

---

# Estrutura do Blueprint

> Nota de governança (2026-06-18): este índice foi corrigido para refletir
> exatamente os arquivos existentes na pasta `/blueprint`. A numeração e os
> títulos abaixo são a fonte de navegação canônica. (Ver ADR-0001.)

## Produto & Experiência

00 - Vision.md

Define a visão de longo prazo do Atlas.

Quando consultar:

- entender o produto;
- entender propósito;
- alinhar decisões ao negócio.

---

01 - Brand.md

Define a identidade, personalidade e tom de voz da marca.

Consultar para comunicação, escrita, identidade visual e sensação do produto.

---

02 - Product Rules.md

Define a constituição do produto e suas regras globais.

Consultar quando alterar funcionalidades.

---

03 - Experience Blueprint.md

Define a experiência e a jornada emocional esperadas.

Consultar sempre que houver dúvida sobre prioridades de UX.

---

04 - Motion System.md

Define como o Atlas se movimenta.

Consultar ao criar animações, transições e feedback dinâmico.

---

05 - Design System.md

Consultar para:

- componentes
- cores
- tipografia
- espaçamento
- identidade visual

Nunca criar componentes ignorando este documento.

---

06 - Accessibility.md

Define os padrões de acessibilidade.

Consultar em toda interface, componente e fluxo.

---

07 - Features.md

Lista funcionalidades existentes e planejadas.

Consultar ao criar novas features.

---

08 - User Journey.md

Consultar quando alterar fluxos do usuário.

---

09 - Gamification.md

Define o sistema de missões, streaks e recompensas.

Consultar ao alterar mecânicas de incentivo.

---

10 - Atlas AI.md

Define a identidade e o comportamento do Atlas AI.

Consultar quando alterar funcionalidades específicas do Atlas AI.

---

## Arquitetura & Engenharia

11 - Frontend Architecture.md

Consultar quando alterar:

- UI
- Componentes
- Navegação
- Estado
- Organização Frontend

---

12 - Backend Architecture.md

Consultar quando alterar:

- APIs
- Casos de uso
- Serviços
- Domínio
- Arquitetura Backend

---

13 - Database.md

Consultar quando alterar:

- entidades
- tabelas
- índices
- relacionamentos
- persistência

---

14 - API.md

Consultar ao:

- criar endpoints;
- alterar contratos;
- modificar requests ou responses.

---

15 - Authentication.md

Consultar ao alterar:

- login
- sessões
- autenticação
- autorização
- permissões
- usuários

---

16 - Security.md

Consultar sempre que alterar:

- autenticação
- APIs
- uploads
- validações
- dados sensíveis
- infraestrutura

Nenhuma alteração pode reduzir o nível de segurança.

---

17 - Performance.md

Consultar quando alterar:

- consultas
- rendering
- APIs
- IA
- processamento

Objetivo:

Manter Performance Budget.

---

18 - Testing.md

Consultar sempre que criar:

- funcionalidades
- correções
- refatorações

Toda alteração deve possuir estratégia de testes.

---

19 - DevOps.md

Consultar quando alterar:

- pipelines
- Docker
- CI/CD
- deploy
- ambientes

---

20 - Infrastructure.md

Consultar quando alterar:

- containers
- infraestrutura
- cloud
- storage
- networking
- escalabilidade

---

21 - Observability.md

Consultar quando alterar:

- logs
- métricas
- tracing
- monitoramento
- alertas

Toda funcionalidade relevante deve ser observável.

---

22 - AI Engineering.md

Documento obrigatório para qualquer alteração relacionada ao Atlas AI.

Inclui:

- prompts
- contexto
- memória
- RAG
- tool calling
- guardrails
- modelos
- avaliação
- custos

---

23 - Engineering Governance.md

Consultar quando:

- decisões arquiteturais mudarem;
- novos padrões forem criados;
- exceções forem introduzidas.

---

24 - Engineering Principles.md

Documento mais importante do projeto.

Consultar quando houver dúvida entre duas soluções possíveis.

Sempre escolher a alternativa mais alinhada aos princípios deste documento.

---

# Fluxo de Decisão

Antes de implementar qualquer alteração, responda internamente:

## 1.

Qual problema estou resolvendo?

↓

## 2.

Quais documentos governam esse problema?

↓

## 3.

Existe regra de negócio?

↓

## 4.

Existe impacto arquitetural?

↓

## 5.

Existe impacto em segurança?

↓

## 6.

Existe impacto em performance?

↓

## 7.

Existe impacto na IA?

↓

## 8.

Existe impacto na documentação?

↓

Implementar somente após essas verificações.

---

# Atualização da Documentação

Sempre que modificar:

Arquitetura

↓

Regras

↓

Fluxos

↓

Contratos

↓

IA

↓

Infraestrutura

↓

Padrões

A IA deve verificar se algum documento precisa ser atualizado.

Código e documentação devem evoluir juntos.

---

# Princípios Obrigatórios

A IA nunca deverá:

❌ Ignorar documentação existente.

❌ Criar padrões paralelos.

❌ Duplicar regras.

❌ Contradizer outro documento.

❌ Introduzir dependências desnecessárias.

❌ Criar soluções sem justificativa.

❌ Alterar arquitetura sem atualizar a documentação.

---

# Checklist Antes de Responder

Antes de concluir qualquer tarefa, confirme:

□ Consultei os documentos corretos?

□ Mantive consistência arquitetural?

□ Respeitei os princípios do projeto?

□ A documentação continua válida?

□ Existe impacto em outros módulos?

□ Algum documento precisa ser atualizado?

---

# Missão da IA

Ao atuar no Projeto Atlas, sua responsabilidade não é apenas escrever código.

Sua responsabilidade é preservar a consistência arquitetural, proteger a qualidade do projeto e garantir que toda evolução permaneça alinhada à visão, missão e princípios definidos neste Blueprint.

Toda decisão deve priorizar simplicidade, clareza, segurança, escalabilidade e sustentabilidade a longo prazo.