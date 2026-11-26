# Roteiro do vídeo de demonstração — 26/11/2026

O grupo preparou um vídeo de 4 minutos e 10 segundos, a ser gravado pelo apresentador. A auditoria abaixo distingue implementação existente e execução integrada atual. PRONTO significa fluxo confirmado no código com rota real; a filmagem só deve começar após o ensaio local. A consulta atual à API e ao front retornou NÃO VERIFICADO (`EPERM`), sem tentativa de contornar a restrição.

## Parte A — auditoria rápida

| Cena possível | Status (PRONTO / PARCIAL / AUSENTE) | Tela e arquivo:linha | Funciona com a API real? |
|---|---|---|---|
| Login | PRONTO | `front-login/src/pages/Login.jsx:60`; `front-login/src/services/authService.js:41`; `src/routes/auth.js:7` | Sim, implementação em `/api/auth/login`; execução atual NÃO VERIFICADA |
| Painel: obras, total de diários e custo do mês | PRONTO | `front-login/src/pages/Dashboard.jsx:239`; `front-login/src/services/dashboardService.js:53`; `src/routes/dashboard.js:7` | Sim, `/api/dashboard`; recorte sem eficiência ou progresso calculados |
| Listar projetos | PRONTO | `front-login/src/pages/Projetos.jsx:424`; `front-login/src/services/projetosService.js:96`; `src/routes/projetos.js:8` | Sim, `GET /api/projetos` |
| Criar projeto com cliente existente | PRONTO | `front-login/src/pages/Projetos.jsx:240`; `front-login/src/services/projetosService.js:137`; `src/routes/projetos.js:9` | Sim; exige selecionar cliente, sem inventar cadastro implícito |
| Registrar RDO com duas fotos | PRONTO | `front-login/src/pages/Diario.jsx:508`, `:636`, `:673`; `front-login/src/services/diarioService.js:214`, `:226`; `src/routes/rdo.js:8` | Sim; upload por projeto antes de `/api/rdo/sync` |
| Ver RDO na lista com fotos | PRONTO | `front-login/src/pages/Diario.jsx:121`, `:141`, `:223`; `front-login/src/services/diarioService.js:154`; `src/routes/diarios.js:8` | Sim, `GET /api/diarios`; conferir as duas imagens físicas, sem aceitar imagem indisponível |
| Criar orçamento | PRONTO | `front-login/src/pages/Orcamentos.jsx:820`, `:854`; `front-login/src/services/orcamentosService.js:210`; `src/routes/orcamentos.js:7` | Sim, criação por projeto e listagem global reais |
| Mostrar mensagem pronta para WhatsApp | PRONTO | `front-login/src/pages/Orcamentos.jsx:729`, `:803`; `front-login/src/services/orcamentoMapeamento.js:59` | Usa o orçamento real; texto montado no navegador e copiado, sem endpoint de envio oficial |
| Executar `npm run smoke` no terminal e apresentar aprovação | PARCIAL | `scripts/smoke.js:216`, `:277`; `docs/congelamento.md:20` | Script implementado, mas aprovação integrada NÃO VERIFICADA; o registro contém 0 OK e 46 falhas por conexão bloqueada |

Login e painel serão uma única cena. As cenas de abertura, preparação e fechamento são explicativas, sem representar funcionalidades adicionais. A validação atual de rede não substitui o ensaio e não garante que todas as telas estejam prontas no computador de gravação.

## Dados e privacidade antes de filmar

- Usar uma conta de demonstração com nome fictício, sem contas pessoais. Preencher o login fora da captura; não exibir credencial, sessão ou ferramentas de desenvolvedor.
- Preparar pela tela, antes da gravação, o cliente `Cliente Vídeo (fictício)` usando `+ Novo cliente`: nome citado, e-mail `cliente.video@example.invalid` e telefone composto por dez zeros, deliberadamente sem contato utilizável. O validador existente exige apenas a quantidade de dígitos. Não abrir nem testar envio para esse contato.
- Criar na tomada a obra `Obra Vídeo (fictícia)`, situação `Em Andamento`, prioridade `Média`, localização `Local fictício`, data do dia. Não mostrar dados reais de outros clientes ao abrir a seleção.
- Usar `docs/validacao/fotos-exemplo/foto-obra-1.png` e `foto-obra-2.png`, já existentes e fictícias. Conferir o seletor de arquivos antes de filmar, para não mostrar pastas pessoais.
- Em toda cena, esconder favoritos, abas pessoais, notificações, barra de tarefas, credencial, sessão e qualquer identificação real no logotipo, cabeçalho ou perfil. Recortar ou cobrir essas regiões no OBS, sem mudar o código. A apresentação dos integrantes usa apenas `[equipe: nomes]`, a substituir pelo apresentador.
- Abrir um editor local vazio, sem arquivos recentes visíveis; o rascunho serve somente para mostrar o texto copiado. Não salvar o rascunho e não abrir WhatsApp pessoal.

## Parte B — plano de cenas

| Nº | Início-fim | Tela e ações exatas (dados fictícios) | O que a narração diz (1 frase) | Observação de gravação |
|---|---|---|---|---|
| 1 | 00:00–00:20 | Tela de login com o título do sistema; apresentar problema e equipe, sem digitar dados | O grupo reuniu projeto, diário e orçamento para apoiar o trabalho do engenheiro autônomo. | Visível: área central limpa; esconder logo ou identificação real, abas, favoritos, notificações e campos de acesso. |
| 2 | 00:20–00:45 | Com os campos de demonstração preenchidos fora da captura, clicar Entrar; enquadrar Obras Ativas, Diários Registrados e Custo Total (MTD) | O painel consulta os registros salvos da conta de demonstração. | Visível: três indicadores; esconder campos do login, nome real, sessão e demais regiões; não atribuir valores previstos ao painel. |
| 3 | 00:45–01:25 | Projetos → buscar obra fictícia existente, limpar busca → Novo Projeto → Nome do projeto: Obra Vídeo (fictícia) → Cliente: Cliente Vídeo (fictício) → Localização: Local fictício → Status: Em Andamento → Prioridade: Média → Data de início: hoje → Salvar; localizar a nova linha | A obra fica vinculada ao cliente selecionado e será usada nas etapas seguintes. | Visível: campos e linha criada; esconder demais nomes da seleção e identificação no cabeçalho, além das regiões comuns. |
| 4 | 01:25–02:20 | Diário de Obra → Novo Registro → Projeto: Obra Vídeo (fictícia) → Atividade do dia: Conferência da laje → Data: hoje → Relato das atividades: Conferida a laje; sem ocorrências no cenário fictício → Adicionar fotos → selecionar as duas amostras → Salvar registro; aguardar o fim | O diário guarda o relato da visita e as duas imagens na mesma obra. | Visível: campos, duas prévias e conclusão do salvamento; esconder caminhos pessoais no seletor, nomes reais e regiões comuns; sem acelerar uma falha. |
| 5 | 02:20–02:40 | Na lista do Diário de Obra, localizar Conferência da laje → Ver detalhes → enquadrar relato e as duas imagens | A consulta do registro permite conferir o conteúdo que ficou salvo. | Visível: duas imagens carregadas; esconder identificação real e regiões comuns; se surgir Imagem indisponível, interromper a tomada. |
| 6 | 02:40–03:25 | Orçamentos → Novo Orçamento → Projeto: Obra Vídeo (fictícia) → Nome: Reparo da laje — vídeo → Descrição (opcional): Estrutura e alvenaria → Valor (R$): 12.500,50 → Salvar orçamento → localizar item → Abrir → Copiar mensagem → colar no rascunho vazio; se a cópia automática falhar, selecionar o texto na caixa exibida e copiar manualmente | O orçamento salvo gera uma mensagem pronta, que será mostrada sem concluir envio. | Visível: projeto, descrição, total e texto copiado; esconder telefone, contas, abas, favoritos e sessão; não clicar Enviar ao cliente nem abrir contatos. |
| 7 | 03:25–03:45 | Mostrar somente o título do kit anônimo e o cabeçalho do registro de congelamento, em prévia limpa; não abrir respostas ou terminais de configuração | O grupo organizou a preparação da avaliação e registrou as pendências de verificação. | Visível: títulos sem nomes, contatos ou respostas; esconder caminhos pessoais, abas e favoritos; não anunciar resultados de validação. |
| 8 | 03:45–04:10 | Voltar à lista da obra fictícia e manter a tela estável enquanto fala de tecnologias, limitações e próximos passos | O sistema usa React, Express, Prisma e PostgreSQL e ainda tem limitações que orientam os próximos passos. | Visível: obra fictícia e fechamento; esconder identificação real e regiões comuns; agradecer ao final. |

**Soma:** 20 + 25 + 40 + 55 + 20 + 45 + 20 + 25 = 250 segundos = 4:10. A fala completa está em [narracao.md](narracao.md). O SRT usa o ritmo da leitura, não os tempos fixos desta tabela; ensaiar e ajustar o ritmo, o deslocamento e os cortes antes da exportação.

## Fora do vídeo

- Smoke no terminal e demonstração de 404 entre engenheiros: aprovação integrada não comprovada nas fontes permitidas; não mostrar comandos como evidência de sucesso nem reutilizar metas como resultados.
- Resultados e melhorias decorrentes da validação: os arquivos disponíveis registram preparação e exemplos fictícios; a lista priorizada está ausente. O parceiro será referido apenas como engenheiro autônomo, parceiro do projeto.
- Eficiência, progresso calculado, relatórios reais, SINAPI real, operação offline, geração automática de PDF, edição/exclusão de orçamento e Kanban: ausentes ou parciais no fluxo real; não apresentar o mock como implementação.
- Envio concluído ou integração oficial do WhatsApp: fora do escopo; o servidor tem stub 501 e a cena mostra apenas o texto copiado.
- Cadastro de cliente durante a tomada: o recurso existe, mas exige contato e consome o tempo do vídeo; preparar o cliente fictício antes.

## Evidências que faltam

| Informação | Valor para eventual atualização | Fonte permitida |
|---|---|---|
| Número real de participantes | [preencher] | `docs/validacao/resultados.md`, quando contiver resultados reais |
| Achados anônimos da validação | [preencher] | Mesmo documento, sem usar os exemplos fictícios |
| Melhorias decorrentes desses achados | [preencher] | `docs/melhorias-implementadas.md`, quando houver evidência real |
| Resultado integrado aprovado do smoke para uma eventual cena futura | [preencher] | `docs/congelamento.md`, após atualização autorizada |

Esses campos não serão lidos na narração nem preenchidos com números presumidos. O link de hospedagem ficará como `[preencher]` no README. A gravação e o envio da mídia serão feitos pelo apresentador, após o [checklist](checklist-gravacao.md).
