# CRM Engenheiro Civil — TED 03

API para autenticação de engenheiros, cadastro de clientes e projetos, diários de obra e arquivos versionados.
Os endpoints implementados são exercitados pela coleção Postman e pelo smoke; orçamento e WhatsApp ainda não têm fluxo funcional.
Stack: Node.js/CommonJS, Express 4, Prisma 6, PostgreSQL, JWT, bcrypt e multer; front React 18 com Vite 5.

Equipe: Gustavo Barros Martins, Hugo Alexandre Carvalho Coelho Coutinho, Jeferson Machado dos Santos e Maicon de Sousa Pontes.

## Pré-requisitos e instalação

Use Node.js 22 ou superior, npm, Git, Docker Engine e Docker Compose v2. O Dockerfile usa Node 22 e PostgreSQL 16 no Compose; `package.json` não declara `engines`.

Em uma máquina limpa, execute na ordem abaixo. Copie o modelo antes do Compose: a configuração da API exige `JWT_SECRET`. Se já existir `.env`, preserve-o.

```bash
git clone https://github.com/ggstv-dl/Sistema-de-Engenharia.git
cd Sistema-de-Engenharia
cp .env.example .env
```

Ajuste o `.env`, especialmente o segredo JWT e a conexão do banco. Depois suba apenas o banco no Docker e execute a API no host:

```bash
docker compose up -d db
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Aguarde o banco ficar saudável antes da migration. API em `http://localhost:3000`. Esse roteiro usa `db:migrate` conforme o script existente (`prisma migrate dev`); o seed é exclusivo de desenvolvimento e redefine as senhas das contas demo.

Alternativa com API também no container: após configurar `.env`, use `docker compose up -d --build` e `docker compose exec api npm run db:seed`. O Compose aplica as migrations com `prisma migrate deploy` ao iniciar a API. Nesse modo não execute a API no host na mesma porta. O Compose atual não monta volume de uploads nem repassa `UPLOAD_DIR`/`MAX_FILE_SIZE_MB`: o container usa os padrões e arquivos podem ser perdidos ao recriá-lo.

### Variáveis do ambiente

| Variável | Comportamento atual |
|---|---|
| `PORT` | Porta da API; padrão 3000. |
| `POSTGRES_USER` | Usuário criado pelo Compose; modelo `crm`. |
| `POSTGRES_PASSWORD` | Senha do banco no Compose; modelo `crm_local_dev`, somente desenvolvimento. |
| `POSTGRES_DB` | Banco do Compose; modelo `crm_engineer_civil`. |
| `POSTGRES_PORT` | Porta do banco publicada em 127.0.0.1; padrão 5432. |
| `DATABASE_URL` | Conexão Prisma; no host usa localhost e a porta publicada. O Compose usa o hostname `db` para sua API. |
| `JWT_SECRET` | Obrigatório para iniciar a API; troque o valor de exemplo. |
| `JWT_EXPIRES_IN` | Padrão `8h`; aceita duração como `30m` ou número de segundos. Valor inválido impede inicialização. |
| `CORS_ORIGIN` | Origem permitida; padrão `http://localhost:5173`; aceita origens separadas por vírgula. |
| `UPLOAD_DIR` | Padrão `uploads`; caminho absoluto resolvido a partir do diretório de execução e criado na inicialização. |
| `MAX_FILE_SIZE_MB` | Padrão 10; valores não numéricos, não finitos ou não positivos usam 10. |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_API_URL` | Reservadas; o código atual não implementa o provedor. |
| `NODE_ENV` | `production` altera o formato do log HTTP. Opcional, embora não conste no modelo. |

Nunca versione `.env`, tokens ou arquivos recebidos. Mudou `POSTGRES_PORT` para rodar a API no host? Ajuste também `DATABASE_URL`. Credenciais de um volume PostgreSQL existente não são redefinidas só por mudar o `.env`.

### Front

Em outro terminal:

```bash
cd front-login
npm install
cp .env.example .env
```

Configure nesse arquivo:

```dotenv
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK=false
```

Se existir `.env.local`, ele tem precedência e precisa conter os mesmos valores. Inicie com `npm run dev` dentro de `front-login/` e abra `http://localhost:5173`. O exemplo do front usa mock por padrão. Desativá-lo não conclui as integrações pendentes: o formulário de novo projeto ainda não seleciona `clienteId`, o RDO envia `obraId`/`anotacoes`, e orçamento/relatórios usam rotas ausentes.

## Usuários do seed

| Engenheiro | E-mail | Senha |
|---|---|---|
| João Silva | `joao@engineer.com` | `123456` |
| Maria Oliveira | `maria@engineer.com` | `123456` |

O seed também cria clientes, Green Valley para João e Predial Centro-Sul para Maria. Diários e orçamentos demo têm datas de 2024; referências de arquivos do seed não criam arquivos físicos. O registro público exige senha de 8 a 72 caracteres; as contas do seed são criadas diretamente com a senha demo acima.

## Scripts npm disponíveis

Tabela extraída dos nomes e comandos existentes no `package.json` da raiz:

| Comando | Script atual |
|---|---|
| `npm run dev` | `nodemon src/server.js` |
| `npm start` | `node src/server.js` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:seed` | `prisma db seed` |
| `npm run db:studio` | `prisma studio` |
| `npm run check` | `node scripts/check.js` |

Não há atalho npm para o smoke no estado atual; execute o arquivo diretamente, como indicado abaixo. No front, os scripts existentes são `dev`, `build` e `preview`. O backend é JavaScript e não possui etapa de build.

## Estrutura atual

| Pasta | Responsabilidade |
|---|---|
| `src/routes/` | Rotas reais, métodos e autenticação; `index.js` monta os grupos. |
| `src/controllers/` | Entrada, validações e respostas HTTP. |
| `src/services/` | Regras de negócio, autorização e consultas Prisma. |
| `src/middlewares/` | JWT, multer, erros e rotas não encontradas. |
| `src/lib/` | Cliente Prisma, ErroHttp e constantes de projetos. |
| `src/config/` | Leitura e validação do ambiente. |
| `prisma/` | Schema, migrations e seed de desenvolvimento. |
| `scripts/` | Verificação de sintaxe e smoke HTTP. |
| `docs/postman/` | Coleção v2.1, ambiente local e `amostra.pdf`. |
| `front-login/` | Aplicação React/Vite, com integrações reais e fluxos mock. |
| `uploads/` | Arquivos recebidos; ignorados pelo Git. |

## Endpoints implementados

| Método | Rota | Autenticação | Finalidade |
|---|---|---|---|
| GET | `/` | Pública | Identificação da API. |
| GET | `/api/health` | Pública | API/banco; 200 conectado, 503 indisponível. |
| POST | `/api/auth/registro` | Pública | Cadastro de engenheiro; 201, 400 ou 409. |
| POST | `/api/auth/login` | Pública | JWT e usuário sem senha; 200, 400 ou 401. |
| GET | `/api/clientes` | Bearer token | Clientes globais; id, nome, email e telefone. |
| POST | `/api/clientes` | Bearer token | Cria cliente; inclui criadoEm na resposta 201. |
| GET | `/api/projetos` | Bearer token | Projetos do engenheiro com cliente e engenheiro. |
| POST | `/api/projetos` | Bearer token | Cria projeto vinculado ao engenheiro do token. |
| PUT | `/api/projetos/:id` | Bearer token | Atualização parcial do projeto próprio. |
| POST | `/api/rdo/sync` | Bearer token | Cria diário com projeto e engenheiro; 201. |
| GET | `/api/diarios` | Bearer token | Até 200 diários próprios; filtro opcional projetoId. |
| POST | `/api/projetos/:id/arquivos` | Bearer token | Upload multipart no campo arquivo; nova versão, 201. |
| GET | `/api/projetos/:id/arquivos` | Bearer token | Lista nomes e versões, incluindo criadoEm. |
| GET | `/api/dashboard` | Bearer token | Indicadores e atividades do engenheiro. |

Contrato detalhado: [docs/contrato-api.md](docs/contrato-api.md). Erros usam `{message}`, exceto o health 503, que retorna `{api, banco}`. O dashboard devolve eficiência nula e progresso vazio; o custo mensal soma orçamentos existentes, sem oferecer endpoints de orçamento.

### Previstos, ainda não implementados

- WhatsApp: `POST /api/whatsapp/enviar-orcamento` existe e exige token, mas sempre responde 501 após autenticação. Não há envio real ou provider simulado no servidor.
- Orçamentos: GET/POST `/api/projetos/:id/orcamentos` não estão registrados; com token válido retornam 404. Há modelo e dados de seed, sem API funcional.
- Relatórios, consulta SINAPI e geração automática de PDF não possuem endpoints. A impressão de orçamento no front e relatórios mock não comprovam implementação no backend.

## Autenticação e autorização

O login compara o hash bcrypt e emite JWT, com validade padrão de oito horas, configurável por `JWT_EXPIRES_IN`. Use `Authorization: Bearer <token>`. Token ausente, inválido ou expirado retorna 401.

Cada engenheiro lista seus próprios projetos e diários. Alterar projeto alheio, sincronizar RDO nele ou listar/enviar seus arquivos retorna 404. Filtrar diários por projeto alheio ou inexistente retorna 200 com lista vazia. Clientes são globais, conforme o schema; não têm dono por engenheiro.

No MVP, `/uploads/<uuid>.<ext>` é **público**, sem JWT, para permitir `<img>`. O nome UUID dificulta descobrir o caminho; quem conhece a URL pode baixar o arquivo. Somente esse prefixo usa `Cross-Origin-Resource-Policy: cross-origin`; a API mantém `same-origin`. Imagens JPG/JPEG/PNG são inline; documentos são attachment. O upload aceita PDF, DWG, RVT, JPG, JPEG e PNG, com validação de assinatura em PDF/imagens e limite configurável. Mesmo nome no mesmo projeto cria outra versão, sem apagar as anteriores.

## Como testar

Com banco, API e contas do seed disponíveis:

```bash
npm run check
node scripts/smoke.js
```

O smoke usa apenas recursos nativos de Node: fetch, FormData e Blob. Sua URL vem de `SMOKE_BASE_URL`, com padrão `http://localhost:3000`. Ele testa saúde, logins, cliente, projeto, edição, RDO, upload/versionamento, autorização e validações; imprime OK/FALHOU por passo e retorna código 1 se houver falha.

**Smoke e coleção deixam dados de teste no banco e arquivos no diretório de upload. Não executam limpeza nem reset.** O smoke mantém também as verificações anteriores de senha incorreta, dashboard sem token e dados do seed.

No Postman, importe `docs/postman/crm-engenharia.postman_collection.json` e `docs/postman/local.postman_environment.json`, selecione o ambiente local e configure o working directory para `docs/postman`. Execute a coleção completa no Collection Runner, na ordem das oito pastas. Os tokens e IDs começam vazios e são preenchidos pelos testes; um novo projeto por execução mantém as versões do PDF em 1 e 2. O teste de extensão inválida envia o JSON da coleção, evitando um arquivo executável de amostra. Os caminhos de arquivos são relativos ao [working directory do Postman](https://learning.postman.com/docs/getting-started/installation/settings/working-directory).

Com Newman disponível, execute da raiz:

```bash
npx newman run docs/postman/crm-engenharia.postman_collection.json -e docs/postman/local.postman_environment.json --working-dir docs/postman
```

Os testes não incluem a rota 501 de WhatsApp nem rotas inexistentes. Não exporte o ambiente com tokens preenchidos para o Git.

## Problemas comuns

- Banco não conecta: confira `DATABASE_URL`, serviço PostgreSQL, porta e credenciais do volume.
- Porta ocupada: libere a porta ou ajuste `PORT`; alinhe `VITE_API_URL`, `baseUrl` e `SMOKE_BASE_URL`.
- Token expirado: faça login novamente; na coleção, execute as pastas anteriores para renovar tokens e IDs.
- Upload no Postman falha: selecione o ambiente e o working directory com `amostra.pdf` e o JSON da coleção.
- Front mostra mock: confira `VITE_USE_MOCK=false`, inclusive em `.env.local`, e reinicie o Vite.
