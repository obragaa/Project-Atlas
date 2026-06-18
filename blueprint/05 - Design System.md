# 05 - Design System.md

# Design System

> "Consistência não é repetir componentes. É fazer com que toda a plataforma pareça ter sido desenhada pela mesma equipe."

---

# Objetivo

Este documento define toda a identidade visual do ATLAS.

Nenhuma interface poderá ser construída sem seguir estas diretrizes.

Todo componente deve transmitir a mesma personalidade, os mesmos princípios e o mesmo nível de qualidade.

O Design System existe para garantir consistência, escalabilidade e excelência visual.

---

# Filosofia

O Design System não define apenas aparência.

Ele define comportamento visual.

Toda decisão estética deve possuir propósito.

A beleza é consequência da organização.

Nunca do excesso.

---

# Missão

Criar uma interface que permaneça elegante durante anos.

Evitar tendências passageiras.

Priorizar um visual atemporal.

O usuário deve reconhecer imediatamente quando uma tela pertence ao ecossistema ATLAS.

---

# Identidade

Toda interface deve transmitir:

• tecnologia

• confiança

• precisão

• sofisticação

• clareza

• performance

• organização

• leveza

---

# Design Tokens

Todo valor visual deverá ser centralizado em Design Tokens.

Jamais utilizar valores fixos espalhados pelo código.

Os tokens devem controlar:

* cores
* espaçamentos
* tipografia
* sombras
* bordas
* radius
* z-index
* animações
* duração
* opacidade
* elevação

Todo o sistema deverá consumir esses tokens.

---

# Sistema de Grid

Utilizar uma escala consistente.

Toda interface deverá seguir um grid previsível.

Espaçamentos nunca serão arbitrários.

Layouts devem respeitar alinhamentos visuais.

---

# Espaçamentos

Todos os componentes devem utilizar uma escala única de espaçamento.

Jamais criar valores personalizados sem necessidade.

O espaço em branco faz parte da identidade.

---

# Tipografia

A tipografia deve transmitir inteligência.

Objetivos:

* excelente leitura
* ótima hierarquia
* aparência moderna
* conforto visual

Nunca utilizar excesso de tamanhos diferentes.

Cada nível tipográfico deve possuir uma função específica.

---

# Paleta

As cores deverão ser definidas durante o desenvolvimento.

O Designer (Claude) possui liberdade para escolher a melhor combinação.

Entretanto a paleta deverá transmitir:

* sofisticação
* profundidade
* contraste
* tecnologia

Evitar aparência neon.

Evitar excesso de saturação.

---

# Elevação

Profundidade deve ser criada através de:

* iluminação
* contraste
* blur
* sombra

Nunca utilizar sombras exageradas.

---

# Bordas

Bordas devem existir apenas quando necessárias.

Sempre discretas.

Nunca competir visualmente com o conteúdo.

---

# Radius

O arredondamento deve transmitir modernidade.

Jamais exagerar.

Todos os componentes devem compartilhar a mesma linguagem visual.

---

# Ícones

Todos os ícones deverão pertencer ao mesmo estilo.

Mesmo peso.

Mesmo alinhamento.

Mesmo tamanho base.

Jamais misturar bibliotecas.

---

# Componentes

Todo componente deve nascer reutilizável.

Antes de criar qualquer novo componente perguntar:

Ele realmente precisa existir?

Posso reutilizar outro?

Ele poderá ser utilizado em outras telas?

---

# Componentes Base

O sistema deverá possuir uma biblioteca própria contendo, no mínimo:

* Button
* IconButton
* Input
* Textarea
* Select
* Combobox
* Checkbox
* Radio
* Switch
* Slider
* Badge
* Chip
* Avatar
* Tooltip
* Dropdown
* Modal
* Dialog
* Drawer
* Tabs
* Accordion
* Table
* Data Grid
* Pagination
* Toast
* Alert
* Progress
* Skeleton
* Spinner
* Card
* Chart Container

Todos devem seguir exatamente a mesma identidade visual.

---

# Estados

Todo componente deve possuir:

Default

Hover

Focus

Pressed

Disabled

Loading

Success

Warning

Error

Empty

Caso algum estado não exista.

O componente ainda não está concluído.

---

# Hierarquia Visual

Cada tela deve responder imediatamente:

Qual é a informação principal?

Qual é a ação principal?

Qual é a próxima etapa?

A hierarquia deve ser percebida naturalmente.

---

# Conteúdo

O conteúdo sempre possui prioridade sobre a decoração.

O usuário abriu o sistema para atingir um objetivo.

Nunca para admirar efeitos visuais.

---

# Cards

Cards representam blocos de informação.

Eles devem parecer leves.

Organizados.

Respiráveis.

Jamais parecer caixas pesadas.

---

# Formulários

Formulários devem transmitir simplicidade.

Solicitar apenas o necessário.

Evitar campos desnecessários.

Agrupar informações relacionadas.

Explicar erros com clareza.

---

# Dashboards

O Core não deverá parecer um painel administrativo.

Ele deverá parecer um centro de comando pessoal.

Cada informação deve responder uma pergunta importante para o usuário.

---

# Gráficos

Gráficos existem para contar histórias.

Nunca para ocupar espaço.

Todo gráfico deve responder uma pergunta relevante.

---

# Responsividade

Nenhuma interface será criada primeiro para Desktop ou Mobile.

Toda interface será pensada como adaptável.

O layout deve evoluir naturalmente entre diferentes resoluções.

---

# Consistência

Uma decisão tomada hoje deverá continuar válida daqui a dois anos.

Evitar mudanças desnecessárias.

A previsibilidade aumenta a confiança do usuário.

---

# Evolução

O Design System deverá crescer.

Jamais ser substituído.

Novos componentes deverão complementar a biblioteca existente.

Nunca quebrar consistência.

---

# Checklist de Validação

Antes de aprovar qualquer tela verificar:

* utiliza Design Tokens?
* respeita o Grid?
* segue a Hierarquia Visual?
* utiliza componentes reutilizáveis?
* respeita acessibilidade?
* funciona em diferentes resoluções?
* possui todos os estados?
* mantém consistência com o restante da plataforma?

---

# Princípio Final

O Design System não existe para limitar criatividade.

Ele existe para garantir que qualquer nova funcionalidade pareça ter sido desenhada desde o primeiro dia do ATLAS.

Cada componente criado fortalece a identidade da plataforma.

Nunca a fragmenta.
