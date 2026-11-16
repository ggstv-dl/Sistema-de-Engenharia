# Kit de validação — preparação em 16/11/2026

Sessão prevista: quarta-feira, 18/11/2026, até 30 minutos, com participação anônima de engenheiro(a). Este arquivo é de uso da equipe. Os textos para o participante estão nos documentos vinculados abaixo.

- [Roteiro da sessão e ficha de observação](roteiro-sessao.md)
- [Questionário e configuração do formulário](questionario.md)
- [Convites](convite.md)
- [Consentimento oral](consentimento.md)
- [Alternativa remota](plano-b-remoto.md)

## Parte A — auditoria somente por leitura

Fonte única de seleção das tarefas: a tabela abaixo. PRONTO significa fluxo implementado no código real, sem prometer execução integrada nesta data. PARCIAL e AUSENTE não entram nas tarefas. Caminhos relativos à raiz do repositório; referências conferidas em 16/11/2026.

| Funcionalidade | Status (PRONTO / PARCIAL / AUSENTE) | Onde (tela e arquivo:linha) | Funciona com a API real? |
|---|---|---|---|
| Login | PRONTO | Entrar: `front-login/src/pages/Login.jsx:60`; `front-login/src/services/authService.js:41` | Integração implementada; execução NÃO VERIFICADO. |
| Cadastro de conta | PRONTO | Criar conta: `front-login/src/pages/Login.jsx:123`; `front-login/src/services/authService.js:52` | Integração implementada; execução NÃO VERIFICADO. Não será pedido cadastro pessoal. |
| Dashboard | PARCIAL | Dashboard: `front-login/src/pages/Dashboard.jsx:148`, `:262`, `:299`; `src/services/dashboardService.js:81` | Sim para contagem de obras/diários, soma dos orçamentos do mês e atividades; eficiência indisponível e progresso vazio. Execução NÃO VERIFICADO. |
| Listar projetos | PRONTO | Projetos: `front-login/src/pages/Projetos.jsx:441`; `front-login/src/services/projetosService.js:96` | Integração implementada; execução NÃO VERIFICADO. |
| Criar projeto com cliente existente | PRONTO | Novo Projeto: `front-login/src/pages/Projetos.jsx:196`, `:251`; `front-login/src/services/projetosService.js:137` | Integração implementada; execução NÃO VERIFICADO. |
| Criar cliente novo | PRONTO | Projetos → Novo Projeto → + Novo cliente: `front-login/src/pages/Projetos.jsx:144`; `front-login/src/services/clientesService.js:40` | Integração implementada; execução NÃO VERIFICADO. Somente dados fictícios. |
| Editar projeto | PRONTO | Projetos → Editar: `front-login/src/pages/Projetos.jsx:684`; `front-login/src/services/projetosService.js:132` | Integração implementada; execução NÃO VERIFICADO. Cliente fica desabilitado; não há troca de cliente pela tela. |
| Registrar diário de obra (RDO) | PRONTO | Diário de Obra → Novo Registro: `front-login/src/pages/Diario.jsx:455`; `front-login/src/services/diarioService.js:226` | Integração implementada; execução NÃO VERIFICADO. |
| Anexar fotos ao RDO | PRONTO | Novo Registro → Adicionar fotos: `front-login/src/pages/Diario.jsx:636`; `front-login/src/services/diarioService.js:214` | Envio das fotos antes de salvar o diário implementado; execução NÃO VERIFICADO. |
| Listar diários | PRONTO | Diário de Obra → Ver detalhes: `front-login/src/pages/Diario.jsx:697`, `:121`; `front-login/src/services/diarioService.js:154` | Integração implementada; execução NÃO VERIFICADO. |
| Criar orçamento | PRONTO | Orçamentos → Novo Orçamento: `front-login/src/pages/Orcamentos.jsx:760`; `front-login/src/services/orcamentosService.js:210` | Integração implementada; execução NÃO VERIFICADO. Nome, descrição opcional e valor total. |
| Enviar orçamento ao cliente (link do WhatsApp) | PRONTO | Orçamentos → Abrir → Enviar ao cliente / Copiar mensagem: `front-login/src/pages/Orcamentos.jsx:719`, `:729`, `:802` | Dados reais do orçamento e link externo implementados. Não usa envio automático nem confirma entrega. Execução externa NÃO VERIFICADO. |
| Enviar e versionar arquivos pela tela | PARCIAL | Adicionar fotos em `front-login/src/pages/Diario.jsx:636`; menus em `front-login/src/components/Layout.jsx:13` | Envio de fotos pela tela; versionamento implementado no servidor, sem tela para documentos gerais e consulta de versões. Execução NÃO VERIFICADO. |
| Relatórios | AUSENTE | Página `front-login/src/pages/Relatorios.jsx:1`; `front-login/src/services/relatoriosService.js:12`; grupos reais em `src/routes/index.js:15` | Não no uso real. Página demonstrativa usa dados simulados, fica fora do menu e chama rotas inexistentes no modo real. |

Resultado: 11 PRONTO, 2 PARCIAL e 1 AUSENTE. Todas as páginas e serviços em `front-login/src/pages/` e `front-login/src/services/`, `front-login/src/App.jsx`, README, `docs/demo.md` e `docs/contrato-api.md` foram inspecionados. Nenhuma mudança de implementação nesta preparação.

## Estado inicial do Git

`git branch --show-current`: `chore/congelamento`. Branch solicitada para o kit: `docs/validacao`, criada a partir desse estado, sem atualizar a origem remota.

`git status --short` antes de criar arquivos:

```text
 M .dockerignore
 M docs/2026-10-26.md
```

Essas duas alterações anteriores ficam preservadas e fora dos commits do kit.

`git log --oneline -10` inicial:

```text
456606b docs: roteiro e checklist da demonstração
24bfd13 test: smoke e coleção Postman cobrem orçamentos
65317f0 feat(front): envio do orçamento por link do WhatsApp
30f1d7f feat(front): orçamentos na API real
86ba32c docs: contrato e README com orçamentos
8ab1e13 feat(orcamentos): API de orçamentos por projeto
29735fd feat(front): upload de fotos antes de registrar o diário
de5d0e3 feat(front): diário de obra na API real
6500b3e chore(seed): datas relativas ao dia atual
ed02d54 fix: correções mínimas de front e dashboard
```

## Verificações em 16/11/2026

| Comando / verificação | Resultado observado |
|---|---|
| `curl --silent --show-error --max-time 5 http://localhost:3000/api/health` | Código 7: `Failed to connect to localhost port 3000 after 0 ms: Could not connect to server`. |
| API e banco por consulta de saúde | NÃO VERIFICADO: a conexão local falhou; o banco não pôde ser avaliado pela consulta. Não foram iniciados serviços nem alterado o ambiente para contornar. |
| `npm run check` antes do kit | `Sintaxe OK em 44 arquivos.` |
| `npm run smoke` | NÃO VERIFICADO: não executado porque a API local está inacessível, conforme a consulta acima. |
| `cd front-login && npm run build` | Aprovado: 62 módulos transformados, `built in 662ms`. |
| Ensaio de tarefas no navegador e abertura do WhatsApp | NÃO VERIFICADO: sessão interativa não executada. Conferir antes do encontro. |

Sintaxe e build foram executados localmente porque independem de banco e rede; não substituem o smoke. Não houve instalação, migration, reset, seed, envio ao remoto, merge ou tag.

## Decisões de escopo

Cinco tarefas: localizar projeto, editar projeto, registrar diário com fotos, criar orçamento e preparar mensagem. Login será feito previamente pela equipe com conta de demonstração. Cadastros de conta/cliente e criação de projeto ficam fora apenas pelo limite de tempo e para não solicitar dados pessoais. Abertura no WhatsApp pode expor a conta de quem abrir: na sessão, essa etapa usa exclusivamente o equipamento e a conta de demonstração da equipe; nunca a conta do participante e nunca envio a contato real. Se isso não estiver preparado, interromper a etapa e registrar a limitação, sem atribuir conclusão ao participante.

O roteiro é avaliado pelo código, não por resultados da apresentação de 15/11, que são desconhecidos. Não se deve tratar avaliação por vídeo como teste prático. O plano remoto identifica essa diferença.
