# Sistema Vitta

Aplicação web para registro e monitoramento de glicemia, apoiando a autogestão do
Diabetes Mellitus pelo paciente e o telemonitoramento assistido pelo médico. Projeto de
TCC (UniRios) de Glauber Lima Margem Simplício — a monografia (TG-I) descreve
fundamentação teórica, requisitos e protótipo; a implementação (TG-II) é este repositório.

## Regras de colaboração

- Linguagem simples e direta nas respostas.
- Nunca usar emojis.
- Se algo pedido estiver fora do escopo definido nas specs, explicar de forma
  simples o porquê e perguntar antes de agir — não expandir escopo por conta própria.
- Nunca inventar informação (endpoint, biblioteca, comportamento, valor). Se não
  souber ou não estiver documentado nas specs/monografia, perguntar ao Glauber.

## Stack obrigatória

- **Next.js** (App Router) — frontend + backend unificados (API Routes), SSR.
- **React** para componentização de UI.
- **TypeScript** em toda a base de código nova — tipagem estática obrigatória.
  `tsconfig.json` já configurado (`strict: true`). As páginas/componentes antigos
  em `.js`/`.jsx` (bootstrap do create-next-app) ainda não foram migrados; migrar
  para `.tsx` ao tocar nesses arquivos, não manter o padrão antigo em código novo.
  ⚠️ Versão do TypeScript **fixada em `5.9.3`** (`--save-exact`). A versão
  `latest` do npm hoje é a `7.x` (reescrita nativa do compilador), que não tem
  mais o arquivo `typescript/lib/typescript.js` — o Next.js 16.1.1 depende
  desse arquivo pra detectar TypeScript e quebra o build sem ele (erro
  genérico `The "id" argument must be of type string`). Não rodar
  `npm update typescript` sem checar compatibilidade antes.
- **Tailwind CSS** para toda a estilização (utilitário, mobile-first). Não introduzir
  outra abordagem de estilização (CSS-in-JS, Sass, etc.).
- **PostgreSQL** para persistência (dados clínicos e de perfis). Banco local
  `vitta_dev` já criado (serviço Windows `postgresql-x64-17`). ORM: **Prisma 7**,
  já configurado com o driver adapter `@prisma/adapter-pg` (ver
  `specs/05-arquitetura.md`).
- **NextAuth/OAuth** para autenticação. Ainda não configurado — falta Client
  ID/Secret do Google.
- Componentes de UI seguem o padrão shadcn/ui (`components.json`, `src/components/ui`,
  `class-variance-authority`, `tailwind-merge`, `lucide-react` para ícones).
- Hospedagem alvo: Vercel.

## Estrutura atual do projeto

```
src/app/            rotas (App Router): /, /dashboard, /login, /userConfig
src/components/      Navbar, Header, e src/components/ui (shadcn)
src/lib/utils.js     helpers (cn, etc.)
src/lib/db/client.ts singleton do Prisma Client (com driver adapter)
src/generated/prisma client do Prisma gerado (não editar à mão, não commitado)
prisma/schema.prisma  schema do banco — ver specs/04-modelo-de-dados.md
```

Ainda não existem: autenticação real (NextAuth), diferenciação de perfis
paciente/médico nas rotas, API Routes, formulários de registro de
glicose/refeição, gráficos, cálculo de HbA1c.

## Dois perfis de usuário — regras de negócio

### Paciente
- Interface mobile-first, focada em reduzir carga cognitiva (Heurísticas de Nielsen,
  Modelo de Fogg: motivação + capacidade + gatilho).
- Registro de glicose: valor (mg/dL), data, horário, contexto (jejum, pós-prandial,
  antes de dormir) — via modal simples sobre a tela, sem navegação.
- Registro de refeição: busca de refeição cadastrada ou carboidratos + horário.
- Dashboard: estimativa de HbA1c (média dos últimos 90 dias) em destaque, com meta
  clínica de referência; gráfico de tendência glicêmica (diária/semanal/mensal).
- Alertas visuais automáticos quando um registro estiver fora dos limites de
  hipo/hiperglicemia configurados.
- Feedbacks motivacionais com base na consistência dos registros.
- Autonomia total sobre os próprios dados. Vínculo a um médico é **opcional**, via
  código de convite — o app deve funcionar plenamente sem vínculo.

### Médico
- **Somente leitura/anotação** sobre dados clínicos do paciente: nunca pode inserir
  ou alterar registros de glicose/refeição do paciente. Pode adicionar anotações
  clínicas próprias vinculadas ao histórico do paciente.
- Painel centralizado com lista de pacientes vinculados; indicadores visuais para
  pacientes em risco glicêmico (fora dos limites de referência).
- Geração de relatórios glicêmicos exportáveis em PDF.
- Acesso a um paciente só existe após vínculo por código de convite — nunca por
  busca livre de pacientes.

## Segurança e privacidade (não negociável)

- Dados de glicemia/saúde são "dados sensíveis" sob a LGPD (Lei 13.709/2018):
  finalidade, necessidade e segurança devem guiar toda decisão de modelagem.
- **Privacy by design**: controle de acesso deve isolar paciente e médico desde o
  schema do banco — um perfil nunca acessa dados de outro sem autorização explícita
  (vínculo por convite).
- Autenticação via NextAuth/OAuth; nunca implementar autenticação própria "na mão".
- Criptografar dados sensíveis em repouso quando aplicável.

## Requisitos não funcionais a manter em mente

- Tempo de resposta < 2s, mesmo em conexão móvel lenta (RNF01).
- Responsivo mobile-first, para desktop/tablet também (RNF02).
- Acessível a usuários com baixo letramento digital / idosos: fontes legíveis,
  navegação intuitiva, poucos passos por tela (RNF05).
- Código modular e documentado o suficiente para manutenção futura (RNF08) — sem
  comentários redundantes, só o que não é óbvio pelo nome/estrutura.

## Diretrizes de UX

- Minimalismo: cada tela expõe só os campos essenciais (ex.: tela de login só
  e-mail/senha + login social).
- Onboarding progressivo: cadastro em duas etapas (dados gerais → dados específicos
  do perfil paciente/médico), nunca um formulário longo único.
- Ações frequentes (registrar glicose/refeição) devem ser alcançáveis em poucos
  toques a partir da home.
- Gráficos como ferramenta clínica, não decoração — priorizar leitura rápida de
  tendências (ex.: gráfico de área) sobre estética pura.
