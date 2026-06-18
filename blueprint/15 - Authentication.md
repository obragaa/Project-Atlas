# 15 - Authentication.md

# Identity & Access Management (IAM)

> "Autenticação prova identidade. Autorização controla poder. Auditoria garante responsabilidade."

---

# Objetivo

Este documento define a arquitetura de identidade, autenticação, autorização e gerenciamento de acesso do ATLAS.

Seu propósito é garantir que toda interação com a plataforma ocorra de forma segura, rastreável e baseada no princípio do menor privilégio.

---

# Escopo

Este documento cobre:

- Identidade
- Autenticação
- Autorização
- Sessões
- Tokens
- MFA
- Gestão de Dispositivos
- Recuperação de Conta
- Revogação
- Auditoria
- Gestão de Permissões

---

# Não Escopo

Este documento não cobre:

- Segurança da infraestrutura
- Hardening
- Segurança da API
- Segurança do banco de dados

Esses tópicos pertencem ao documento Security.md.

---

# Filosofia

A identidade é um ativo crítico.

Todo mecanismo de autenticação deve minimizar confiança implícita.

O sistema deve assumir que qualquer credencial pode ser comprometida.

---

# Security Principles

Toda decisão deverá respeitar:

Least Privilege

↓

Zero Trust

↓

Defense in Depth

↓

Fail Secure

↓

Explicit Verification

---

# Identity Model

Cada usuário possui uma identidade única.

A identidade nunca depende de:

- e-mail
- username
- telefone

Esses atributos podem mudar.

A identidade permanece.

---

# Authentication Flow

Fluxo conceitual:

```text
Client

↓

Credential Validation

↓

Identity Verification

↓

Risk Analysis

↓

Session Creation

↓

Token Issuance

↓

Audit Event
```

---

# Authentication Methods

O sistema deve suportar evolução para múltiplos mecanismos.

Exemplos:

- Senha
- OAuth 2.0
- OpenID Connect
- Magic Link
- Passkeys (WebAuthn)
- MFA

A implementação poderá variar sem alterar a arquitetura.

---

# Password Policy

Caso senhas sejam utilizadas.

Requisitos:

Hash utilizando algoritmo resistente a força bruta.

Salt único por credencial.

Nunca armazenar senha em texto.

Nunca registrar senha em logs.

Nunca transmitir senha fora de TLS.

---

# Credential Storage

Credenciais nunca pertencem ao domínio.

Elas pertencem ao subsistema de identidade.

Nenhum outro módulo poderá acessar diretamente dados de autenticação.

---

# Session Model

Sessões representam autenticações válidas.

Cada sessão possui:

Session ID

User ID

Device ID

Issued At

Expires At

Last Activity

Risk Level

---

# Session Lifecycle

Created

↓

Active

↓

Renewed

↓

Expired

↓

Revoked

Toda sessão deve possuir ciclo de vida explícito.

---

# Token Strategy

Access Token

Curta duração.

Utilizado apenas para autorização.

↓

Refresh Token

Maior duração.

Utilizado exclusivamente para renovação.

Nunca reutilizar Refresh Tokens após rotação.

---

# Token Rotation

Refresh Tokens devem ser rotacionados.

Fluxo:

Old Refresh Token

↓

Validation

↓

Revocation

↓

New Refresh Token

↓

Audit Event

---

# Token Revocation

Revogação deve ocorrer quando:

Logout

↓

Password Changed

↓

Account Locked

↓

Credential Compromised

↓

Administrator Action

↓

Suspicious Activity

---

# Authorization

Autenticação nunca implica autorização.

Toda requisição deve passar por validação de permissões.

---

# Authorization Model

Modelo adotado:

RBAC (Role-Based Access Control)

Complementado por

Policy-Based Authorization

Sempre que regras contextuais forem necessárias.

---

# Roles

Papéis representam conjuntos de permissões.

Exemplos:

User

Coach

Administrator

Support

Roles nunca representam lógica de negócio.

---

# Permissions

Permissões representam ações.

Exemplos:

workout.read

workout.create

workout.update

workout.delete

mission.complete

user.manage

Nunca utilizar permissões genéricas.

---

# Policy Engine

Regras contextuais poderão considerar:

Ownership

Resource State

Subscription

Feature Flags

Environment

Business Rules

---

# Least Privilege

Todo usuário recebe apenas o mínimo necessário.

Permissões extras devem ser explicitamente concedidas.

---

# Device Management

Cada autenticação gera um dispositivo conhecido.

Informações:

Device ID

Platform

Browser

OS

Last Activity

Approximate Location

Os usuários poderão revogar dispositivos individualmente.

---

# Suspicious Activity Detection

Eventos monitorados:

Novo dispositivo

Mudança geográfica abrupta

Múltiplas falhas

Tentativas automatizadas

Sessões simultâneas incomuns

Mudança crítica de credenciais

Cada evento gera análise de risco.

---

# Multi-Factor Authentication

Arquitetura preparada para:

TOTP

Push Notification

Passkeys

Hardware Keys

SMS apenas como fallback.

---

# Recovery Flow

Recuperação de conta deve exigir:

Validação de identidade.

Tempo limitado.

Tokens de uso único.

Revogação opcional de sessões existentes.

---

# Account Lockout

Proteção contra força bruta.

Estratégias permitidas:

Progressive Delay

Rate Limiting

Risk Scoring

Captcha adaptativo

Nunca bloqueio permanente automático.

---

# Audit Trail

Eventos auditáveis:

Login

Logout

Password Change

Permission Change

Session Revocation

MFA Enabled

MFA Disabled

Role Change

Recovery

Toda auditoria deve ser imutável.

---

# Secrets

Segredos nunca serão:

Versionados.

Registrados em logs.

Enviados ao cliente.

Armazenados em código.

---

# Privacy

Somente informações necessárias devem ser armazenadas.

Toda coleta deve possuir finalidade clara.

---

# Anti-patterns

É proibido:

❌ JWT sem expiração

❌ Refresh Token reutilizável

❌ Password em texto

❌ Sessões sem revogação

❌ Permissões implícitas

❌ Shared Accounts

❌ Hardcoded Secrets

❌ MFA opcional para administradores

❌ Authorization no Frontend

❌ Roles contendo lógica

---

# ADR-001

## Access Token + Refresh Token

### Decisão

Separação entre autenticação e renovação.

### Justificativa

Maior segurança.

Menor impacto em vazamentos.

Melhor controle de sessão.

---

# ADR-002

## RBAC + Policies

### Decisão

Permissões definidas por papéis com regras contextuais.

### Justificativa

Escalabilidade.

Clareza.

Baixo acoplamento.

---

# ADR-003

## Device Tracking

### Decisão

Toda sessão pertence a um dispositivo.

### Justificativa

Auditoria.

Revogação granular.

Segurança.

---

# Métricas

100% das credenciais protegidas

100% das sessões auditadas

100% dos tokens com expiração

100% dos refresh tokens rotacionados

0 credenciais em logs

0 segredos versionados

100% das permissões explícitas

---

# Checklist

□ Existe autenticação?

□ Existe autorização?

□ Existe auditoria?

□ Existe revogação?

□ Existe rotação?

□ Existe rastreabilidade?

□ Existe princípio do menor privilégio?

□ Existe suporte a MFA?

□ Existe proteção contra brute force?

□ Existe política de recuperação?

---

# Referências Internas

12 - Backend Architecture.md

13 - Database.md

14 - API.md

16 - Security.md

18 - Testing.md

19 - DevOps.md

---

# Princípio Final

A identidade é o perímetro lógico do ATLAS.

Toda decisão relacionada à autenticação e autorização deve assumir que credenciais podem ser comprometidas, dispositivos podem ser perdidos e ataques podem ocorrer.

A confiança nunca é permanente.

Ela deve ser continuamente estabelecida, validada e registrada.