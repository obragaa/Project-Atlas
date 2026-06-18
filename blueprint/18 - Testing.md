# 18 - Testing.md

# Testing Engineering Standard

> "Testes não existem para provar que o código funciona. Existem para provar que futuras mudanças não o quebrarão."

---

# Objetivo

Este documento estabelece a estratégia oficial de testes do ATLAS.

Seu propósito é garantir qualidade, previsibilidade, segurança para evolução do produto e confiança durante todo o ciclo de desenvolvimento.

Toda funcionalidade deverá possuir uma estratégia de testes compatível com seu risco e impacto.

---

# Escopo

Este documento cobre:

- Estratégia de Testes
- Pirâmide de Testes
- Unit Tests
- Integration Tests
- Contract Tests
- End-to-End Tests
- Mutation Testing
- Performance Testing
- Security Testing
- Test Data
- Test Environments
- Quality Gates

---

# Não Escopo

Este documento não define:

- Framework de testes
- Ferramentas específicas
- Bibliotecas

A tecnologia utilizada poderá evoluir sem alterar esta estratégia.

---

# Filosofia

Testes devem fornecer confiança.

Não quantidade.

Cada teste deve justificar sua existência.

Testes frágeis possuem custo.

Testes redundantes também.

---

# Quality Principles

Toda funcionalidade deve ser:

Correta

↓

Testável

↓

Observável

↓

Reproduzível

↓

Determinística

↓

Automatizável

---

# Testing Pyramid

A distribuição de testes deverá seguir a pirâmide.

```text
                E2E
           Contract Tests
        Integration Tests
          Unit Tests
```

Maior quantidade na base.

Menor quantidade no topo.

---

# Test Strategy

Cada camada possui responsabilidades distintas.

Unit Tests

↓

Integration Tests

↓

Contract Tests

↓

End-to-End Tests

↓

Exploratory Testing

Nenhuma camada substitui a outra.

---

# Unit Tests

Objetivo:

Validar comportamento isolado.

Características:

- rápidos
- determinísticos
- independentes
- sem infraestrutura externa

Devem testar:

- regras de negócio
- validações
- algoritmos
- cálculos
- entidades
- value objects

Não devem testar:

- banco de dados
- APIs
- rede
- filesystem

---

# Integration Tests

Objetivo:

Validar integração entre componentes internos.

Exemplos:

Application ↔ Repository

Repository ↔ Database

API ↔ Application

Queue ↔ Worker

Cache ↔ Application

---

# Contract Tests

Objetivo:

Garantir compatibilidade entre produtores e consumidores.

Toda API pública deverá possuir testes de contrato.

Mudanças incompatíveis deverão falhar automaticamente.

---

# End-to-End Tests

Objetivo:

Validar fluxos completos do usuário.

Exemplos:

Cadastro

Login

Criar treino

Finalizar treino

Registrar progresso

Conversar com Atlas AI

Os testes E2E representam cenários de negócio.

Não detalhes de implementação.

---

# Mutation Testing

Todo módulo crítico deverá utilizar Mutation Testing.

Objetivo:

Avaliar a qualidade dos testes.

Cobertura alta não implica qualidade alta.

---

# Test Coverage

Cobertura é uma métrica auxiliar.

Nunca objetivo final.

Priorizar:

Cobertura de comportamento.

Não apenas linhas executadas.

---

# Coverage Targets

Domínio

≥ 95%

Application

≥ 90%

Infrastructure

≥ 80%

Frontend

≥ 85%

Global

≥ 90%

---

# Critical Paths

Os seguintes fluxos devem possuir cobertura completa:

- Autenticação
- Autorização
- Cadastro
- Treinos
- Missões
- IA
- Progresso
- Assinatura (quando existir)

---

# Test Data

Dados de teste devem ser:

Isolados

Reproduzíveis

Versionados

Descartáveis

Nunca depender de ambientes compartilhados.

---

# Fixtures

Fixtures representam estados conhecidos.

Devem ser:

Pequenas

Explícitas

Reutilizáveis

Legíveis

---

# Factories

Objetivo:

Construção consistente de entidades de teste.

Evitar duplicação.

Melhorar manutenção.

---

# Mocks

Mocks devem ser utilizados apenas quando necessários.

Preferir:

Stubs

Fakes

Implementações reais

Sempre que possível.

---

# Test Isolation

Todo teste deve ser independente.

A execução em qualquer ordem deve produzir o mesmo resultado.

---

# Determinism

Testes nunca poderão depender de:

Hora atual

Internet

Estado global

Ordem de execução

Ambientes externos

---

# Performance Tests

Serviços críticos deverão possuir:

Load Tests

Stress Tests

Spike Tests

Soak Tests

Resultados devem ser documentados.

---

# Security Tests

Devem existir testes para:

Autorização

Validação

Rate Limiting

Permissões

Fluxos críticos

---

# Accessibility Tests

Frontend deverá validar:

Semântica

Navegação por teclado

Contraste

ARIA

Fluxos essenciais

---

# Visual Regression

Mudanças visuais críticas devem possuir testes de regressão visual.

Objetivo:

Evitar alterações inesperadas na interface.

---

# CI Validation

Nenhum Pull Request poderá ser aprovado sem:

Unit Tests

Integration Tests

Contract Tests

Lint

Static Analysis

Coverage

Security Scan

---

# Flaky Tests

Testes instáveis são considerados defeitos.

Devem ser corrigidos imediatamente.

Nunca ignorados.

---

# Anti-patterns

É proibido:

❌ Testes dependentes entre si

❌ Sleeps arbitrários

❌ Cobertura artificial

❌ Testar implementações privadas

❌ Mocks excessivos

❌ Testes lentos sem justificativa

❌ Ignorar testes falhos

❌ Testes sem assertivas

❌ Ambientes compartilhados

❌ Dependência de internet

---

# ADR-001

## Testing Pyramid

### Decisão

A estratégia seguirá a Pirâmide de Testes.

### Justificativa

Maior velocidade.

Maior estabilidade.

Menor custo de manutenção.

---

# ADR-002

## Contract Testing

### Decisão

Toda API pública possuirá testes de contrato.

### Justificativa

Evitar breaking changes.

Maior segurança para integração.

---

# ADR-003

## Mutation Testing

### Decisão

Módulos críticos utilizarão Mutation Testing.

### Justificativa

Cobertura sozinha não mede qualidade.

---

# Quality Gates

Nenhum Pull Request poderá ser aprovado caso:

□ cobertura global seja inferior ao mínimo;

□ testes falhem;

□ haja regressão de contrato;

□ testes E2E críticos falhem;

□ mutation score fique abaixo do aceitável;

□ análise estática encontre erros críticos.

---

# Métricas

Cobertura Global ≥ 90%

Mutation Score ≥ 80%

Flaky Tests = 0

Tempo total da pipeline ≤ 10 min

Falhas intermitentes = 0

Contract Coverage = 100%

Critical Path Coverage = 100%

---

# Checklist

□ Existe teste unitário?

□ Existe integração quando necessária?

□ Existe contrato?

□ Existe E2E para o fluxo?

□ O teste é determinístico?

□ O teste é rápido?

□ O teste é independente?

□ Há cobertura para regras de negócio?

□ Existe validação de erros?

□ O comportamento está protegido contra regressões?

---

# Referências

Google Testing Blog

Google Test Pyramid

Martin Fowler - Test Pyramid

Martin Fowler - Consumer Driven Contracts

Kent Beck - Test Driven Development

xUnit Test Patterns

OWASP Testing Guide

Google SRE Workbook

---

# Princípio Final

A estratégia de testes do ATLAS existe para garantir que a evolução do produto ocorra com confiança.

Todo teste deve reduzir incerteza.

Todo teste deve proteger comportamento.

Toda alteração significativa deve ser acompanhada por evidências automatizadas de que o sistema continua íntegro, previsível e confiável.