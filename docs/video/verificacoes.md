# Verificações da preparação do vídeo — 26/11/2026

O grupo verificou os materiais na branch `docs/video`, criada a partir de `feat/melhorias-validacao`, revisão inicial `32d721a`. Este registro descreve a preparação dos arquivos e os resultados observados nesta execução; não comprova gravação, hospedagem, aprovação integrada ou resultados de participantes.

## Auditoria e cenas

A [tabela da Parte A](roteiro-video.md) apresenta nove possibilidades: oito fluxos implementados para API real e a apresentação do smoke como PARCIAL. O painel foi limitado a obras, diários e custo mensal. O smoke no terminal, o 404 entre engenheiros como evidência gravada e os resultados da validação foram deixados fora das cenas por falta de comprovação integrada e de resultados reais nos documentos permitidos.

| Cena | Tempo planejado | Duração |
|---|---|---|
| 1 — Problema e proposta | 00:00–00:20 | 20 s |
| 2 — Entrada e painel | 00:20–00:45 | 25 s |
| 3 — Projeto com cliente | 00:45–01:25 | 40 s |
| 4 — Diário e duas fotos | 01:25–02:20 | 55 s |
| 5 — Consulta do diário | 02:20–02:40 | 20 s |
| 6 — Orçamento e mensagem | 02:40–03:25 | 45 s |
| 7 — Preparação e evidências | 03:25–03:45 | 20 s |
| 8 — Tecnologias e limitações | 03:45–04:10 | 25 s |
| Total | 00:00–04:10 | 250 s |

## Comandos e conferências

| Verificação | Resultado observado |
|---|---|
| `node --check scripts/video-legendas.js` | OK |
| `node --check scripts/video-check.js` | OK |
| `npm run check` | `Sintaxe OK em 50 arquivos.`; saída 0 |
| Contagem da narração, somente fala das cenas | 557 palavras; dentro de 450–680 |
| `npm run video:legendas` | 56 legendas; 140 palavras/min; deslocamento zero; total 00:04:04,369; saída 0 |
| Validação independente do SRT por programa Node | Índices sequenciais, tempos crescentes, sem sobreposição, uma ou duas linhas de até 42 caracteres, durações de 1,2 a 6 s; texto completo preservado |
| Pausas e deslocamento | Pausas de 600 ms entre cenas; deslocamento de 2,5 s conferido em memória, sem alterar o SRT versionado nem a duração da fala |
| Testes isolados do gerador | 14 casos aprovados: opções, ausência de cenas, cena vazia, numeração inválida, limites de duração, quebras de linha e reprodução do arquivo |
| Recusa CLI de ritmo incompatível | `npm run video:legendas -- --ppm 300`: saída 1 com mensagem de duração fora de 3:00–5:00; sem stack trace e sem sobrescrever o SRT válido |
| Testes isolados do verificador | 10 cenários simulados aprovados; somente consultas e autenticação; precedência de ambiente, ausência de rota, ausência de arquivo e privacidade conferidas |
| `npm run video:check` | Saída 1: 4 OK, 7 ATENÇÃO, 2 FALHA |

As simulações foram realizadas com transporte HTTP em memória e arquivos temporários, removidos ao final. Não representam disponibilidade real do sistema nem resultados da validação com o parceiro.

## Duração estimada por cena nas legendas

| Cena | Início-fim calculado | Fala estimada |
|---|---|---|
| 1 | 00:00:00,000–00:00:20,486 | 20,486 s |
| 2 | 00:00:21,086–00:00:44,658 | 23,572 s |
| 3 | 00:00:45,258–00:01:21,257 | 35,999 s |
| 4 | 00:01:21,857–00:02:14,058 | 52,201 s |
| 5 | 00:02:14,658–00:02:33,943 | 19,285 s |
| 6 | 00:02:34,543–00:03:19,885 | 45,342 s |
| 7 | 00:03:20,485–00:03:40,627 | 20,142 s |
| 8 | 00:03:41,227–00:04:04,369 | 23,142 s |

O total inclui 4,2 s de pausas entre cenas. A diferença para o plano de 4:10 deverá ser resolvida pelo ensaio e ajuste das legendas à gravação real; não foi afirmada sincronização com uma mídia inexistente.

## Prontidão real e pendências

- API/banco: NÃO VERIFICADO; consulta ao health retornou conexão indisponível com causa `EPERM`, e a mensagem orienta a subir o banco e a API.
- Front: NÃO VERIFICADO; `http://localhost:5173` retornou `EPERM`.
- Login, painel e listas: NÃO VERIFICADOS; `VALIDACAO_EMAIL` e `VALIDACAO_SENHA` ausentes ou incompletos no terminal da verificação. Nenhum valor foi exibido.
- Modo real do front, endereço configurado, narração e SRT: OK pela leitura da configuração e dos arquivos.
- ffmpeg e ffprobe: ATENÇÃO, não encontrados no PATH; não houve instalação.
- Gravação no OBS, áudio, edição, tamanho do arquivo final, privacidade dos quadros e acesso público ao link: NÃO VERIFICADOS; serão conferidos pelo apresentador.

## Privacidade e preservação

A busca com grep por atribuições literais de credenciais e por formato JWT não encontrou ocorrências nos arquivos novos. A revisão dos e-mails encontrou somente `cliente.video@example.invalid`, um exemplo fictício; não foram incluídos contatos reais nem números de telefone. O contato descrito no roteiro é composto por zeros e não será usado para abrir ou enviar mensagem.

Os únicos arquivos anteriores autorizados a mudar foram `package.json` (apenas dois scripts novos), `.gitignore` (somente regras acrescentadas) e a nova seção de três linhas do README. Os outros 127 arquivos rastreados foram comparados por hash e preservados, incluindo as alterações locais já existentes em `.dockerignore` e `docs/2026-10-26.md`, que ficaram fora dos commits.

As regras de exclusão dos MP4, MKV, WEBM e da pasta de brutos foram conferidas com `git check-ignore`; narração e SRT continuam rastreáveis. Nenhum serviço foi iniciado e nenhum cadastro foi criado por esta preparação. Docker, migrate, reset, seed, push, merge e tag não foram executados.

## Campos a completar e escolhas de apresentação

- `[equipe: nomes]`: apresentação na narração e, consequentemente, no SRT; substituir antes da tomada e gerar novamente.
- `[preencher]`: link do vídeo no README; nos dados complementares do roteiro, quantidade de participantes, achados, melhorias decorrentes da validação e eventual resultado integrado do smoke.
- Não incluir os campos sem evidência na fala. Não interpretar os exemplos fictícios de `docs/validacao/resultados.md` como resultados reais nem citar percentuais.
- Escolhas de apresentação: mostrar a mensagem copiada em rascunho local, recortar os indicadores parciais do painel e usar a cena de preparação do kit no lugar de alegações sobre resultados ausentes. Este registro adicional reúne as evidências da entrega.

Para conferir os commits por parte: `git log -3 --oneline` e `git show --stat <hash>`. A gravação, a hospedagem e a revisão final continuam manuais.
