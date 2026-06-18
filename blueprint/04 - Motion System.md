# 04 - Motion System.md

# Motion System

> "Movimento não é decoração. Movimento é comunicação."

---

# Objetivo

Este documento define como o ATLAS se movimenta.

Toda animação, transição, feedback visual e comportamento dinâmico da interface deverá seguir os princípios descritos aqui.

O movimento existe para comunicar.

Nunca apenas para impressionar.

---

# Filosofia

O usuário nunca deve perceber as animações.

Ele deve apenas sentir que tudo parece vivo.

O melhor Motion Design é invisível.

---

# Nossa Missão

Transformar uma interface estática em uma experiência orgânica.

O sistema deve transmitir inteligência.

Elegância.

Fluidez.

Precisão.

---

# Sensação

O movimento do ATLAS deve transmitir:

• leveza

• confiança

• precisão

• sofisticação

• continuidade

Jamais transmitir:

• ansiedade

• lentidão

• exagero

• distração

• espetáculo

---

# Princípios

## Toda animação possui propósito

Não criar animações apenas porque são bonitas.

Toda animação deve responder:

O que acabou de acontecer?

O que está acontecendo?

O que acontecerá agora?

---

## Continuidade

Nada deve aparecer.

Tudo deve surgir naturalmente.

Nada deve desaparecer.

Tudo deve sair suavemente.

---

## Física

Os elementos possuem peso.

Possuem aceleração.

Possuem desaceleração.

Nada deve parecer robótico.

---

## Naturalidade

As animações devem lembrar o comportamento de objetos reais.

Nunca parecer scripts.

---

# Background Vivo

O background faz parte da identidade do ATLAS.

Ele nunca permanecerá completamente estático.

Elementos permitidos:

* Aurora dinâmica.
* Gradientes fluidos.
* Mesh Gradient.
* Ruído extremamente discreto.
* Partículas leves.
* Glow suave.
* Movimento lento de iluminação.
* Parallax sutil.

Objetivo:

Criar profundidade.

Jamais chamar atenção.

---

# Mouse Tracking

Alguns elementos poderão reagir ao cursor.

Sempre de maneira extremamente discreta.

Exemplos:

* iluminação
* glow
* reflexos
* profundidade

Nunca mover grandes componentes.

Nunca exagerar.

---

# Hover

Hover comunica disponibilidade.

Jamais utilizar efeitos bruscos.

Possíveis comportamentos:

* pequena elevação
* brilho discreto
* mudança de iluminação
* alteração de sombra
* leve aumento de escala

Nunca utilizar:

* giros
* pulos
* efeitos elásticos exagerados

---

# Clique

Todo clique deve transmitir confirmação.

O usuário deve sentir que a ação aconteceu.

---

# Focus

O foco deve ser elegante.

Nunca agressivo.

Jamais utilizar outlines chamativos.

---

# Loading

Loading não significa esperar.

Significa comunicar progresso.

Sempre priorizar:

* Skeletons.
* Shimmer.
* Conteúdo progressivo.

Spinner será a última opção.

---

# Skeletons

Os Skeletons devem representar exatamente a estrutura que será carregada.

Nunca utilizar blocos genéricos.

---

# Mudança de Página

Trocas de página devem parecer contínuas.

Nunca cortar abruptamente.

O usuário deve sentir que continua dentro do mesmo ambiente.

---

# Entrada de Componentes

Os elementos devem aparecer respeitando hierarquia.

Primeiro o contexto.

Depois os detalhes.

Nunca tudo ao mesmo tempo.

---

# Saída

Elementos devem desaparecer naturalmente.

Sem cortes.

Sem sumiços instantâneos.

---

# Scroll

O scroll deve transmitir suavidade.

Mas sempre respeitando a performance do navegador.

---

# Cards

Cards são elementos vivos.

Eles respondem ao usuário.

Hover.

Focus.

Click.

Atualizações.

Mudanças de estado.

Tudo deve ser animado.

---

# Feedback

Sucesso.

Erro.

Aviso.

Informação.

Todos devem possuir identidade visual própria.

Mas nunca interromper a navegação.

---

# Microinterações

Toda ação importante deve gerar uma pequena resposta.

Exemplos:

Favoritar.

Salvar.

Editar.

Concluir missão.

Registrar treino.

Atualizar peso.

Enviar mensagem ao Atlas AI.

---

# Gráficos

Mudanças em gráficos devem ser animadas.

O usuário deve perceber evolução.

Nunca mudança instantânea.

---

# Atlas AI

O Atlas AI deve parecer "pensar".

Ao responder.

Mostrar estados inteligentes.

Exemplos:

Analisando contexto.

Consultando histórico.

Preparando resposta.

Nunca apenas:

"Carregando..."

---

# Performance

A fluidez é obrigatória.

Objetivos:

60 FPS sempre que possível.

Priorizar transform e opacity.

Evitar animações que provoquem reflow.

Reduzir consumo de GPU.

Carregar apenas o necessário.

---

# Acessibilidade

Respeitar sempre:

prefers-reduced-motion.

Caso o usuário prefira menos animações.

Toda experiência deverá adaptar-se automaticamente.

---

# Critérios de Aprovação

Antes de aprovar qualquer animação perguntar:

Ela comunica alguma informação?

Melhora a experiência?

Está elegante?

É rápida?

É fluida?

Pode ser simplificada?

Existe algum exagero?

---

# Princípio Final

No ATLAS, movimento nunca será utilizado para impressionar.

Movimento será utilizado para tornar a experiência humana.

O usuário talvez nunca perceba conscientemente as animações.

Mas perceberá imediatamente a qualidade do produto.
