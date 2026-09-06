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
  circular à direita.
  ⚠️ **Desvio implementado**: sino de notificação não incluído — não existe
  sistema de notificação no MVP (ver `05-arquitetura.md`), um ícone decorativo
  sem função seria enganoso. Avatar com iniciais do nome, linkando pra
  `/userConfig`, foi implementado.

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

### Cadastro — etapa 2 (paciente)
"Próxima etapa! Preencha os campos com suas especificidades." · rótulo "Perfil
paciente" · campos: Data de nascimento, Tipo de diabetes (dropdown) · botão
"Finalizar cadastro"

### Home do paciente
"Bom dia! [Nome]" + horário no canto · card "Sua hemoglobina glicada está em X%" /
"Não desanime, nossa meta é de Y%" · seção "Ações" com botão "+" (nova glicose) e
ícone garfo/faca (nova refeição)

### Modal — Nova Glicose
"Nova Glicose" · "Digite o valor da sua glicose" · "Insira a hora da aferição da
glicose" · botão "Inserir glicose"

### Modal — Nova Refeição
"Nova Refeição" · "Buscar refeição já registrada" (dropdown) · "Quantidade de
carboidratos da refeição" · "Insira a hora da refeição" · botão "Inserir refeição"

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
