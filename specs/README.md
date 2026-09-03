# Specs — Sistema Vitta

Esta pasta é a fonte de verdade do desenvolvimento (spec-driven dev). Antes de
implementar qualquer funcionalidade, ela deve estar mapeada aqui; ao terminar uma
funcionalidade, o item correspondente é marcado em `07-roadmap.md`.

Ordem de leitura sugerida:

1. `01-visao-geral.md` — problema, objetivo, personas.
2. `02-requisitos-funcionais.md` — o que o sistema faz (RF01–RF12).
3. `03-requisitos-nao-funcionais.md` — restrições de qualidade (RNF01–RNF08).
4. `04-modelo-de-dados.md` — schema PostgreSQL proposto.
5. `05-arquitetura.md` — camadas, stack, decisões técnicas.
6. `06-fluxos-e-telas.md` — telas e fluxos de UI por perfil.
7. `07-roadmap.md` — backlog do MVP, checklist do que falta implementar.
8. `08-design-system.md` — cores, tipografia e textos exatos do template de
   referência (fonte de verdade visual, não inventar variações).
9. `09-sprints.md` — o roadmap organizado em sprints semanais, com o objetivo
   de chegar rápido a um MVP pronto pra homologação (testes com usuários
   reais).

Regras:

- Toda mudança de escopo (novo campo, nova tela, nova regra de negócio) deve ser
  refletida na spec correspondente **antes** ou **junto** do código, não depois.
- Decisões em aberto ficam marcadas como `⚠️ DECISÃO PENDENTE` até serem resolvidas
  com o Glauber.
- Fonte primária destas specs: monografia TG-I (`Glauber Lima Margem Simplício -
  Sistemas de informação - TG1-2.pdf`) e as regras de negócio definidas em
  `../CLAUDE.md`.
