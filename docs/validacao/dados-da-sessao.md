# Dados fictícios para a sessão de 18/11/2026

O grupo definiu um conjunto de exemplos para a conta `convidado.validacao@exemplo.com`, identificada como `Engenheiro(a) Convidado(a)`. O comando `node scripts/validacao-preparar.js` prepara esses registros somente pela interface HTTP do sistema. As pessoas, os empreendimentos e as atividades descritos são fictícios, inclusive quando o título não contém a palavra “exemplo”. O contato operacional será exclusivamente o número do facilitador, informado em `VALIDACAO_TELEFONE`, sem reprodução neste documento ou em arquivos de configuração. A credencial de acesso será informada em `VALIDACAO_SENHA`, sem valor padrão ou armazenamento em arquivo.

## Clientes e projetos previstos

| Cliente fictício | E-mail fictício |
|---|---|
| Família Almeida (exemplo) | `familia.almeida.validacao@exemplo.com` |
| Condomínio Vila Verde (exemplo) | `condominio.vila.verde.validacao@exemplo.com` |

| Projeto fictício | Cliente | Situação inicial | Prioridade | Início relativo à primeira preparação |
|---|---|---|---|---|
| Residencial Vila Verde - Bloco B | Família Almeida (exemplo) | Em Planejamento | Alta | 30 dias antes |
| Galpão Logístico Cerrado | Condomínio Vila Verde (exemplo) | Em Andamento | Média | 60 dias antes |
| Reforma da Escola Municipal (exemplo) | Condomínio Vila Verde (exemplo) | Concluído | Baixa | 120 dias antes |

Os três projetos utilizam `Balsas - MA`. A preparação consulta os títulos na conta de convidado antes de criar registros. Uma nova execução sequencial preserva os registros existentes e suas datas; não desfaz mudanças de ensaio. Nomes duplicados, cliente divergente, mudança de situação/prioridade ou contato diferente do informado interrompem o procedimento, sem edição ou exclusão automática.

## Diários previstos, sem fotos

Cada diário inclui clima, relato fictício de duas frases, mão de obra e equipamentos compatíveis. As datas são anteriores à primeira execução, sem registros futuros.

| Atividade fictícia | Projeto | Dias anteriores à preparação | Clima |
|---|---|---|---|
| Levantamento e locação preliminar (exemplo) | Residencial Vila Verde - Bloco B | 9 | Ensolarado |
| Concretagem dos pilares (exemplo) | Galpão Logístico Cerrado | 7 | Nublado |
| Alvenaria de vedação (exemplo) | Galpão Logístico Cerrado | 5 | Ensolarado |
| Interrupção por chuva (exemplo) | Galpão Logístico Cerrado | 4 | Chuvoso |
| Passagem de eletrodutos (exemplo) | Reforma da Escola Municipal (exemplo) | 2 | Nublado |
| Vistoria final da reforma (exemplo) | Reforma da Escola Municipal (exemplo) | 1 | Ensolarado |

## Documento e orçamentos de reserva

O primeiro projeto receberá `planta-vila-verde-bloco-b.pdf`, com exatamente as versões 1 e 2. O script gera o PDF mínimo em memória, com uma página vazia válida para testar upload/versionamento, sem conteúdo de planta real. Se houver mais versões ou uma sequência inconsistente, interromperá os uploads.

| Orçamento fictício de reserva | Projeto | Valor |
|---|---|---|
| Estrutura e alvenaria - Vila Verde (exemplo) | Residencial Vila Verde - Bloco B | R$ 38.500,50 |
| Cobertura e piso - Cerrado (exemplo) | Galpão Logístico Cerrado | R$ 67.200,00 |

As rotas de orçamento existem em `src/routes/orcamentos.js` e estão montadas em `src/routes/index.js`. Caso sejam removidas, o preparador deverá informar que pulou os orçamentos, e T4/T5 não poderão ser tratadas como prontas. O documento versionado não é uma tarefa da sessão: não há tela para consultar suas versões. O envio oficial automático pelo WhatsApp também permanece ausente; a sessão utiliza somente abertura e cópia da mensagem, sem envio.

## Mapeamento das tarefas e nomes sugeridos

| Tarefa do roteiro | Dado que deverá existir antes | Dado criado ou alterado pelo participante | Tela e rota real |
|---|---|---|---|
| T1 — localizar obra, 3 min | Residencial Vila Verde - Bloco B, Em Planejamento | Nenhum; busca e leitura da situação | Projetos; `GET /api/projetos` |
| T2 — atualizar situação, 4 min | Mesmo projeto | Alteração para Em Andamento | Projetos → Editar; `PUT /api/projetos/:id` |
| T3 — registrar visita, 4 min | Mesmo projeto e duas imagens de amostra no computador | Novo diário com atividade `Conferência da laje`, relato `Conferida a laje; sem ocorrências no cenário de teste`, data do dia e duas fotos | Diário de Obra → Novo Registro → Ver detalhes; `POST /api/projetos/:id/arquivos`, `POST /api/rdo/sync`, `GET /api/diarios` |
| T4 — orçamento, 4 min | Mesmo projeto e cliente fictício | `Reparo da laje — teste`, descrição `Estrutura e alvenaria`, valor `12.500,50` | Orçamentos → Novo Orçamento; `POST /api/projetos/:id/orcamentos` |
| T5 — mensagem, 4 min | Orçamento criado em T4; na impossibilidade, orçamento de reserva do primeiro projeto | Nenhum registro; mensagem aberta e copiada, sem apertar Enviar | Orçamentos → Abrir → Enviar ao cliente / Copiar mensagem; link externo |

Os nomes de novos registros reservados ao participante são `Conferência da laje` e `Reparo da laje — teste`; o preparador não os cria. O título da obra é apenas um critério de busca/seleção, não um cadastro solicitado ao participante. Os dados de reserva não deverão ser apresentados como trabalho dele. Para T5, a equipe utilizará equipamento e conta de demonstração próprios com o contato do facilitador, sem pedir dados pessoais ou conta do participante.

## Divergências registradas pelo grupo

O roteiro anterior utiliza `Obra Ipê — teste`, enquanto este conjunto requer os três títulos acima. Para aplicar este ambiente, a equipe deverá substituir oralmente apenas a referência à obra por `Residencial Vila Verde - Bloco B` em T1–T4, mantendo os critérios e os tempos. O arquivo anterior não foi editado, e o preparador não cria um quarto projeto. Essa adaptação precisa ser conferida antes da sessão; seguir literalmente o título antigo impediria T1.

O roteiro pede um diário e um orçamento de reserva na mesma obra. O conjunto oferece um diário preliminar e um orçamento com nome diferente no primeiro projeto, preservando os nomes da atividade e do orçamento da sessão. As fotos só serão anexadas pelo participante, com as amostras geradas nesta preparação. O questionário permanece inalterado e sem coleta de identificação; não houve divergência em sua estrutura. A opinião de T5 será sobre preparar a mensagem, sem comprovação de entrega.

Clientes são globais no sistema, sem proprietário por engenheiro. Após o seed, a conta verá também os clientes já existentes; somente os dois exemplos acima pertencem ao conjunto planejado. O verificador deverá apresentar as contagens globais e dos exemplos, sem atribuir todos os clientes ao convidado. A restauração do banco não remove arquivos físicos de upload: os arquivos adicionais de ensaio poderão permanecer no disco, embora deixem de ser referenciados pelos dados restaurados.
