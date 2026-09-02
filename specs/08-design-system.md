# Design System — Template de Referência

Extraído das imagens de protótipo enviadas pelo Glauber (telas de login/cadastro,
dashboard, gráficos, perfil, modais, e a folha de estilo "Cores/logo/configurações").
Estes valores são a fonte de verdade visual — implementar exatamente como descrito
aqui, sem inventar variações.

## Cores

| Papel | Nome | Hex | Uso |
|---|---|---|---|
| Fundo principal | Lavanda muito clara | `#F6F5FA` | base neutra, evita branco puro |
| Primária | Verde-menta suave | `#B8E4C9` | vitalidade, saúde, calma |
| Secundária | Azul serenity | `#A7C7E7` | clareza mental, confiança |
| Tons de apoio | Pêssego pastel | `#FFD6A5` | calor humano, energia suave |
| Atenção/ação | Coral leve | `#FFB5A7` | destaque para botões ou status |
| Texto principal | Cinza grafite suave | `#3D3D3D` | contraste equilibrado |
| Texto secundário | Cinza médio | `#6B6B6B` | descrições e legendas |

⚠️ A folha de referência não define uma cor específica para os alertas de
hipo/hiperglicemia (RF05). Ao implementar RF05, perguntar se deve reutilizar
`#FFB5A7` (Atenção/ação) ou se é necessária uma cor própria.

## Tipografia (confirmado)

- **Logo / títulos**: Poppins (SemiBold para destaque).
- **Texto / corpo**: Inter.

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
- Modais sobrepõem a tela com fundo escurecido, card branco central, "X" no canto
  superior direito para fechar.
- Cabeçalho do app logado: logo "vitta" à esquerda, sino de notificação + avatar
  circular à direita.

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

### Perfil (2 sub-telas)
Sub-tela 1 (dados pessoais): avatar, Nome completo, Senha (mascarada), Data de
nascimento, Tipo de diabetes. Sub-tela 2 mostra CPF (`123.123.123-12`), um campo
em branco, Data de nascimento, Tipo de diabetes — os campos repetidos/em branco
são placeholder do mockup, não representam campos reais adicionais. Seguir a
separação "dados pessoais" vs "dados clínicos" já definida em
`06-fluxos-e-telas.md` como estrutura real das duas sub-telas.
