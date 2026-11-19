# Congelamento de escopo — 19/11/2026

O grupo registrou o congelamento de escopo; a aprovação dos testes integrados permanece pendente.

- Data: 19/11/2026, fuso `America/Sao_Paulo`.
- Branch: `feat/melhorias-validacao`, criada da branch atual `docs/validacao-resultados`.
- Último commit existente antes deste registro, usado na auditoria do código: `7f37aa5e87c9c46be5160705b4a49fb614cd0412`.
- Commit deste registro: consultar `git log -1 --format=%H -- docs/congelamento.md`; o hash acima identifica a revisão auditada, não o próprio commit documental.

## Decisão e melhorias

`docs/validacao/melhorias.md` está ausente, e `docs/validacao/resultados.md:1` ainda descreve o resumo local com exemplos fictícios. Conforme a Parte A, o grupo pulou a Parte B. Nenhuma melhoria de código foi implementada nesta execução; o [registro das melhorias](melhorias-implementadas.md) relaciona somente alterações estruturais comprovadas no histórico recente.

## Testes executados

| Comando | Resultado observado | Situação |
|---|---|---|
| `npm run check` | `Sintaxe OK em 48 arquivos.`; saída 0 | FEITO |
| `cd front-login && npm run build` | Vite 5.4.21: 62 módulos transformados; build concluído; saída 0 | FEITO |
| `npm run smoke` | `Resumo: 0 OK, 46 FALHOU (46 passos).`; saída 1 | NÃO VERIFICADO quanto ao funcionamento integrado: `fetch failed`; diagnóstico da conexão ao health: causa `EPERM` em `localhost:3000`; falhas seguintes incluem pré-condições não obtidas |
| `npm run postman:run` | Saída 1: `ENOTCACHED`, cache em modo `only-if-cached` sem resposta disponível | NÃO VERIFICADO: Newman não disponível; tentativa em modo offline e cache temporário vazio para respeitar a proibição de instalar dependências |

No Newman, a coleção não chegou a executar: nenhuma requisição ou asserção foi executada por ele e não existe contagem de falhas de testes. A leitura estática do JSON encontrou 45 requisições e 120 chamadas `pm.test`; esses números são de definição, não de aprovação. O cache temporário foi removido após a tentativa. API e banco não tiveram sua disponibilidade comprovada; o grupo não contornou a restrição de conexão nem alterou regras de negócio para aprovar testes.

## Auditoria das pequenas pendências

Os estados abaixo descrevem o código existente, sem atribuir correções a 19/11.

| Item | Estado | Evidência arquivo:linha |
|---|---|---|
| (a) `requestBlob` trata 401 como `request()` | FEITO | `front-login/src/services/api.js:19`: função comum; chamadas em `:55` e `:78`, condicionadas a 401 com autenticação |
| (b) Cadastro exige ao menos oito caracteres | FEITO | `front-login/src/pages/Login.jsx:16`: validação no modo criar; mensagem em `:17`, indicação em `:171`; login separado em `:18` |
| (c) Exemplo usa `VITE_USE_MOCK=false` | FEITO | `front-login/.env.example:6`, com comentário em `:5` |
| (d) Relatórios fora do menu | FEITO | `front-login/src/components/Layout.jsx:13`: lista contém apenas Dashboard, Projetos, Diário de Obra e Orçamentos |
| (e) Front não chama `/api/whatsapp` | FEITO | Busca literal em todos os 32 arquivos de `front-login/src`: zero ocorrências; link existente em `front-login/src/pages/Orcamentos.jsx:726` |
| (f) Seed sem datas fixas de 2024 | FEITO | Busca por `2024`: zero ocorrências; `prisma/seed.js:24`, `:26`, `:32`, `:74`, `:84`, `:146`, `:168` usam datas relativas |
| (g) README do front usa o caminho correto de login | FEITO | `front-login/README.md:17`: `/api/auth/login` |

## Pendências para aprovação

Nenhum dos itens (a)–(g) ficou FALTA. FALTA disponibilizar os documentos reais da validação mencionados no pedido, demonstrar o smoke integrado sem falhas e executar a coleção com Newman disponível. A Parte D não foi executada: a Parte C não obteve aprovação integrada e não há correções pequenas identificadas.

O critério de `git status` limpo não foi atendido porque já existiam alterações do usuário em `.dockerignore` e `docs/2026-10-26.md`; elas foram preservadas fora deste commit. O registro não declara prontidão para tag. Não foram realizados push, merge ou tag.

## Limitações conhecidas

Trechos preservados das fontes existentes, sem ampliação do escopo:

- “Não há PWA ou fila de sincronização offline; o mock local é separado do fluxo da API real.” — [docs/demo.md:127](demo.md).
- “A consulta e os preços do catálogo são demonstrativos no mock, sem integração SINAPI no servidor.” — [docs/demo.md:128](demo.md).
- “Há upload de PDF, mas não geração automática; a impressão do orçamento está somente no mock.” — [docs/demo.md:129](demo.md).
- “O endpoint oficial é um stub 501; o envio da demo usa `wa.me` e a conta do engenheiro.” — [docs/demo.md:130](demo.md).
- “Projetos têm listagem e filtros por status, sem um quadro Kanban arrastável.” — [docs/demo.md:131](demo.md).
- “Não há suíte unitária versionada; a automação inclui sintaxe, smoke HTTP e coleção Postman.” — [docs/demo.md:132](demo.md).
- “Os arquivos são públicos por URL aleatória, e quem conhece o caminho consegue acessá-los sem autenticação.” — [docs/demo.md:133](demo.md).
- “O token fica no localStorage e pode ser lido por JavaScript, uma limitação reconhecida deste MVP.” — [docs/demo.md:134](demo.md).
- “Eficiência e progresso não são calculados, e o indicador de diários representa o total de registros.” — [docs/demo.md:135](demo.md).
- “A API cria e lista nome, descrição e valor, sem edição, exclusão, itens, BDI, validade ou status de envio.” — [docs/demo.md:136](demo.md).
- “Uploads já concluídos permanecem no repositório mesmo quando o formulário é abandonado, pois não existe remoção nesse fluxo.” — [docs/demo.md:137](demo.md).
- “Clientes são globais, conforme o schema; não têm dono por engenheiro.” — [README.md:151](../README.md).

**A partir deste ponto, somente correções de defeito.**
