# Kit de validação — preparação em 16/11/2026

Em 16/11/2026, o grupo reuniu a documentação do projeto e analisou as funcionalidades disponíveis. Em seguida, preparou os materiais para uma sessão de até 30 minutos, prevista para quarta-feira, 18/11/2026, com participação anônima de engenheiro(a). Este documento apresenta o levantamento e as decisões do grupo; os textos destinados ao participante estão vinculados abaixo.

- [Roteiro da sessão e ficha de observação](roteiro-sessao.md)
- [Questionário e configuração do formulário](questionario.md)
- [Convites](convite.md)
- [Consentimento oral](consentimento.md)
- [Alternativa remota](plano-b-remoto.md)
- [Retrospectiva da demo — modelo em branco](retrospectiva-demo.md)
- [Resumo de resultados e exemplos fictícios](resultados.md)

## Levantamento técnico realizado pelo grupo

Primeiro, o grupo examinou o código sem modificar a implementação e consolidou o levantamento na tabela abaixo. Depois, utilizou somente as linhas PRONTO para selecionar as tarefas da sessão. Essa classificação indica um fluxo implementado, sem comprovar sua execução integrada naquela data. O grupo excluiu das tarefas os itens PARCIAL e AUSENTE. Os caminhos são relativos à raiz do repositório e foram conferidos em 16/11/2026.

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

O grupo identificou 11 funcionalidades PRONTO, 2 PARCIAL e 1 AUSENTE. Para esse levantamento, inspecionou todas as páginas e serviços em `front-login/src/pages/` e `front-login/src/services/`, além de `front-login/src/App.jsx`, README, `docs/demo.md` e `docs/contrato-api.md`. A preparação não incluiu mudanças na implementação.

## Estado inicial do Git

Antes de preparar os documentos, o grupo verificou a branch com `git branch --show-current`, que retornou `chore/congelamento`. Em seguida, criou `docs/validacao` a partir desse estado, sem atualizar a origem remota.

O grupo também consultou `git status --short` e identificou as seguintes alterações anteriores à preparação dos arquivos:

```text
 M .dockerignore
 M docs/2026-10-26.md
```

Durante a preparação do kit em 16/11, o grupo preservou essas duas alterações e as manteve fora dos commits correspondentes.

Na sequência, o grupo consultou os dez commits mais recentes com `git log --oneline -10`:

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
| API e banco por consulta de saúde | NÃO VERIFICADO: a conexão local falhou, e o banco não pôde ser avaliado pela consulta. O grupo não iniciou serviços nem alterou o ambiente para contornar a restrição durante a auditoria. |
| `npm run check` antes do kit | `Sintaxe OK em 44 arquivos.` |
| `npm run smoke` | NÃO VERIFICADO: o grupo não executou o teste porque a API local estava inacessível naquela etapa, conforme a consulta acima. |
| `cd front-login && npm run build` | Aprovado: 62 módulos transformados, `built in 662ms`. |
| Ensaio de tarefas no navegador e abertura do WhatsApp | NÃO VERIFICADO: sessão interativa não executada na auditoria. O grupo deverá realizar o ensaio antes do encontro. |

Após o levantamento, o grupo executou localmente as verificações de sintaxe e build, pois elas independem de banco e rede. Registrou que esses resultados não substituem o smoke integrado, cuja execução ficou pendente devido à indisponibilidade da API naquela etapa. Durante a preparação do kit, não realizou instalação, migration, reset, seed, envio ao remoto, merge ou tag.

## Decisões de escopo

Com base no levantamento, o grupo selecionou cinco tarefas: localizar projeto, editar projeto, registrar diário com fotos, criar orçamento e preparar mensagem. Definiu que o login será realizado previamente pela equipe com conta de demonstração. Os cadastros de conta/cliente e a criação de projeto ficaram fora da sessão pelo limite de tempo e para evitar a solicitação de dados pessoais. Para a etapa do WhatsApp, o grupo estabeleceu o uso exclusivo de equipamento e conta de demonstração da equipe, sem conta do participante nem envio a contato real. Se essa condição não estiver preparada, a equipe deverá interromper a etapa e registrar a limitação, sem atribuir conclusão ao participante.

O grupo baseou o roteiro no código disponível e manteve sem preenchimento os resultados da apresentação de 15/11, que não constavam dos registros consultados. Também diferenciou a opinião sobre um vídeo da execução de um teste prático, mantendo essa distinção no plano remoto.

## Conferências realizadas pelo grupo

Após elaborar os materiais, o grupo conferiu programaticamente a distribuição de tempo: `3 + 3 + 4 + 4 + 4 + 4 + 5 + 3 = 30 minutos`, com cinco tarefas de até quatro minutos cada. Em seguida, confirmou a estrutura do questionário: 3 perguntas de perfil, 8 afirmações de escala, 1 recomendação de 0–10 e 4 abertas. Verificou também o consentimento com 6 linhas e a alternativa remota com 10 linhas. Na retrospectiva, manteve os quatro blocos de resultados sem fatos preenchidos e incluiu somente 12 limitações com fontes.

| Tarefa | Linha PRONTO na auditoria | Tela | Evidência |
|---|---|---|---|
| T1 | Listar projetos | Projetos | `front-login/src/pages/Projetos.jsx:441` |
| T2 | Editar projeto | Projetos → Editar | `front-login/src/pages/Projetos.jsx:684` |
| T3 | Registrar diário de obra (RDO) | Diário de Obra → Novo Registro | `front-login/src/pages/Diario.jsx:455` |
| T3 | Anexar fotos ao RDO | Adicionar fotos | `front-login/src/pages/Diario.jsx:636` |
| T3 | Listar diários | Ver detalhes | `front-login/src/pages/Diario.jsx:121` |
| T4 | Criar orçamento | Novo Orçamento | `front-login/src/pages/Orcamentos.jsx:760` |
| T5 | Enviar orçamento ao cliente (link do WhatsApp) | Enviar ao cliente / Copiar mensagem | `front-login/src/pages/Orcamentos.jsx:719`, `:729` |

O grupo conferiu por programa o vínculo de cada tarefa com uma linha PRONTO e a existência das referências de código. Na revisão de privacidade, realizou buscas textuais sem encontrar pedidos de identificação ou credenciais literais nos arquivos novos. As menções à coleta de contato no questionário orientam sua desativação, e os campos de título utilizam exemplos fictícios. O grupo não copiou dados da configuração local para os documentos.

Depois de conferir o levantamento, o roteiro, o questionário e o modelo de retrospectiva, o grupo implementou o resumo local dos resultados. A indisponibilidade do servidor permaneceu registrada como NÃO VERIFICADO, sem tentativa de contorno nessa etapa. O grupo obteve os seguintes resultados nas verificações do resumo:

- `node --check scripts/validacao-resumo.js`: código de saída 0.
- `npm run check` após adicionar o script: `Sintaxe OK em 45 arquivos.`
- Comando com os dois CSVs fictícios: 3 respondentes; médias 4,00 / 3,00 / 4,67 / 4,00 / 4,67 / 4,00 / 3,50 / 4,67; recomendação 8,50 e 50,00% de notas 9–10, com duas respostas válidas.
- Observações fictícias: conclusão independente T1 66,67%, T2 100,00%, T3 33,33%, T4 66,67%, T5 66,67%; tempos médios 2,33 / 2,50 / 3,67 / 3,25 / 3,00 minutos.
- 23 cenários de leitura, cálculo e erros aprovados, executados por verificação temporária: vírgula/ponto e vírgula, BOM/CRLF, aspas duplicadas, célula com quebra de linha, escala pela ordem, colunas reordenadas, ausência de horário, somente cabeçalho, linha vazia, notas inválidas, numeração parcial/repetida, formato incorreto, arquivo ausente, argumentos ausentes, campos de observação inválidos. Erros retornam código 1 sem imprimir um resumo parcial. Os arquivos temporários foram removidos automaticamente.
- O script usa apenas Node nativo e não grava arquivos. O campo de comandos do `package.json` ganhou somente `validacao:resumo`; dependências e demais configurações foram preservadas. A seção nova do README tem cinco linhas, incluindo título e linhas vazias.

Por fim, o grupo reuniu os cinco materiais da sessão, este levantamento, o modelo de retrospectiva e as orientações de `resultados.md` em `docs/validacao/`. Manteve as alterações nos caminhos definidos para a preparação, sem modificar as funcionalidades do sistema.
