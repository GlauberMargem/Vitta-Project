# Requisitos Não Funcionais

| Código | Descrição | Categoria | Como validar |
|---|---|---|---|
| RNF01 | Tempo de resposta < 2s para carregar páginas e gerar gráficos, mesmo em rede móvel lenta | Desempenho | Lighthouse mobile + teste em throttling 3G |
| RNF02 | Interface responsiva mobile-first (smartphone, tablet, desktop) | Usabilidade | Testar breakpoints Tailwind em cada tela nova |
| RNF03 | Conformidade com LGPD (Lei 13.709/2018); criptografia de dados sensíveis de saúde | Segurança/LGPD | Checklist LGPD antes de cada release; nunca logar valor de glicose em texto claro |
| RNF04 | Controle de acesso diferenciado paciente/médico; um perfil nunca acessa dados de outro sem autorização | Segurança | Toda query de dados clínicos deve filtrar por `patient_id` autenticado ou vínculo ativo |
| RNF05 | Acessível a usuários com baixo letramento digital / idosos: fontes legíveis, navegação intuitiva | Acessibilidade | Contraste AA, tap targets ≥ 44px, poucos passos por tela |
| RNF06 | Banco de dados escalável sem degradação de desempenho | Escalabilidade | Índices em `patient_id`, `measured_at` desde a criação das tabelas |
| RNF07 | Alta disponibilidade, indisponibilidade planejada < 1%/mês | Disponibilidade | Fora do controle direto do código; relevante na escolha de hospedagem (Vercel + Postgres gerenciado) |
| RNF08 | Código documentado e modular, mantendo manutenibilidade | Manutenibilidade | Sem comentários redundantes; nomes descritivos; funções pequenas e coesas |

Estas restrições valem para **toda** funcionalidade nova — não são um item isolado
do backlog, e sim critério de aceite implícito de cada RF.
