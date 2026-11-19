# Registro das melhorias — 19/11/2026

O grupo conferiu o checkout da branch `docs/validacao-resultados`, no commit `7f37aa5e87c9c46be5160705b4a49fb614cd0412`, e criou `feat/melhorias-validacao` a partir dele. As referências remotas não foram atualizadas nesta etapa; este registro descreve somente os arquivos locais.

## Parte A — decisão

`docs/validacao/melhorias.md` não existe neste checkout. `docs/validacao/resultados.md:1` é o guia de resumo local com exemplos explicitamente fictícios, sem resultados processados da sessão. O grupo não presumiu a realização nem os resultados da validação a partir desses exemplos.

| Item lido em melhorias.md | ACEITO / RECUSADO | Arquivos previstos | Critério de aceite | Encaminhamento |
|---|---|---|---|---|
| Nenhum: arquivo ausente | Não aplicável; nenhum item avaliado | Nenhum arquivo de implementação | Não disponível | Pular a Parte B e seguir para C, conforme o pedido |

Não houve melhorias de código implementadas em 19/11 nesta execução. As travas de quantidade, esforço, contrato, migrations, quatro arquivos e aproximadamente 150 linhas não puderam ser aplicadas a itens inexistentes. O grupo não criou IDs, evidências, estimativas nem critérios de aceite.

## Melhorias implementadas a partir da validação

Sem itens para preencher a tabela abaixo; nenhum resultado foi inventado.

| ID | Problema (evidência da validação) | Antes | Depois | Arquivos | Como verificar | Commit |
|---|---|---|---|---|---|---|

## Melhorias estruturais do histórico recente

A relação abaixo foi extraída dos últimos 15 commits de `git log --oneline` e dos arquivos associados a cada commit. São alterações anteriores já presentes no checkout, não implementações desta sessão nem evidências de respostas de participantes. O grupo não atribuiu novas datas a elas.

| Commit | Melhoria estrutural registrada no histórico | Arquivos principais | Evidência consultada |
|---|---|---|---|
| `24bfd13` | Cobertura de orçamentos no smoke e na coleção Postman | `scripts/smoke.js`, `docs/postman/crm-engenharia.postman_collection.json` | `git show --stat 24bfd13` |
| `fa64e6a` | Comando de resumo local com exemplos fictícios | `scripts/validacao-resumo.js`, `docs/validacao/exemplos/` | `git show --stat fa64e6a` |
| `da708cd` | Preparação dos exemplos fictícios da sessão | `scripts/validacao-preparar.js`, `docs/validacao/dados-da-sessao.md` | `git show --stat da708cd` |
| `3fcd45d` | Geração de fotos fictícias de demonstração | `scripts/validacao-fotos.js`, `docs/validacao/fotos-exemplo/` | `git log --name-only` |
| `cd07bfa` | Verificação de prontidão da sessão | `scripts/validacao-check.js` | `git show --stat cd07bfa` |
| `11214bf` | Procedimento do ambiente e ficha de ensaio | `docs/validacao/ambiente.md`, `docs/validacao/ensaio.md`, `README.md` | `git log --name-only` |
| `7f37aa5` | Fichas de coleta e proteção dos CSVs reais no Git | `docs/validacao/dia-da-sessao.md`, `docs/validacao/dados/`, `.gitignore` | `git show --stat 7f37aa5` |

## Adiados e próximos passos

Não há itens individuais de validação recusados ou adiados, porque não foi encontrada a lista de melhorias. As pendências abaixo são condições para concluir a verificação, sem introduzir funcionalidades.

| Pendência | Motivo | Próxima ação |
|---|---|---|
| Localizar os resultados processados e a lista priorizada | `melhorias.md` ausente e `resultados.md` ainda é um guia com exemplos fictícios | Disponibilizar os documentos reais e anônimos antes de atribuir mudanças à validação |
| Verificação integrada da API e do banco | Smoke: 0 OK, 46 FALHOU; diagnóstico da conexão: `fetch failed`, causa `EPERM` em `localhost:3000` | Executar o smoke no ambiente autorizado com API, banco e contas de teste disponíveis |
| Execução da coleção pelo Newman | Executável ausente; tentativa sem rede terminou em `ENOTCACHED` | Executar com Newman já disponível e guardar o resumo de requisições, asserções e falhas |
| Aprovação final e eventual tag | A meta de zero falhas integradas não foi demonstrada | Rever o [registro de congelamento](congelamento.md) após os testes; nenhuma tag foi criada |

## Escopo preservado

O grupo acrescentou somente este documento e `docs/congelamento.md`. Os sete pontos da auditoria de pequenas pendências já estavam atendidos no código e não receberam correções. A Parte D não foi executada, pois a verificação integrada da Parte C não passou.

Os arquivos anteriores do kit, os exemplos, os scripts, a coleção, o schema, as migrations e os códigos do front e do back foram preservados. O caminho `VITE_USE_MOCK=true` permanece no código existente; o build passou, mas a navegação mock no navegador não foi verificada nesta execução.

As alterações locais anteriores em `.dockerignore` e `docs/2026-10-26.md` foram preservadas e não integram o commit deste registro. Nenhuma dependência foi instalada; não foram executados migrate, reset, seed, push, merge ou tag.

Para identificar o commit deste registro após sua criação: `git log -1 --format=%H -- docs/melhorias-implementadas.md`.
