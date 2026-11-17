# Preparação da demonstração de 15/11/2026

Em 13/11/2026, o grupo analisou a versão disponível em `feat/orcamentos-front`, no commit `65317f0`, e organizou o congelamento na branch `chore/congelamento`. Em seguida, elaborou um roteiro de apresentação com a API real, previsto para 7 minutos ou 8 minutos com o bloco opcional de testes. Este documento registra a preparação; não descreve resultados da apresentação de 15/11.

O grupo adotou PRONTO para identificar funcionalidades implementadas no código. O ensaio integrado e a apresentação no navegador permaneceram sujeitos à verificação no computador da demonstração. As contas de teste estão documentadas em [Usuários do seed](../README.md#usuários-do-seed); este roteiro não reproduz senhas.

## Procedimento de preparação definido pelo grupo

O grupo definiu como pré-condições as dependências instaladas, o Docker disponível, a imagem da API construída com o código da branch, o Newman disponível e as duas contas do README presentes no banco. Também previu duas fotos JPG/JPEG/PNG válidas, com menos de 10 MB cada, e a gravação e conferência de um vídeo do fluxo real para contingência. A auditoria não encontrou vídeo em `docs/`; sua produção permaneceu pendente de confirmação. As etapas abaixo descrevem o procedimento planejado, sem comprovar sua execução.

1. **Inicialização dos serviços.** Primeiro, o grupo deverá executar os comandos na raiz do repositório:

   ```bash
   docker compose up -d
   docker compose ps
   ```

   O grupo deverá aguardar a confirmação de disponibilidade do banco e da API. O serviço `api` do Compose executa `prisma migrate deploy` na inicialização, conforme a configuração existente. Uma imagem desatualizada deverá ser corrigida antes do ensaio, para que a apresentação utilize a versão prevista.

2. **Conferência da configuração e da conexão.** Em seguida, o grupo deverá conferir o `.env`. No host, `DATABASE_URL` deve apontar para `127.0.0.1` e a porta publicada por `POSTGRES_PORT`; no ambiente auditado, a porta era `55434`. `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` devem corresponder ao usuário, à senha e ao banco de `DATABASE_URL`. O container da API usa o hostname `db`, como já definido no Compose.

   Durante a auditoria, o grupo identificou que a porta coincidia, mas a senha e o nome do banco de `DATABASE_URL` divergiam dos valores do Compose. Registrou, portanto, a necessidade de alinhar manualmente as variáveis ao banco antes dos testes e de qualquer reset. A alteração de variáveis não redefine as credenciais de um volume existente; uma recriação com valores divergentes impediria a conexão da API. As configurações locais deverão ser preservadas, sem exposição de segredos no Git ou na projeção.

3. **Conferência das migrations.** Com o banco disponível e a configuração coerente, o grupo deverá utilizar o comando existente:

   ```bash
   npm run db:migrate
   ```

   O grupo deverá interromper a preparação em caso de erro ou de alteração inesperada de schema, pois o congelamento não prevê migrations novas.

4. **Execução dos testes antes de qualquer reset.** Na sequência, com a API do Compose disponível, as duas contas existentes e o Newman disponível, o grupo deverá executar:

   ```bash
   npm run smoke
   npm run postman:run
   ```

   O grupo definiu como metas `46 OK, 0 FALHOU` no smoke e 45 requisições, 120 asserções e zero falhas no Newman. O script `postman:run` já existe e configura o working directory dos uploads. A execução deverá abranger a coleção inteira para preencher IDs e autenticação. O grupo deverá guardar somente o resumo observado, sem exportar o ambiente preenchido, e investigar falhas antes de qualquer reset, sem alterar regras de negócio apenas para aprovar os testes.

5. **Reset previsto somente após a aprovação dos testes. ATENÇÃO: APAGA TODOS OS DADOS DO BANCO E OS VOLUMES DO COMPOSE.** O grupo incluiu a possibilidade de descartar os dados de teste para iniciar a demonstração com o seed, conforme os comandos abaixo. Sua inclusão no procedimento não indica que tenham sido executados:

   ```bash
   docker compose down -v
   docker compose up -d
   docker compose ps
   npm run db:migrate
   npm run db:seed
   ```

   O grupo deverá aguardar a disponibilidade dos serviços antes de executar migrate/seed. A pasta `uploads/` do host não é removida por `down -v`; os arquivos dentro do container não têm volume persistente no Compose atual. Como as referências do seed não criam fotos ou documentos físicos, o roteiro prevê um RDO novo com as duas fotos separadas pela equipe. Uma nova execução dos testes após o reset criará dados adicionais e deverá ser considerada na preparação das telas.

6. **Inicialização da API e do front no host.** Como o Compose também inicia a API, o grupo deverá encerrar apenas esse serviço antes de utilizar a mesma porta no host, mantendo o banco ligado:

   ```bash
   docker compose stop api
   npm run dev
   ```

   Em seguida, o grupo deverá iniciar o front em outro terminal, a partir da raiz:

   ```bash
   cd front-login
   npm run dev
   ```

   O grupo deverá conferir `VITE_USE_MOCK=false` e `VITE_API_URL=http://localhost:3000` no ambiente do front. Como `.env.local` tem precedência sobre `.env`, alterações exigem a reinicialização do Vite. Na auditoria de 13/11, a configuração local correspondia a esses valores.

7. **Preparação da tela inicial.** Por fim, o grupo deverá abrir `http://localhost:5173` na tela de login. Caso uma sessão anterior abra o dashboard, deverá utilizar **Sair** antes da apresentação. O roteiro prevê o login com a conta do README após o início do cronômetro, com os terminais da API e do Vite disponíveis e o resumo dos testes anteriores separado.

## Roteiro de 7 minutos

| Tempo | Ação prevista para o grupo | Explicação prevista | Situação no código |
|---|---|---|---|
| 0:00–0:40 | Tela de login: entrar com a conta do João indicada no README. | “O engenheiro se autentica e a API limita os projetos e registros ao seu usuário.” | PRONTO |
| 0:40–1:25 | Dashboard: mostrar obras ativas, diários e custo do mês. | “Estes indicadores vêm do banco; o custo soma os orçamentos criados neste mês.” | PRONTO para esses indicadores |
| 1:25–2:40 | Projetos → Novo Projeto → nome `Obra da demonstração`, cliente existente e status Em Andamento → Salvar. Se houver tempo, mostrar a opção `+ Novo cliente`. | “O projeto é vinculado a um cliente real, que também pode ser cadastrado no próprio formulário.” | PRONTO |
| 2:40–4:20 | Diário de Obra → Novo Registro → selecionar o projeto novo, data de hoje, atividade e descrição → adicionar as duas fotos → Salvar registro → Ver detalhes. | “As fotos são enviadas antes do diário, que guarda os caminhos e reaparece na listagem com autor e horário.” | PRONTO |
| 4:20–5:35 | Orçamentos → Novo Orçamento → projeto novo, nome `Orçamento demonstração`, descrição `Estrutura e alvenaria`, valor `12.500,50` → Salvar orçamento. | “A entrada brasileira é validada e convertida para um valor numérico antes de ser salva.” | PRONTO |
| 5:35–7:00 | Abrir o orçamento → Enviar ao cliente → conferir o contato e a mensagem no WhatsApp do engenheiro; voltar e mostrar Copiar mensagem. | “O navegador abre o WhatsApp com a mensagem pronta, e a confirmação do envio fica com o engenheiro.” | PRONTO |
| Opcional, 7:00–8:00 | Mostrar o resumo real dos testes anteriores ou a coleção Postman, destacando um 404 entre engenheiros e um 401 sem autenticação. | “Os testes verificam que um usuário não acessa dados de outro e que as rotas protegidas exigem autenticação.” | Testes implementados; execução atual NÃO VERIFICADA |

O grupo delimitou a apresentação aos indicadores disponíveis: o backend retorna eficiência nula, progresso vazio e total de diários, sem modelar aprovação ou pendências. O link pode abrir WhatsApp Web ou o aplicativo configurado no navegador, mas a abertura da janela não comprova a entrega da mensagem.

## Plano B

### API não sobe

1. O grupo deverá consultar o erro no terminal de `npm run dev` e o estado dos serviços com `docker compose ps`.
2. Se a porta estiver ocupada pelo container, deverá utilizar `docker compose stop api` e iniciar novamente `npm run dev` na raiz.
3. Se não houver recuperação durante a apresentação, deverá recorrer ao vídeo de contingência, desde que tenha sido gravado e conferido previamente.

### Banco não responde

1. O grupo deverá consultar `docker compose ps`, `docker compose logs --tail=50 db` e a correspondência do `.env` com a porta e o volume em uso.
2. Em seguida, deverá executar `docker compose restart db`, aguardar a disponibilidade do banco e tentar novamente sem apagar dados.
3. O reset ficará restrito à preparação, após testes aprovados e com aceitação da perda dos dados, conforme `docker compose down -v`, `docker compose up -d`, `npm run db:migrate` e `npm run db:seed` do procedimento. Durante a apresentação, o grupo deverá recorrer ao vídeo disponível se não houver recuperação.

### Foto não carrega

1. O grupo deverá abrir um RDO criado na apresentação, pois as referências de fotos do seed não têm arquivos físicos.
2. Se a imagem continuar indisponível, deverá registrar um RDO sem fotos e apresentar descrição, projeto, autor e horário, identificando a limitação; a tela exibe “Imagem indisponível” quando necessário.
3. Caso exista vídeo de contingência previamente conferido, o grupo poderá utilizar o trecho do RDO com fotos para explicar o fluxo completo.

### WhatsApp não abre

1. O grupo deverá conferir a conexão e o bloqueador de pop-ups, utilizando o link para o WhatsApp do engenheiro, sem chamar a API oficial.
2. Em seguida, deverá utilizar **Copiar mensagem**; se a cópia automática falhar, poderá selecionar e copiar o texto na caixa exibida.
3. O grupo deverá apresentar a mensagem pronta e esclarecer que a entrega depende do WhatsApp e da confirmação do usuário.

### Internet cai

1. O grupo poderá continuar os passos locais enquanto API, banco e Vite no notebook permanecerem acessíveis, sem atribuir ao sistema uma fila de sincronização offline inexistente.
2. Para o orçamento, deverá utilizar **Copiar mensagem** e adiar a abertura do WhatsApp externo até o retorno da conexão.
3. Se o ambiente local também ficar indisponível, poderá recorrer ao vídeo de contingência, desde que tenha sido preparado e conferido.

### Tela em branco

1. O grupo deverá consultar Console/Network do navegador e os terminais da API e do Vite para identificar a falha.
2. Em seguida, deverá verificar `VITE_USE_MOCK=false`, a URL da API em `.env.local` e reiniciar `npm run dev` dentro de `front-login/`.
3. Após a tentativa de recuperação, deverá recarregar a página e retornar à tela de login; se a falha persistir, poderá utilizar o vídeo de contingência disponível.

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

O grupo deixou fora do roteiro relatórios reais, operação offline, SINAPI real, geração automática de PDF, API oficial de WhatsApp, Kanban, edição/exclusão de orçamento e métricas de eficiência/progresso. Também estabeleceu que os recursos simulados não seriam apresentados como integrações reais.

## Auditoria do congelamento

### Git e estado inicial

- Branch de origem: `feat/orcamentos-front`; HEAD inicial `65317f0`.
- Alterações locais anteriores preservadas: `.dockerignore` e `docs/2026-10-26.md`.
- `git branch --no-merged main` mostrou 11 branches locais: `chore/ambiente`, `docs/ted03`, `docs/ted03-prints`, `feat/clientes-front`, `feat/clientes-projetos-api`, `feat/contrato-auth`, `feat/orcamentos-api`, `feat/orcamentos-front`, `feat/rdo-api`, `feat/rdo-front` e `feat/upload-versionado`.
- O grupo comparou as branches com a `main` local, sem realizar fetch, merge ou confirmar o estado do GitHub nessa auditoria. Antes das alterações, inspecionou os últimos 15 commits.

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

### Funcionalidades e correções conferidas pelo grupo

| Item | Status | Evidência (arquivo:linha) |
|---|---|---|
| Clientes: serviço e select com `+ Novo cliente` | FEITO | `front-login/src/services/clientesService.js:30`, `front-login/src/pages/Projetos.jsx:258`, `front-login/src/pages/Projetos.jsx:269` |
| RDO: mapeamento com `projetoId`/`descricao`, sem aliases no JSON | FEITO | `front-login/src/services/diarioMapeamento.js:12` |
| RDO: uploads antes do sync e listagem `/api/diarios` | FEITO | `front-login/src/services/diarioService.js:11`, `front-login/src/services/diarioService.js:214`, `front-login/src/services/diarioService.js:226` |
| Orçamentos: funções puras, criação por projeto e listagem global | FEITO | `front-login/src/services/orcamentoMapeamento.js:20`, `front-login/src/services/orcamentosService.js:153`, `front-login/src/services/orcamentosService.js:210` |
| WhatsApp por link; nenhum arquivo do front chama `/api/whatsapp` | FEITO | `front-login/src/services/orcamentoMapeamento.js:72`, `front-login/src/pages/Orcamentos.jsx:726`; busca completa em `front-login/src` |
| `requestBlob` trata 401 com callback comum quando há autenticação | IMPLEMENTADO E CONFERIDO | `front-login/src/services/api.js:19`, `front-login/src/services/api.js:78` |
| Cadastro exige pelo menos 8 caracteres; login preservado | IMPLEMENTADO E CONFERIDO | `front-login/src/pages/Login.jsx:16` |
| Exemplo do front com `VITE_USE_MOCK=false` e comentário | IMPLEMENTADO E CONFERIDO | `front-login/.env.example:5` |
| Relatórios fora do menu, com página/rota preservadas | IMPLEMENTADO E CONFERIDO | `front-login/src/components/Layout.jsx:13`, `front-login/src/App.jsx:32` |
| Consulta de projetos descartada removida do dashboard | IMPLEMENTADO E CONFERIDO | `src/services/dashboardService.js:13` |
| README do front usa `/api/auth/login` | IMPLEMENTADO E CONFERIDO | `front-login/README.md:17` |
| Seed sem literais de 2024, com datas relativas e `dataCriacao` no mês | IMPLEMENTADO E CONFERIDO | `prisma/seed.js:24`, `prisma/seed.js:74`, `prisma/seed.js:84`, `prisma/seed.js:146`, `prisma/seed.js:168` |

O grupo constatou que as correções avaliadas já estavam implementadas, sem necessidade de novos commits de correção ou de seed. Em seguida, ampliou a cobertura dos testes e documentou a preparação, sem acrescentar funcionalidades ausentes. Também incluiu `orcamentoId` vazio em `docs/postman/local.postman_environment.json` para permitir a execução encadeada dos testes de orçamento; os valores anteriores do ambiente foram preservados.

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

Ao final da preparação, o grupo manteve os 36 passos existentes do smoke e acrescentou 10 verificações de orçamento. Na coleção, preservou as 36 requisições anteriores e incluiu 6 de orçamento e 3 sem autenticação, passando de 91 para 120 asserções. A numeração das pastas anteriores foi preservada, e a nova pasta recebeu o nome `Orçamentos`.
