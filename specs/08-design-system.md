# Design System — Template de Referência

**Revisado em 2026-09-06**: extração refeita a partir do Figma real (telas de
Login e Cadastro), gerada com apoio de outra IA (Gemini) e confirmada com o
Glauber, substituindo a paleta/tipografia/raio de borda da versão anterior
deste documento (baseada em capturas de tela do protótipo, menos precisa).
Dashboard, gráficos, modais e perfil não foram re-extraídos do Figma — só
receberam a paleta/tipografia/raio novos por serem tokens globais; a
composição/estrutura desses telas (cards, seções, textos) continua a mesma
da extração anterior, ainda válida.

## Cores

| Papel | Hex | Uso |
|---|---|---|
| Fundo principal | `#F8F9FA` | base neutra, evita branco puro |
| Primária | `#6993C5` | botões de ação principal (Login, Próxima etapa) |
| Fundo diagonal (login/cadastro) | `#C8E1FF` | forma decorativa atrás do card |
| Secundária | `#B8E4C9` (verde-menta) | botão de finalização positiva (Finalizar cadastro) — não coberta pela extração do Gemini (só viu telas com 1 botão), mantida da versão anterior |
| Tons de apoio | `#FFD6A5` (pêssego pastel) | destaques secundários — idem, mantida da versão anterior |
| Atenção/ação | `#FFB5A7` (coral leve) | destaque para botões ou status — idem, mantida da versão anterior |
| Texto principal | `#2D2D2D` | contraste equilibrado |
| Texto secundário | `#9CA3AF` | descrições, legendas, placeholders |
| Bordas (inputs, divisores) | `#D1D5DB` | |

Cor do alerta de hipo/hiperglicemia (RF05, `#FFB5A7`), verde de finalização
(`#B8E4C9`) e pêssego de destaque (`#FFD6A5`) não fazem parte da extração do
Gemini — ele só analisou Login/Cadastro, que têm só o botão azul principal.
Mantidos sem alteração da versão anterior deste documento.

**Fundo da área logada**: `#F2ECDE` (bege), não o `#F8F9FA` global — decisão
do Glauber em 2026-09-06, pouco contraste entre `#F8F9FA` e os cards brancos
no dashboard. Aplicado só em dashboard/perfil via `src/components/AppMain.tsx`
(componente compartilhado que também reproduz a faixa diagonal azul clara
`#C8E1FF` do login/cadastro atrás do conteúdo do topo). Login/cadastro
continuam com `#F8F9FA` — fora do escopo dessa mudança.

### Implementado em `src/app/globals.css` (tokens shadcn)

| Token shadcn | Cor da paleta | Observação |
|---|---|---|
| `--background` | `#F8F9FA` | |
| `--foreground` | `#2D2D2D` | |
| `--card` / `--popover` | `#FFFFFF` | |
| `--primary` | `#6993C5` | botões de ação principal |
| `--primary-foreground` | `#FFFFFF` | texto branco nos botões, confirmado com o Glauber em 2026-09-06 |
| `--secondary` | `#B8E4C9` (verde-menta) | botão de finalização positiva (Finalizar cadastro) |
| `--secondary-foreground` | `#FFFFFF` | idem, texto branco |
| `--accent` | `#FFD6A5` (pêssego pastel) | destaques secundários |
| `--muted-foreground` | `#9CA3AF` | texto secundário/placeholder |
| `--border` / `--input` | `#D1D5DB` | bordas de input e divisores |
| `--ring` | `#6993C5` | anel de foco reaproveitando a cor primária |
| `--radius` | `0.5rem` (era `1rem`) | bate com o `rounded-lg` (8px) observado no Figma |

⚠️ **Contraste abaixo do AA, aceito conscientemente**: texto branco sobre
`#6993C5` dá ~3.2:1 — abaixo do mínimo AA de 4.5:1 pra texto normal (WCAG),
o que em tese conflita com RNF05. Eu tinha optado por texto escuro por
acessibilidade; o Glauber pediu branco de volta em 2026-09-06 ("com preto
fica muito feio", como no protótipo) — decisão de identidade visual dele,
mantida.

## Cursor dos botões

Todo botão (`src/components/ui/button.tsx`) usa `cursor-pointer` (e
`disabled:cursor-not-allowed` quando desabilitado) — pedido do Glauber em
2026-09-06. Como só existe um componente `Button` compartilhado no projeto
(nenhum `<button>` nativo solto em nenhuma tela), a mudança nesse arquivo
já cobre o app inteiro.

## Raio de borda

Todo o app passou a usar `rounded-lg` (8px) em cards, botões, inputs,
diálogos e badges — antes usava `rounded-3xl`/`rounded-2xl`/`rounded-full`
(mais arredondado, baseado na leitura anterior do protótipo). Decisão do
Glauber em 2026-09-06: aplicar o raio mais quadrado observado no Figma real
em tudo, não só nas telas de login/cadastro que o Gemini analisou.
**Exceção mantida**: os indicadores de página (dots de paginação em
Cadastro e Perfil, `size-1.5`) continuam `rounded-full` — são indicadores de
status/progresso, não cards ou botões, e num elemento de 6px o raio de 8px
já produz um círculo de qualquer forma (não haveria diferença visual).

## Tipografia (revisado)

- **Todo o app (títulos e corpo)**: Poppins (pesos 400/500/600/700).
  Decisão técnica: a fonte Inter (usada só no corpo antes) foi removida do
  carregamento — como o `font-family` agora prioriza Poppins em tudo, Inter
  nunca seria de fato renderizado (só serviria de fallback pra glifos que o
  Poppins não tem, o que não acontece em português), então mantê-la carregada
  seria peso morto contra o RNF01 (resposta rápida em conexão lenta).
- **Área logada (dashboard, modais, perfil)**: campos de formulário e texto
  de apoio usam Quicksand (pesos 400/500/600) em vez de Poppins — token
  `--font-support` (classe `font-support`), adicionado em 2026-09-06 a
  pedido do documento de especificação da área logada. Aplicado só como
  `className` explícito nos `Input`/`Label`/`SelectTrigger` de
  `NovaGlicoseDialog.tsx`, `NovaRefeicaoDialog.tsx` e dos formulários de
  perfil/médico — **não** nos componentes `Input`/`Label` compartilhados,
  porque esses também são usados em login/cadastro, que continuam só
  Poppins (não fizeram parte desse documento e já tiveram tipografia
  confirmada numa rodada anterior).

## Logo

Wordmark "vitta" em minúsculas, peso bold, cor `#3D3D3D` (texto principal). Símbolo
"V" com gradiente verde-menta (`#B8E4C9`) → azul serenity (`#A7C7E7`), pontas
arredondadas. Tagline da marca: "um convite à mudança" (usada em material de
marca/apresentação — confirmar se aparece dentro do produto ou só fora dele).

## Padrões de componente observados no protótipo

- Cards com cantos bem arredondados (`rounded-2xl`/`rounded-3xl`), fundo branco
  sobre o fundo lavanda/azul da tela.
- Fundo de tela com forma diagonal em azul claro atrás do card principal (ver
  telas de login e cadastro).
- Botão primário: azul serenity sólido, texto branco, cantos arredondados (ex.:
  "Login", "Próxima etapa").
- Botão de finalização positiva: verde, texto branco (ex.: "Finalizar cadastro").
- Navegação inferior fixa com 3 ícones: casa (Home), gráfico de linha (Gráficos),
  pessoa com engrenagem (Perfil).
  ⚠️ **Desvio implementado** (pós-homologação, 2026-09-05): reduzida pra 2
  ícones (Início, Perfil) — nunca existiu uma rota separada de "Gráficos", o
  gráfico sempre esteve embutido no dashboard (Sprint 3), então o terceiro
  ícone apontava pra um destino duplicado do de "Início". Ver `07-roadmap.md`,
  bloco 9.
- Modais sobrepõem a tela com fundo escurecido, card branco central, "X" no canto
  superior direito para fechar.
- Cabeçalho do app logado: logo "vitta" à esquerda, sino de notificação + avatar
  circular à direita. Avatar com iniciais do nome, linkando pra `/userConfig` —
  implementado desde o início. Sino de notificação implementado em
  2026-10-12 (ver seção "Sistema de notificações" abaixo) — até então ficava
  de fora por não existir conteúdo nenhum pra notificar; passou a existir
  quando o card de motivação (RF12) e o de tendência (RF13) viraram
  notificações em vez de cards fixos no dashboard.

### Sistema de notificações (2026-10-12)

Pedido do Glauber: os cards de motivação (RF12) e de tendência de glicose
(RF13), que antes ficavam sempre visíveis no topo do dashboard, viraram
notificações acessadas pelo sino no `Header` — abrem numa sobreposição
(`Dialog` do shadcn, mesmo padrão visual dos modais de Nova
Glicose/Refeição: fundo escurecido, painel central) em vez de ocupar espaço
fixo na tela. Um ponto vermelho no sino (`bg-destructive`) indica quando há
alerta de tendência ativo — a mensagem motivacional sempre existe (RF12
nunca retorna vazio) então não teria sentido ela sozinha acionar o ponto.

Calculado no `Header.tsx` (não mais em `dashboard/page.tsx`), porque o
Header aparece em toda a área logada — não só no dashboard — e as duas
mensagens existem só pro paciente. `MotivacaoCard.tsx`/
`AlertaTendenciaCard.tsx` foram removidos (não sobrou nenhum lugar que
ainda os use).

**Transparência do alerta de tendência** (RF13, pedido do Glauber): antes a
notificação só dizia "sua glicose costuma subir de manhã", sem nenhuma
base. Agora `detectGlucoseTrend` (`src/lib/patient/trend.ts`) também
devolve a média do período apontado, a média geral da janela, e a lista das
medições que entraram nessa conta — a notificação mostra a explicação
numérica (`trendAlertDetail`) e até 6 medições específicas (data + horário
+ valor), com "e mais N medições" se passar disso.

O rodapé das telas de login/cadastro **não** deve usar "powered by Limen" (isso
era só marca d'água da ferramenta de protótipo). No lugar, usar um texto de
atribuição: projeto feito por Glauber Margem como trabalho de conclusão de curso
no UniRios. Redação exata do texto ainda não definida — ao implementar, propor uma
versão curta e confirmar.

## Textos exatos das telas (copiar literalmente, não parafrasear)

### Login
"Email" / "Digite seu email" · "Senha" / "Digite sua senha" · "Esqueci minha
senha" · botão "Login" · "Outras formas de login" (Google) · "Não possui uma
conta? Cadastre-se aqui"

### Cadastro — etapa 1
"Começando com o Vitta!" / "Preencha os campos com seus dados pessoais." · campos:
Nome completo, Email, Senha, Confirmar senha, seletor "Paciente/Médico" · botão
"Próxima etapa"

### Cadastro — etapa 2 (médico)
"Próxima etapa! Preencha os campos com seus documentos." · rótulo "Perfil médico"
· campos: CRM, RQE (dropdown) · botão "Finalizar cadastro"

Ilustração de uma médica (`doctor-pana.svg`, Storyset) adicionada acima dos
campos em 2026-09-06, com o crédito exigido pela licença abaixo dela — ver
`05-arquitetura.md`, seção "Ilustrações de terceiros exigem crédito visível".

⚠️ **Desvio implementado**: as telas reais de cadastro (Figma) não repetem a
logo/wordmark "vitta" dentro do card — só a etapa 1 tinha isso na versão
anterior deste documento (herdada da tela de login). Removida do card de
cadastro em 2026-09-06, mantida apenas no login. Ilustração da médica também
aumentada (`h-32` → `h-48`) pra bater com a proporção maior vista no Figma.

Ajuste fino em 2026-09-06: título do cadastro (`text-lg` → `text-base`) e
subtítulos de cada etapa (`text-sm` → `text-xs`) reduzidos, e a ilustração do
paciente aumentada (`h-48` → `h-64`) — o SVG `medical-care-rafiki.svg` tem
mais espaço vazio ao redor dos personagens que o `doctor-pana.svg`, então na
mesma altura ela parecia bem menor. Ilustração do médico segue em `h-48`.

### Cadastro — etapa 2 (paciente)
"Próxima etapa! Preencha os campos com suas especificidades." · rótulo "Perfil
paciente" · campos: Data de nascimento, Tipo de diabetes (dropdown) · botão
"Finalizar cadastro"

Ilustração (`medical-care-rafiki.svg`, Storyset) adicionada acima dos campos em
2026-09-06, mesmo padrão da etapa do médico: crédito exigido pela licença
abaixo dela — ver `05-arquitetura.md`, seção "Ilustrações de terceiros exigem
crédito visível".

### Home do paciente
"Bom dia! [Nome]" + horário no canto · card "Sua hemoglobina glicada está em X%" /
"Não desanime, nossa meta é de Y%" · seção "Ações" com botão "+" (nova glicose) e
ícone garfo/faca (nova refeição)

Hierarquia visual do card de HbA1c (ajustado em 2026-09-06 pra bater com a
referência): "Sua" e "está em" em preto (`text-foreground`), "hemoglobina
glicada" em verde fixo (`#4CAF50`), tudo em negrito (`text-xl font-bold`); o
percentual em si (`X%`) em destaque bem maior, `text-4xl font-extrabold`,
linha própria. Abaixo, a frase da meta em texto pequeno e neutro
(`text-muted-foreground`), só o percentual da meta em verde fixo e
semi-negrito. `#4CAF50` (verde) e `#FFD6A5` (pêssego pastel, já existente na
paleta) são cores escolhidas por aproximação visual da referência mandada
pelo Glauber — confirmar/ajustar o tom exato depois de ver renderizado.

**Degradê de cor do percentual** (RF11, pedido do Glauber em 2026-09-06):
diferente do resto do card, a cor do número (`X%`) não é fixa — interpola
de verde (`#4CAF50`, na meta de 7% ou melhor) até laranja pastel (`#FFD6A5`,
a partir de 10%, referência de alto risco da ADA com margem de transição),
linear entre os dois extremos. Implementado em `hba1cColor()`
(`src/lib/patient/glucose.ts`), usado só no `HbA1cCard.tsx` do próprio
paciente — a view do médico sobre um paciente continua neutra (texto
`text-foreground` fixo), fora do pedido original.

O alerta de tendência (RF13, só existe quando a regra é satisfeita — ver
`02-requisitos-funcionais.md`) e a mensagem de motivação (RF12) **não** são
mais cards fixos do dashboard — viraram notificações no sino do `Header`
desde 2026-10-12. Ver "Sistema de notificações", acima, e
`src/lib/patient/trend.ts`.

**Saudação + horário** (implementado em 2026-10-10): "Bom dia!"/"Boa
tarde!"/"Boa noite!" varia de acordo com a hora atual (antes era sempre
"Bom dia!" fixo) + horário no canto direito, atualizado a cada 30s. Hora
calculada no cliente (`src/components/GreetingHeader.tsx`, `useEffect`),
não no servidor — pra bater com o relógio local do usuário, não o fuso de
onde o servidor roda. Usado tanto no dashboard do paciente quanto no do
médico. Texto em `text-foreground/70` (não `text-muted-foreground`) —
ajustado em 2026-10-12, contraste insuficiente contra a faixa diagonal azul
clara do `AppMain` (o token `text-muted-foreground` foi calibrado pra cima
de fundo branco/bege, não do azul da faixa).

### Modal — Nova Glicose
"Nova Glicose" · "Digite o valor da sua glicose" · rótulo do campo de horário
"Que horas você mediu?" (trocado de "Insira a hora da aferição da glicose"
em 2026-09-06, copy mais informal proposta no documento da área logada) ·
"Vincular a uma refeição (opcional)" (RF14, só aparece se houver refeições
recentes) · botão "Inserir glicose"

Opções do dropdown "Contexto": "Jejum" · "Depois de comer" (trocado de
"Pós-prandial" em 2026-09-06 — termo clínico difícil pra público com baixo
letramento digital/idosos, RNF05) · "Antes de dormir" · "Outro". O valor
salvo no banco continua `POS_PRANDIAL` (nome interno, não muda) — só o texto
exibido mudou, em `contextLabel()` (`src/lib/patient/format.ts`), usado
também no histórico e no relatório em PDF.

### Modal — Nova Refeição
"Nova Refeição" · "Buscar refeição já registrada" (dropdown) · "Quantidade de
carboidratos da refeição" · "Insira a hora da refeição" · "Vincular a uma
glicose (opcional)" (RF14, só aparece se houver glicoses recentes) · botão
"Inserir refeição"

### Prompt de sugestão de refeição (RF14)
Aparece só depois de salvar uma glicose sem vínculo escolhido e sem refeição
próxima (±2h): "Que tal registrar sua refeição?" / "Você comeu alguma coisa
nas últimas 2 horas? Vamos registrar isso também!" · botões "Agora não" e
"Sim, registrar" (abre o modal de Nova Refeição com o vínculo já
pré-selecionado).

### Gráficos
"Glicemia ao longo da semana" · gráfico de área, eixo Y em mg/dL (50 a 500), eixo
X com dias da semana abreviados (Seg, Ter, Qua, Qui, Sex)

⚠️ **Desvio deliberado**: implementado com os 7 dias da semana (Seg a Dom), não
só os 5 listados acima. O mockup provavelmente só tinha espaço visível para 5
rótulos na captura de tela — glicemia de fim de semana é tão relevante quanto
a de dia útil, não faz sentido omitir do gráfico.

### Perfil (2 sub-telas)
Sub-tela 1 (dados pessoais): avatar, Nome completo, Senha (mascarada), Data de
nascimento, Tipo de diabetes. Sub-tela 2 mostra CPF (`123.123.123-12`), um campo
em branco, Data de nascimento, Tipo de diabetes — os campos repetidos/em branco
são placeholder do mockup, não representam campos reais adicionais. Seguir a
separação "dados pessoais" vs "dados clínicos" já definida em
`06-fluxos-e-telas.md` como estrutura real das duas sub-telas.

**Avatar** (implementado em 2026-10-10): círculo grande (`size-20`) com as
iniciais do nome, centralizado acima do título "Perfil", mesmo padrão de cor
do avatar pequeno do Header (`bg-primary`/`text-primary-foreground`). Decisão
do Glauber: ilustração genérica a partir das iniciais, sem upload de foto
real — upload exigiria armazenamento de arquivo e campo novo no banco, fora
do escopo definido. Helper `initials()` extraído de `Header.tsx` pra
`src/lib/utils.ts`, reaproveitado nos dois lugares.
