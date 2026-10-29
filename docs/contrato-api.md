# Contrato da API do MVP

Este é o contrato alvo. Auth, raiz, health, dashboard, clientes e projetos (listar, criar e editar) já existem. RDO, upload e WhatsApp continuam respondendo **501** após autenticação; os demais endpoints abaixo ainda serão implementados.

## Regras gerais

- Todas as rotas exigem `Authorization: Bearer <token>`, exceto `GET /`, `GET /api/health`, `POST /api/auth/registro` e `POST /api/auth/login`.
- JSON em requisições e respostas, exceto upload multipart. Erros: `{ "message": "..." }`. Datas em ISO 8601; campos seguem `schema.prisma`. `?` indica entrada opcional; campos opcionais do banco podem retornar `null`.
- Rotas protegidas: **401** se o token estiver ausente, inválido ou expirado. Dados inválidos: **400**; falhas internas: **500**, com mensagem genérica. Erros específicos constam abaixo.
- Um projeto só pode ser lido ou alterado se `projeto.engenheiroId === token.sub`. Projeto inexistente ou de outro engenheiro: **404**, inclusive em operações de arquivos, diários, orçamentos e WhatsApp vinculadas a ele. Listagens filtram pelo dono.
- IDs, vínculos, versões e datas de criação são definidos pelo servidor. Não aceitar `engenheiroId` do corpo como autorização.

## Rotas existentes de suporte

| Método e rota | Autenticação | Corpo | Sucesso | Erros |
|---|---|---|---|---|
| `GET /` | Pública | Nenhum | **200** `{mensagem: "API do CRM de Engenharia Civil", status: "online"}` | 500 |
| `GET /api/health` | Pública | Nenhum | **200** `{api: "online", banco: "conectado"}` | Atualmente **503** `{api: "online", banco: "indisponivel"}` quando o banco não responde |
| `GET /api/dashboard` | Bearer | Nenhum | **200** `{obrasAtivas: {valor, detalhe}, diariosPendentes: {valor, detalhe}, custoTotal: {valor, detalhe}, eficiencia: {valor: null}, progressoObras: [], atividades: [{tipo, texto, quando, autor}]}` | 401, 500 |

O health tem atualmente a exceção de formato 503 indicada na tabela; os erros dos endpoints do MVP usam `{message}`.

## Auth

`usuario` nas respostas: `{id, nome, email, perfil: "Engenheiro"}`; nunca inclui `senha`.

| Método e rota | Autenticação | Corpo | Sucesso | Erros |
|---|---|---|---|---|
| `POST /api/auth/registro` | Pública | `{nome, email, senha}` | **201** `{message: "Cadastro realizado com sucesso.", usuario}` | **400** entradas inválidas; **409** e-mail já cadastrado; **500** |
| `POST /api/auth/login` | Pública | `{email, senha}` | **200** `{message: "Login realizado com sucesso.", token, usuario}` | **400** e-mail/senha ausentes ou inválidos; **401** credenciais incorretas; **500** |

No registro, `nome` é string de 2 a 100 caracteres após trim; `email` tem formato válido e até 254 caracteres; `senha` tem 8 a 72 caracteres. E-mail é normalizado com trim e minúsculas. No login, e-mail e senha devem ser strings não vazias; não se reaplica o tamanho mínimo do registro.

## Clientes

Cliente: `{id, nome, email, telefone, criadoEm}`. O schema não vincula clientes a um engenheiro; a restrição de propriedade aplica-se aos projetos.

| Método e rota | Autenticação | Corpo | Sucesso | Erros |
|---|---|---|---|---|
| `GET /api/clientes` | Bearer | Nenhum | **200** lista de clientes | 401, 500 |
| `POST /api/clientes` | Bearer | `{nome, email, telefone}` | **201** cliente criado | **400** dados inválidos; **409** e-mail já cadastrado; 401, 500 |

## Projetos

Projeto retornado: `{id, titulo, descricao, status, prioridade, localizacao, dataInicio, criadoEm, atualizadoEm, cliente: {id, nome, email, telefone}, engenheiro: {id, nome}}`.

`status`: `planejamento`, `em_andamento`, `concluido`, `cancelado`.
`prioridade`: `baixa`, `media`, `alta`.

| Método e rota | Autenticação | Corpo | Sucesso | Erros |
|---|---|---|---|---|
| `GET /api/projetos` | Bearer | Nenhum | **200** lista dos projetos do engenheiro logado, com cliente e engenheiro | 401, 500 |
| `POST /api/projetos` | Bearer | `{titulo, descricao?, status, prioridade, clienteId, localizacao?, dataInicio?}` | **201** projeto criado; `engenheiroId = token.sub` | **400** dados/status/prioridade/data inválidos; **404** cliente inexistente; 401, 500 |
| `PUT /api/projetos/:id` | Bearer | `{titulo?, descricao?, status?, prioridade?, clienteId?, localizacao?, dataInicio?}` | **200** projeto atualizado; campos omitidos são preservados | **400** dados inválidos; **404** projeto inacessível ou cliente inexistente; 401, 500 |

`descricao`, `localizacao` e `dataInicio` aceitam `null` para limpar o campo, tanto na criação quanto na edição. `titulo`, `status`, `prioridade` e `clienteId` não aceitam `null`. PUT sem campos reconhecidos responde **400** `{message: "Informe ao menos um campo para atualizar."}`. `engenheiroId` no corpo é ignorado e nunca altera o dono. Projeto inexistente ou de outro engenheiro responde **404** `{message: "Projeto não encontrado."}`; cliente inexistente responde **404** `{message: "Cliente não encontrado."}`.

## Arquivos

| Método e rota | Autenticação | Corpo | Sucesso | Erros |
|---|---|---|---|---|
| `POST /api/projetos/:id/arquivos` | Bearer | `multipart/form-data`, campo `arquivo`, máximo **10 MB** | **201** `{id, nome, tipo, caminho, versao}`; `caminho` no formato `/uploads/<uuid>.<ext>` | **400** arquivo ausente/inválido; **413** acima do limite; **404** projeto inacessível; 401, 500; atualmente 501 |

## Diário de Obra

Diário: `{id, projetoId, engenheiroId, data, atividade, descricao, observacoes, clima, maoDeObra, equipamentos, fotos, criadoEm}`.

| Método e rota | Autenticação | Corpo | Sucesso | Erros |
|---|---|---|---|---|
| `POST /api/rdo/sync` | Bearer | `{projetoId, data, atividade?, descricao, observacoes?, clima?, maoDeObra?: [{funcao, qtd}], equipamentos?: [{nome, qtd}], fotos?: string[]}` | **201** diário criado; `engenheiroId = token.sub`; fotos omitidas resultam em `[]` | **400** dados/data/listas inválidos; **404** projeto inacessível; 401, 500; atualmente 501 |
| `GET /api/diarios` | Bearer | Nenhum | **200** lista de diários do engenheiro logado, com todos os campos acima e `projeto: {id, titulo}`, `engenheiro: {id, nome}`, ordenada por `data` decrescente e depois `criadoEm` decrescente | 401, 500 |

`fotos` contém caminhos devolvidos pelo upload. `maoDeObra` e `equipamentos` são arrays JSON; `qtd` é numérico e `funcao`/`nome` são strings.

## Orçamentos

Orçamento: `{id, nome, descricao, valor, dataCriacao, projetoId, criadoEm}`.

| Método e rota | Autenticação | Corpo | Sucesso | Erros |
|---|---|---|---|---|
| `POST /api/projetos/:id/orcamentos` | Bearer | `{nome, descricao?, valor}` | **201** orçamento criado | **400** dados inválidos; **404** projeto inacessível; 401, 500 |
| `GET /api/projetos/:id/orcamentos` | Bearer | Nenhum | **200** lista de orçamentos do projeto | **404** projeto inacessível; 401, 500 |

## WhatsApp

| Método e rota | Autenticação | Corpo | Sucesso | Erros |
|---|---|---|---|---|
| `POST /api/whatsapp/enviar-orcamento` | Bearer | `{orcamentoId}` | **200** `{modo: "simulado" ou "cloud", status, link?}` | **400** dados/telefone inválidos; **404** orçamento inexistente ou projeto inacessível; **502** falha no provedor; 401, 500; atualmente 501 |

O telefone vem de `orcamento.projeto.cliente.telefone`, nunca do corpo. `modo` identifica simulação ou envio Cloud; `status` descreve o resultado e `link` é opcional.

## Divergências a corrigir no front

- O front envia `obraId`/`anotacoes`; deve enviar `projetoId`/`descricao`.
- O front lê `createdAt`; o back devolve `criadoEm`.
