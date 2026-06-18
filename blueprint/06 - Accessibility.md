# 06 - Accessibility.md

# Accessibility

> "Uma plataforma premium não é aquela que funciona para a maioria. É aquela que funciona para todos."

---

# Objetivo

Este documento define os padrões de acessibilidade do ATLAS.

A acessibilidade não deve ser tratada como uma funcionalidade adicional ou uma etapa final do desenvolvimento.

Ela faz parte da arquitetura do produto e deve estar presente desde a criação do primeiro componente até a última funcionalidade implementada.

Toda decisão de design, desenvolvimento e experiência deve considerar usuários com diferentes necessidades.

---

# Missão

Garantir que qualquer pessoa consiga utilizar o ATLAS com autonomia, segurança e conforto, independentemente de suas limitações físicas, sensoriais ou cognitivas.

---

# Filosofia

Acessibilidade não significa criar uma experiência diferente.

Significa garantir a mesma experiência para todos.

Nenhum usuário deve precisar enfrentar obstáculos desnecessários para realizar uma ação.

---

# Princípios

## Clareza

Toda informação importante deve ser compreendida facilmente.

Evitar ambiguidades.

Evitar excesso de texto.

Evitar instruções complexas.

---

## Consistência

Componentes iguais devem possuir o mesmo comportamento em qualquer parte da plataforma.

O usuário nunca deve reaprender a utilizar um elemento.

---

## Previsibilidade

Toda ação deve produzir um resultado esperado.

O sistema nunca deve surpreender negativamente o usuário.

---

## Controle

O usuário deve controlar a interface.

Nunca a interface deve controlar o usuário.

Animações, notificações e mudanças automáticas devem respeitar as preferências do dispositivo.

---

# Navegação por Teclado

Todo o sistema deverá ser completamente navegável utilizando apenas o teclado.

Requisitos mínimos:

* Ordem lógica de foco.
* Indicador de foco sempre visível.
* Navegação consistente.
* Atalhos apenas quando agregarem valor.
* Nunca criar elementos inacessíveis ao teclado.

---

# Leitores de Tela

Todos os componentes interativos deverão fornecer informações claras para tecnologias assistivas.

Utilizar corretamente:

* Labels.
* Roles.
* Estados.
* Descrições.
* ARIA apenas quando necessário.

Priorizar HTML semântico antes de recorrer a atributos adicionais.

---

# Contraste

Toda combinação de cores deverá possuir contraste suficiente para leitura confortável.

Nunca depender exclusivamente da cor para comunicar informações importantes.

Estados como sucesso, erro e aviso devem possuir apoio textual e visual.

---

# Tipografia

A leitura deve ser confortável.

Evitar:

* fontes muito finas;
* blocos longos sem espaçamento;
* tamanhos excessivamente pequenos.

A hierarquia tipográfica deve facilitar a compreensão.

---

# Componentes Interativos

Todos os elementos clicáveis devem possuir área de interação confortável.

O usuário nunca deve precisar de extrema precisão para executar uma ação.

---

# Formulários

Todo campo deve possuir:

* rótulo claro;
* indicação de obrigatoriedade;
* mensagem de erro compreensível;
* instrução quando necessário.

Nunca utilizar apenas placeholder como identificação do campo.

---

# Mensagens

Toda mensagem deve explicar:

* o que aconteceu;
* por que aconteceu;
* como resolver.

Jamais apresentar mensagens técnicas ao usuário final.

---

# Movimento

Todas as animações devem respeitar as preferências do sistema operacional.

Caso o usuário utilize "prefers-reduced-motion", o ATLAS deverá reduzir ou remover animações não essenciais.

A experiência deve continuar elegante mesmo com movimentos reduzidos.

---

# Tempo

O usuário deve possuir tempo suficiente para concluir qualquer ação.

Evitar encerramentos automáticos inesperados.

Notificações temporárias devem permanecer visíveis por tempo adequado ou permitir interação.

---

# Responsividade

A acessibilidade também inclui diferentes dispositivos.

O sistema deverá funcionar corretamente em:

* celulares;
* tablets;
* notebooks;
* desktops;
* monitores ultrawide.

Sem perda de funcionalidade.

---

# Linguagem

Toda comunicação deve utilizar linguagem simples.

Evitar termos excessivamente técnicos.

Sempre que possível, explicar conceitos de forma objetiva.

---

# Feedback

Toda ação do usuário deve gerar um retorno perceptível.

Esse retorno pode ser:

* visual;
* textual;
* sonoro (quando aplicável);
* estrutural.

O usuário nunca deve ficar em dúvida se sua ação foi executada.

---

# Estados

Todo componente deve comunicar claramente seus estados:

* disponível;
* selecionado;
* desabilitado;
* carregando;
* erro;
* sucesso.

Esses estados nunca devem depender apenas de cor.

---

# Atlas AI

O Atlas AI deve adaptar sua comunicação ao contexto do usuário.

As respostas devem ser:

* claras;
* objetivas;
* respeitosas;
* fáceis de compreender.

Evitar respostas excessivamente longas quando uma resposta simples resolver o problema.

---

# Compatibilidade

O ATLAS deve buscar compatibilidade com:

* leitores de tela modernos;
* navegação por teclado;
* zoom do navegador;
* diferentes densidades de tela;
* preferências de contraste;
* preferências de movimento reduzido.

---

# Checklist de Validação

Antes de aprovar qualquer funcionalidade verificar:

* Pode ser utilizada apenas com teclado?
* Funciona corretamente com leitores de tela?
* Possui contraste adequado?
* Os textos são claros?
* Os formulários possuem labels?
* Todos os estados são compreensíveis?
* A navegação é previsível?
* Respeita preferências de movimento?
* Mantém a experiência em diferentes dispositivos?

Caso qualquer resposta seja negativa, a funcionalidade deverá ser revisada.

---

# Princípio Final

No ATLAS, acessibilidade não é um requisito de conformidade.

É um compromisso com a qualidade.

Uma experiência verdadeiramente premium é aquela que acolhe todos os usuários com o mesmo nível de excelência, sem distinções.
