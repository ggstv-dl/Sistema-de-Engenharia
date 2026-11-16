# Retrospectiva da demonstração de 15/11/2026 — modelo para preencher

Este modelo não registra resultados da apresentação. Preencher somente com o que foi observado, sem identificação de participantes ou público. As limitações no final já estavam documentadas; não significam que tenham provocado falhas durante a demonstração.

## O que funcionou

<!-- Preencher com fatos observados na apresentação. -->

## O que falhou ou travou

| Momento da demo | O que aconteceu | Gravidade (alta/média/baixa) | Causa provável | Ação |
|---|---|---|---|---|
| | | | | |
| | | | | |

## Perguntas do público/professor

<!-- Preencher com perguntas efetivamente feitas, sem identificar quem perguntou. -->

## Decisões

<!-- Preencher com decisões realmente tomadas e próximas ações, sem identificação pessoal. -->

## Limitações já documentadas

As referências abaixo são para a equipe, usando a versão auditada em 16/11/2026. Nenhuma limitação foi acrescentada por suposição.

| Limitação existente | Origem no repositório |
|---|---|
| Não há operação sem conexão com fila para enviar registros depois; o modo de demonstração é separado do uso real. | [docs/demo.md:127](../demo.md#limitações-e-respostas-ao-professor) |
| A consulta de preços SINAPI contém exemplos, sem consulta oficial implementada no servidor. | [docs/demo.md:128](../demo.md#limitações-e-respostas-ao-professor); [README.md:73](../../README.md#front) |
| Aceita envio de PDF existente, mas não gera automaticamente um PDF do orçamento real; impressão do orçamento só no modo de demonstração. | [docs/demo.md:129](../demo.md#limitações-e-respostas-ao-professor); [README.md:142](../../README.md#previstos-ainda-não-implementados) |
| O envio oficial automático pelo WhatsApp não está implementado; o fluxo disponível abre uma mensagem por link e depende da confirmação do usuário. | [docs/demo.md:130](../demo.md#limitações-e-respostas-ao-professor); [README.md:142](../../README.md#previstos-ainda-não-implementados) |
| Projetos têm lista e filtros por situação, sem quadro Kanban arrastável. | [docs/demo.md:131](../demo.md#limitações-e-respostas-ao-professor) |
| Não há conjunto versionado de testes unitários; há verificações de sintaxe, testes de fluxo e coleção de requisições. | [docs/demo.md:132](../demo.md#limitações-e-respostas-ao-professor) |
| Os arquivos em `/uploads` são públicos para quem conhece o endereço aleatório. | [docs/demo.md:133](../demo.md#limitações-e-respostas-ao-professor); [README.md:153](../../README.md#autenticação-e-autorização) |
| A identificação de acesso da sessão fica no armazenamento do navegador, acessível aos programas da página. | [docs/demo.md:134](../demo.md#limitações-e-respostas-ao-professor) |
| O painel não calcula eficiência nem progresso; a contagem de diários é o total, sem representar aprovação ou pendências. | [docs/demo.md:135](../demo.md#limitações-e-respostas-ao-professor) |
| Orçamentos reais têm criação e consulta de título, descrição e valor; não há edição, exclusão, itens, BDI, validade ou acompanhamento do envio. | [docs/demo.md:136](../demo.md#limitações-e-respostas-ao-professor) |
| Fotos já enviadas permanecem mesmo se o formulário for abandonado; não há remoção nesse fluxo. | [docs/demo.md:137](../demo.md#limitações-e-respostas-ao-professor) |
| Relatórios estão fora do menu e não estão disponíveis com dados do sistema real. | [README.md:73](../../README.md#front); [docs/demo.md:139](../demo.md#limitações-e-respostas-ao-professor) |
