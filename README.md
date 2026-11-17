<p align="center">
  <img src="MyFinance.logo.jpg" alt="MyFinance" width="240">
</p>

# MyFinance

Aplicativo mobile para **iPhone** que reúne em um só lugar as movimentações dos bancos que você usa. Você exporta o
extrato em **OFX** no app do banco, importa no MyFinance e acompanha saldo, entradas, saídas e gastos por categoria,
mês a mês. Projeto pessoal, desenvolvido sem Mac e com custo zero (Windows + Expo Go + Supabase gratuito).

## Funcionalidades

- **Importação de extratos OFX**: abre o app Arquivos do iOS, lê o arquivo no próprio celular e envia ao banco.
- **Sem duplicidade**: o `FITID` de cada transação é único; importar o mesmo extrato duas vezes não repete nada.
- **Painel por mês**: setas ‹ › (ou toque nas barras do gráfico) trocam o mês. Mostra saldo total, entradas e saídas.
- **Gastos por categoria**: Comida, Transporte, Lazer e Bebidas são atribuídos automaticamente pelo nome do
  estabelecimento; as demais ficam como *Sem Categoria* até você escolher.
- **Categoria editável e permanente**: toque em uma transação para escolher a categoria; a escolha manual nunca é
  sobrescrita.
- **Evolução do patrimônio**: gráfico dos últimos 6 meses.
- **Modo privacidade**: dois botões de olho ocultam o **saldo** e os **valores das transações** (`•••••`). Os dois
  começam ocultos e voltam a ocultar sempre que o app é reaberto.

Fora do escopo: Open Finance/APIs bancárias, sincronização automática, publicação na App Store e versão Android.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Linguagens | TypeScript (TSX), SQL (PostgreSQL), JSON |
| Framework | React Native 0.88 com React 19, sobre **Expo SDK 58** |
| Navegação | React Navigation (`native-stack`), `react-native-screens`, `react-native-safe-area-context` |
| Banco de dados | **Supabase** (PostgreSQL na nuvem, plano gratuito) via `@supabase/supabase-js` |
| Arquivos | `expo-document-picker` (seletor) e `expo-file-system` (leitura do `.ofx`) |
| Interface | `expo-font` com a fonte **Manrope**, `expo-status-bar`, componentes nativos (`View`, `FlatList`, `Modal`) |
| Execução | **Expo Go** no iPhone, servidor Metro; **EAS** (`eas.json`) para builds |
| Qualidade | `typescript` (checagem de tipos com `npx tsc --noEmit`) |

Técnicas e conceitos aplicados:

- **Parser de OFX com expressões regulares**, aceitando OFX 1.x (SGML, sem tags de fechamento) e XML, e valores com vírgula.
- **Deduplicação no banco**: coluna `fitid` com `UNIQUE` e `upsert` com `ignoreDuplicates`.
- **Categorização por palavras-chave** com normalização de texto (remoção de acentos, caixa e pontuação), em
  `src/lib/categorization.ts`.
- **Segurança em nível de linha (RLS)** do PostgreSQL, com políticas explícitas de leitura, inclusão e alteração.
- **Gravação confirmada**: a categoria só muda na tela depois que o banco confirma a atualização.
- **Hooks do React** (`useState`, `useMemo`, `useCallback`) e `useFocusEffect`; estado derivado do mês selecionado.
- **Paginação** das consultas (páginas de 1.000 linhas) e importação em lotes de 500.
- **Componentização**, camadas separadas (`lib`, `services`, `components`, `screens`) e tipagem estática.
- **Variáveis de ambiente** (`EXPO_PUBLIC_*`) para as chaves, fora do código.

Observação: o `expo-sqlite` está instalado (e listado em `app.json`), mas **nenhum arquivo o utiliza**. Pode ser
removido com `npm uninstall expo-sqlite` e apagando `"expo-sqlite"` da lista `plugins` do `app.json`.

## Estrutura do repositório

```
MyFinance/
├── README.md
├── MyFinance.logo.jpg
└── myfinance/                      # projeto Expo (rode os comandos aqui dentro)
    ├── App.tsx                     # entrada: carrega a fonte e define a navegação
    ├── app.json                    # configuração do Expo
    ├── eas.json                    # perfis de build do EAS
    ├── package.json / package-lock.json
    ├── tsconfig.json
    ├── .env.example                # modelo das variáveis (copie para .env)
    ├── assets/fonts/               # Manrope (4 pesos)
    ├── supabase/
    │   ├── schema.sql              # cria a tabela do zero (use em projeto novo)
    │   └── migracao.sql            # atualiza uma tabela antiga (coluna categoria_manual + permissões)
    └── src/
        ├── theme/                  # cores, fontes e sombra
        ├── constants/categories.ts # categorias e suas cores
        ├── types.ts                # tipos Transaction, NewTransaction, ImportResult
        ├── navigation/types.ts     # rotas
        ├── lib/                    # supabase, ofxParser, categorization, summary, format
        ├── services/               # transactions (banco) e ofxFile (seleção/leitura do arquivo)
        ├── components/             # MonthSelector, SummaryCard, CategoryBreakdown, EvolutionChart,
        │                           # TransactionItem, CategoryModal, PrivacyToggle
        └── screens/                # DashboardScreen e ImportScreen
```

## Como rodar (passo a passo)

### 1. Pré-requisitos

- **Node.js** (versão LTS) e **Git** instalados no computador.
- **Expo Go** instalado no iPhone (App Store).
- Conta gratuita no **Supabase** (supabase.com) e conta gratuita no **Expo** (expo.dev).
- Computador e iPhone na **mesma rede Wi-Fi**.

### 2. Baixar e instalar

```bash
git clone <URL-DO-SEU-REPOSITORIO>
cd MyFinance/myfinance
npm install
```

### 3. Criar o banco no Supabase

1. Crie um projeto novo no Supabase.
2. Abra **SQL Editor → New query**, cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**.
   (Se você já tinha a tabela de uma versão anterior, rode `supabase/migracao.sql` no lugar.)
3. Em **Project Settings → API**, copie a **Project URL** (formato `https://xxxxxxxx.supabase.co`) e a chave
   **anon** (ou *publishable*). Nunca use a chave `service_role`/*secret* no app.

### 4. Configurar as variáveis

```bash
cp .env.example .env        # no Windows (PowerShell): copy .env.example .env
```

Abra o `.env` e preencha as duas linhas, sem aspas e sem espaços ao redor do `=`:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave
```

### 5. Iniciar o app

```bash
npx expo login              # entre na mesma conta Expo que está logada no Expo Go do iPhone
npx expo start -c
```

Escaneie o QR Code com a câmera do iPhone para abrir no Expo Go. Se a rede bloquear a conexão, use
`npx expo start --tunnel`. O Expo só lê o `.env` ao iniciar; se mudar o arquivo, reinicie com `-c`.

### 6. Usar

1. Baixe o extrato em **OFX** no site ou app do banco e deixe-o no iPhone (app Arquivos).
2. No MyFinance, toque em **Importar extrato OFX** e escolha o arquivo. O app informa quantas transações são novas
   e quantas já existiam.
3. No painel, use as setas para escolher o mês, veja o gráfico e os gastos por categoria.
4. Toque em uma transação para definir a categoria.
5. Use os botões de olho para ocultar ou mostrar o saldo e os valores.

## Solução de problemas

| Sintoma | Causa provável e solução |
|---|---|
| "signed in to Expo Go as X, but not signed in to Expo CLI" | O iPhone exige a mesma conta nos dois lados. Rode `npx expo login` e reinicie o servidor. |
| `Invalid API key` | Chave errada ou colada incompleta no `.env`. Confira também se não existe um `.env.local` com valores antigos (ele tem prioridade). Reinicie com `npx expo start -c`. |
| `fetch failed: Could not connect to the server` | A `EXPO_PUBLIC_SUPABASE_URL` está vazia ou errada (deve terminar em `.supabase.co`, não ser a URL do painel). |
| A categoria "volta" ao recarregar, ou aparece aviso pedindo a migração | Rode `supabase/migracao.sql` no SQL Editor. |
| Erros de versão do Metro/Expo após instalar pacotes | `npx expo install --fix`. |
| Painel zerado | Selecione, nas setas, o mês do extrato importado. |

## Banco de dados

Tabela `transacoes`: `id`, `fitid` (único), `data_transacao`, `valor` (negativo = saída), `descricao`, `categoria`
e `categoria_manual` (marca as categorias escolhidas à mão).

## Segurança

O app usa a chave **anon**, que fica embutida no aplicativo, e as políticas do `schema.sql` liberam leitura, inclusão
e alteração da tabela para quem tiver essa chave. Para uso pessoal, com o projeto privado, costuma bastar. Para algo
mais robusto, ative o login do Supabase (Auth) e restrinja as políticas ao seu usuário.

**Nunca envie o arquivo `.env` ao GitHub.** O `.gitignore` já o ignora; só o `.env.example` é versionado. Se uma chave
for exposta, gere outra em *Project Settings → API Keys*.

## Instalar de forma permanente no iPhone

No dia a dia, o **Expo Go** é o caminho gratuito e sem expiração. O `eas build` para um iPhone de verdade exige conta
paga da Apple (US$ 99/ano); o perfil `preview` do `eas.json` gera um app para o **simulador do Mac**, que não instala
em iPhone. Uma alternativa gratuita é compilar um `.ipa` sem assinatura e instalá-lo com o Sideloadly usando um Apple
ID gratuito (o app precisa ser reinstalado a cada 7 dias). Se for assim, defina `ios.bundleIdentifier` no `app.json`.

## Limitações conhecidas

- O "saldo total" é a soma das transações importadas, não o saldo real da conta; importe desde o início do histórico
  para bater com o banco.
- Se dois bancos gerarem o mesmo `FITID`, o segundo lançamento seria ignorado (raro).
- Alguns bancos exportam OFX em Latin-1 e acentos podem aparecer trocados.
- Pix para pessoas não traz nome de estabelecimento e fica em *Sem Categoria* até a escolha manual.

## Verificação

```bash
cd myfinance
npx tsc --noEmit                         # checa os tipos
npx expo export --platform ios           # confirma que o app empacota
```

## Paleta

| Uso | Cor |
|---|---|
| Verde profundo (topo) | `#06231D` |
| Esmeralda (destaque) | `#1F9A74` |
| Dourado (ações) | `#E3B75A` |
| Fundo | `#F3F6F4` |
| Branco (cartões) | `#FFFFFF` |
