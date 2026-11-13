# Demonstração de 15/11/2026

Congelamento auditado em 13/11/2026, a partir de `feat/orcamentos-front` no commit `65317f0`, na branch `chore/congelamento`. O roteiro usa a API real e cabe em 7 minutos, ou 8 com o bloco opcional de testes.

PRONTO significa implementado no código. O ensaio integrado e a apresentação no navegador precisam ser feitos no computador da demo. Credenciais: consulte a seção [Usuários do seed](../README.md#usuários-do-seed); este roteiro não reproduz senhas.

## Checklist antes da demo — seguir nesta ordem

Pré-condições: dependências já instaladas, Docker disponível, imagem da API construída com o código desta branch, Newman disponível para o comando existente e as duas contas do README presentes no banco atual. Separe duas fotos JPG/JPEG/PNG válidas, com menos de 10 MB cada. Grave e confira um vídeo de backup do fluxo real para usar como último recurso; não foi encontrado vídeo em `docs/` na auditoria.

1. **Subir e conferir os serviços.** Na raiz do repositório:

   ```bash
   docker compose up -d
   docker compose ps
   ```

   Aguarde o banco e a API ficarem saudáveis. O serviço `api` do Compose executa `prisma migrate deploy` na inicialização, conforme a configuração existente. Se a imagem estiver desatualizada, resolva isso antes do ensaio; não apresente uma imagem de outra versão.

2. **Conferir o `.env` e a conexão antes de continuar.** No host, `DATABASE_URL` deve apontar para `127.0.0.1` e a porta publicada por `POSTGRES_PORT`; neste ambiente a porta é `55434`. `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` devem corresponder ao usuário, à senha e ao banco de `DATABASE_URL`. O container da API usa o hostname `db`, como já definido no Compose.

   Na auditoria, a porta coincide, mas a senha e o nome do banco de `DATABASE_URL` divergem dos valores do Compose. Alinhe manualmente as variáveis ao banco atual antes dos testes e do reset. Mudar variáveis não redefine as credenciais de um volume existente; uma recriação limpa com valores divergentes deixaria a API sem conexão. Preserve as configurações locais, sem copiar segredos para Git ou para o projetor.

3. **Conferir as migrations pelo comando existente.** Com o banco saudável e o ambiente coerente:

   ```bash
   npm run db:migrate
   ```

   Interrompa a preparação se houver erro ou se aparecer uma alteração inesperada de schema; congelamento não prevê migrations novas.

4. **Executar os testes ANTES do reset**, com a API do Compose saudável, as duas contas já existentes e o Newman disponível:

   ```bash
   npm run smoke
   npm run postman:run
   ```

   Metas: `46 OK, 0 FALHOU` no smoke; 45 requisições, 120 asserções e zero falhas no Newman. O script `postman:run` já existe e configura o working directory dos uploads. Execute a coleção inteira para preencher IDs e autenticação; salve somente o resumo real da execução, sem exportar o ambiente preenchido. Qualquer falha deve ser investigada antes do reset, sem alterar código de negócio para aprovar testes.

5. **Somente depois dos testes aprovados, fazer o reset limpo. ATENÇÃO: APAGA TODOS OS DADOS DO BANCO E OS VOLUMES DO COMPOSE.** Os dados de teste são descartados para a demo começar com o seed:

   ```bash
   docker compose down -v
   docker compose up -d
   docker compose ps
   npm run db:migrate
   npm run db:seed
   ```

   Aguarde os serviços ficarem saudáveis antes de migrate/seed. A pasta `uploads/` do host não é removida por `down -v`; os arquivos dentro do container não têm volume persistente no Compose atual. Fotos e documentos referenciados pelo seed não são arquivos físicos: use as duas fotos separadas para criar um RDO novo na apresentação. Não rode os testes novamente após o reset, salvo se aceitar que novos dados de teste aparecerão.

6. **Iniciar API e front para a apresentação.** Como o Compose também sobe a API, pare apenas esse serviço antes de usar a mesma porta no host; mantenha o banco ligado:

   ```bash
   docker compose stop api
   npm run dev
   ```

   Em outro terminal, a partir da raiz:

   ```bash
   cd front-login
   npm run dev
   ```

   Confira `VITE_USE_MOCK=false` e `VITE_API_URL=http://localhost:3000` no ambiente do front. `.env.local` tem precedência sobre `.env`; reinicie o Vite se mudar esses valores. A configuração atual de `.env.local` coincide com esses valores.

7. **Abrir `http://localhost:5173` na tela de login.** Se uma sessão anterior abrir o dashboard, use **Sair** antes da apresentação. Entre somente quando começar o cronômetro, usando os dados do README. Mantenha os terminais da API e do Vite disponíveis e o resumo dos testes anteriores separado.

## Roteiro de 7 minutos

| Tempo | O que clicar | O que falar em uma frase | Situação no código |
|---|---|---|---|
| 0:00–0:40 | Tela de login: entrar com a conta do João indicada no README. | “O engenheiro se autentica e a API limita os projetos e registros ao seu usuário.” | PRONTO |
| 0:40–1:25 | Dashboard: mostrar obras ativas, diários e custo do mês. | “Estes indicadores vêm do banco; o custo soma os orçamentos criados neste mês.” | PRONTO para esses indicadores |
| 1:25–2:40 | Projetos → Novo Projeto → nome `Obra da demonstração`, cliente existente e status Em Andamento → Salvar. Se houver tempo, mostrar a opção `+ Novo cliente`. | “O projeto é vinculado a um cliente real, que também pode ser cadastrado no próprio formulário.” | PRONTO |
| 2:40–4:20 | Diário de Obra → Novo Registro → selecionar o projeto novo, data de hoje, atividade e descrição → adicionar as duas fotos → Salvar registro → Ver detalhes. | “As fotos são enviadas antes do diário, que guarda os caminhos e reaparece na listagem com autor e horário.” | PRONTO |
| 4:20–5:35 | Orçamentos → Novo Orçamento → projeto novo, nome `Orçamento demonstração`, descrição `Estrutura e alvenaria`, valor `12.500,50` → Salvar orçamento. | “A entrada brasileira é validada e convertida para um valor numérico antes de ser salva.” | PRONTO |
| 5:35–7:00 | Abrir o orçamento → Enviar ao cliente → conferir o contato e a mensagem no WhatsApp do engenheiro; voltar e mostrar Copiar mensagem. | “O navegador abre o WhatsApp com a mensagem pronta, e a confirmação do envio fica com o engenheiro.” | PRONTO |
| Opcional, 7:00–8:00 | Mostrar o resumo real dos testes anteriores ou a coleção Postman, destacando um 404 entre engenheiros e um 401 sem autenticação. | “Os testes verificam que um usuário não acessa dados de outro e que as rotas protegidas exigem autenticação.” | Testes implementados; execução atual NÃO VERIFICADA |

Não apresente o campo de eficiência, o progresso das obras ou o número de diários como métricas de aprovação: o backend retorna eficiência nula, progresso vazio e total de diários, sem modelar pendências. O link pode abrir WhatsApp Web ou o aplicativo configurado no navegador; abrir a janela não significa que a mensagem foi entregue.

## Plano B

### API não sobe

1. Confira o erro no terminal de `npm run dev` e o estado dos serviços com `docker compose ps`.
2. Se a porta estiver ocupada pelo container, use `docker compose stop api` e inicie novamente `npm run dev` na raiz.
3. Se não houver recuperação durante a demo, use o vídeo de backup gravado e conferido antes da apresentação.

### Banco não responde

1. Confira `docker compose ps`, `docker compose logs --tail=50 db` e a correspondência do `.env` com a porta e o volume atual.
2. Execute `docker compose restart db`, aguarde o banco saudável e tente novamente sem apagar dados.
3. Reset, somente na preparação e após testes aprovados: siga `docker compose down -v`, `docker compose up -d`, `npm run db:migrate` e `npm run db:seed` do checklist, aceitando a perda de dados; durante a apresentação, prefira o vídeo se não houver recuperação.

### Foto não carrega

1. Abra um RDO criado na apresentação; as referências de fotos do seed não têm arquivos físicos.
2. Se a imagem continuar indisponível, registre um RDO sem fotos e mostre descrição, projeto, autor e horário; a tela exibe “Imagem indisponível” quando necessário.
3. Use o trecho de RDO com fotos do vídeo de backup se precisar demonstrar o fluxo completo.

### WhatsApp não abre

1. Confira a conexão e o bloqueador de pop-ups; use o WhatsApp do engenheiro, sem chamar a API oficial.
2. Clique em **Copiar mensagem**; se o clipboard falhar, selecione e copie o texto na caixa exibida.
3. Mostre a mensagem pronta e explique que a entrega depende do WhatsApp e da confirmação do usuário.

### Internet cai

1. Continue os passos locais enquanto API, banco e Vite no notebook permanecerem acessíveis; não há fila offline de sincronização.
2. Use **Copiar mensagem** para o orçamento e adie a abertura do WhatsApp externo até a conexão voltar.
3. Se o ambiente local também ficar indisponível, use o vídeo de backup como último recurso.

### Tela em branco

1. Confira Console/Network do navegador e os terminais da API e do Vite para identificar a falha.
2. Verifique `VITE_USE_MOCK=false`, a URL da API em `.env.local` e reinicie `npm run dev` dentro de `front-login/`.
3. Recarregue e comece pela tela de login; se não recuperar, use o vídeo de backup.

## Limitações e respostas ao professor

| Assunto | Resposta de uma frase |
|---|---|
| Offline | “Não há PWA ou fila de sincronização offline; o mock local é separado do fluxo da API real.” |
| SINAPI | “A consulta e os preços do catálogo são demonstrativos no mock, sem integração SINAPI no servidor.” |
| PDF | “Há upload de PDF, mas não geração automática; a impressão do orçamento está somente no mock.” |
| WhatsApp oficial | “O endpoint oficial é um stub 501; o envio da demo usa `wa.me` e a conta do engenheiro.” |
| Kanban | “Projetos têm listagem e filtros por status, sem um quadro Kanban arrastável.” |
| Testes unitários | “Não há suíte unitária versionada; a automação inclui sintaxe, smoke HTTP e coleção Postman.” |
| `/uploads` público | “Os arquivos são públicos por URL aleatória, e quem conhece o caminho consegue acessá-los sem autenticação.” |
| Sessão no navegador | “O token fica no localStorage e pode ser lido por JavaScript, uma limitação reconhecida deste MVP.” |
| Dashboard | “Eficiência e progresso não são calculados, e o indicador de diários representa o total de registros.” |
| Orçamento | “A API cria e lista nome, descrição e valor, sem edição, exclusão, itens, BDI, validade ou status de envio.” |
| Fotos após cancelar | “Uploads já concluídos permanecem no repositório mesmo quando o formulário é abandonado, pois não existe remoção nesse fluxo.” |

Ficam fora do roteiro: relatórios reais, operação offline, SINAPI real, geração automática de PDF, API oficial de WhatsApp, Kanban, edição/exclusão de orçamento e métricas de eficiência/progresso. Recursos mock não serão apresentados como integração real.

## Auditoria do congelamento

### Git e estado inicial

- Branch de origem: `feat/orcamentos-front`; HEAD inicial `65317f0`.
- Alterações locais anteriores preservadas: `.dockerignore` e `docs/2026-10-26.md`.
- `git branch --no-merged main` mostrou 11 branches locais: `chore/ambiente`, `docs/ted03`, `docs/ted03-prints`, `feat/clientes-front`, `feat/clientes-projetos-api`, `feat/contrato-auth`, `feat/orcamentos-api`, `feat/orcamentos-front`, `feat/rdo-api`, `feat/rdo-front` e `feat/upload-versionado`.
- A comparação usa a `main` local; não houve fetch, merge ou confirmação do estado atual do GitHub nesta auditoria. Os últimos 15 commits foram inspecionados antes das alterações.

### Rotas reais

Os prefixos são montados em `src/routes/index.js:15`. “Token” abaixo significa `autenticarToken` na rota ou no router.

| Item | Status | Evidência (arquivo:linha) |
|---|---|---|
| `GET /` — público | FEITO | `src/routes/health.js:6` |
| `GET /api/health` — público | FEITO | `src/routes/health.js:7` |
| `POST /api/auth/registro` — público | FEITO | `src/routes/auth.js:6` |
| `POST /api/auth/login` — público | FEITO | `src/routes/auth.js:7` |
| `GET /api/clientes` — token | FEITO | `src/routes/clientes.js:6`, `src/routes/clientes.js:8` |
| `POST /api/clientes` — token | FEITO | `src/routes/clientes.js:6`, `src/routes/clientes.js:9` |
| `GET /api/projetos` — token | FEITO | `src/routes/projetos.js:6`, `src/routes/projetos.js:8` |
| `POST /api/projetos` — token | FEITO | `src/routes/projetos.js:6`, `src/routes/projetos.js:9` |
| `PUT /api/projetos/:id` — token | FEITO | `src/routes/projetos.js:6`, `src/routes/projetos.js:10` |
| `POST /api/rdo/sync` — token | FEITO | `src/routes/rdo.js:6`, `src/routes/rdo.js:8` |
| `GET /api/diarios` — token | FEITO | `src/routes/diarios.js:6`, `src/routes/diarios.js:8` |
| `POST /api/projetos/:id/arquivos` — token | FEITO | `src/routes/arquivos.js:7`, `src/routes/arquivos.js:9` |
| `GET /api/projetos/:id/arquivos` — token | FEITO | `src/routes/arquivos.js:7`, `src/routes/arquivos.js:10` |
| `POST /api/projetos/:id/orcamentos` — token | FEITO | `src/routes/orcamentos.js:6`, `src/routes/orcamentos.js:7` |
| `GET /api/projetos/:id/orcamentos` — token | FEITO | `src/routes/orcamentos.js:6`, `src/routes/orcamentos.js:8` |
| `GET /api/orcamentos` — token | FEITO | `src/routes/orcamentos.js:11`, `src/routes/orcamentos.js:12` |
| `GET /api/dashboard` — token | FEITO | `src/routes/dashboard.js:7` |
| `POST /api/whatsapp/enviar-orcamento` — token, stub 501 | PARCIAL | `src/routes/whatsapp.js:6`, `src/routes/whatsapp.js:8`, `src/controllers/whatsappController.js:1` |
| Rotas de SINAPI, relatórios e geração automática de PDF | NÃO INICIADO | catálogo completo em `src/routes/index.js:15` |

### Front e correções verificadas antes de editar

| Item | Status | Evidência (arquivo:linha) |
|---|---|---|
| Clientes: serviço e select com `+ Novo cliente` | FEITO | `front-login/src/services/clientesService.js:30`, `front-login/src/pages/Projetos.jsx:258`, `front-login/src/pages/Projetos.jsx:269` |
| RDO: mapeamento com `projetoId`/`descricao`, sem aliases no JSON | FEITO | `front-login/src/services/diarioMapeamento.js:12` |
| RDO: uploads antes do sync e listagem `/api/diarios` | FEITO | `front-login/src/services/diarioService.js:11`, `front-login/src/services/diarioService.js:214`, `front-login/src/services/diarioService.js:226` |
| Orçamentos: funções puras, criação por projeto e listagem global | FEITO | `front-login/src/services/orcamentoMapeamento.js:20`, `front-login/src/services/orcamentosService.js:153`, `front-login/src/services/orcamentosService.js:210` |
| WhatsApp por link; nenhum arquivo do front chama `/api/whatsapp` | FEITO | `front-login/src/services/orcamentoMapeamento.js:72`, `front-login/src/pages/Orcamentos.jsx:726`; busca completa em `front-login/src` |
| `requestBlob` trata 401 com callback comum quando há autenticação | FEITO — JÁ FEITO | `front-login/src/services/api.js:19`, `front-login/src/services/api.js:78` |
| Cadastro exige pelo menos 8 caracteres; login preservado | FEITO — JÁ FEITO | `front-login/src/pages/Login.jsx:16` |
| Exemplo do front com `VITE_USE_MOCK=false` e comentário | FEITO — JÁ FEITO | `front-login/.env.example:5` |
| Relatórios fora do menu, com página/rota preservadas | FEITO — JÁ FEITO | `front-login/src/components/Layout.jsx:13`, `front-login/src/App.jsx:32` |
| Consulta de projetos descartada removida do dashboard | FEITO — JÁ FEITO | `src/services/dashboardService.js:13` |
| README do front usa `/api/auth/login` | FEITO — JÁ FEITO | `front-login/README.md:17` |
| Seed sem literais de 2024, com datas relativas e `dataCriacao` no mês | FEITO — JÁ FEITO | `prisma/seed.js:24`, `prisma/seed.js:74`, `prisma/seed.js:84`, `prisma/seed.js:146`, `prisma/seed.js:168` |

Nenhuma correção da Parte B ficou pendente; não houve commit de correção ou de seed. Nenhuma funcionalidade ausente foi implementada. A única ampliação do escopo literal da lista inicial foi a adição de `orcamentoId` vazio em `docs/postman/local.postman_environment.json`, expressamente pedida na Parte C.2.

### Testes e verificações em 13/11/2026

| Verificação | Resultado |
|---|---|
| `npm run check` | FEITO: sintaxe aprovada em 44 arquivos |
| `npm run build` em `front-login/` | FEITO: 62 módulos transformados, build aprovado |
| `node --check scripts/smoke.js` | FEITO |
| JSON da coleção/ambiente e sintaxe dos scripts Postman | FEITO: 45 requisições, 120 asserções, 9 novas requisições com `pm.test` |
| Preservação das requisições anteriores | FEITO: as 36 requisições originais e os valores anteriores do ambiente foram preservados |
| Smoke integrado, agora com 46 passos | NÃO VERIFICADO: `curl` falhou com código 7 ao acessar `localhost:3000/api/health` |
| Newman integrado | NÃO VERIFICADO: API inacessível e Newman não instalado no ambiente de execução |
| Ensaio completo no navegador e entrega pelo WhatsApp | NÃO VERIFICADO nesta auditoria |

São 36 passos antigos mais 10 de orçamentos no smoke. A coleção tem 36 requisições antigas mais 6 de orçamentos e 3 sem autenticação; são 91 asserções anteriores mais 29 novas. A numeração das pastas antigas foi preservada, e a pasta nova se chama `Orçamentos`.
