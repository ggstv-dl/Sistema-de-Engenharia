# Capturas da TED 03 — Figuras 10 a 14

As imagens ficam somente no PDF final: salve-as em `docs/evidencias/`, sem adicioná-las ao Git. Os arquivos PNG dessa pasta são ignorados; `.gitkeep` mantém a pasta no repositório. Este roteiro não tira capturas automaticamente.

## Pré-requisitos

- Node.js 22 ou superior e dependências do projeto já instaladas.
- Banco disponível, migrations já aplicadas e contas/projetos de João e Maria já preparados pelo seed de desenvolvimento. Os scripts de prints não executam Docker, migrations, reset ou seed.
- API em `http://localhost:3000`, iniciada com `npm run dev` na raiz; front em `http://localhost:5173`, iniciado com `npm run dev` dentro de `front-login/`, em outro terminal.
- `front-login/.env.local` com `VITE_USE_MOCK=false` e `VITE_API_URL=http://localhost:3000`. Preserve arquivos existentes e reinicie o Vite após ajustes. Se usar outra API, alinhe `VITE_API_URL`, `SMOKE_BASE_URL` e `baseUrl` do ambiente Postman.
- Postman com `docs/postman/local.postman_environment.json` importado e selecionado. Preserve os campos de conta de demonstração desse ambiente; não exporte tokens preenchidos para o Git.

## Reset limpo opcional — APAGA todos os dados de desenvolvimento

Use apenas se a lista de projetos estiver poluída por testes e você puder perder os dados locais. Pare a API e o front do host antes. A remoção dos volumes abaixo é destrutiva; não é executada pelos scripts de prints.

```bash
docker compose down -v
docker compose up -d
npm run db:migrate
npm run db:seed
```

`docker compose up -d` também inicia a API no container. Para voltar ao fluxo com API no host, execute `docker compose stop api` antes de `npm run dev`, liberando a porta 3000. Inicie novamente o front em outro terminal.

## Ordem obrigatória das capturas

1. Na raiz, execute `npm run prints:preparar`. Ele lê `SENHA_PADRAO` do arquivo do seed sem executá-lo e usa somente a API para preparar cliente, projeto, duas versões do PDF e diário. Pode ser repetido sequencialmente: dados já encontrados são preservados. Se houver nomes/versões inconsistentes, ele para sem apagar registros nem enviar versões extras.
2. Execute `npm run prints:check`. Resolva todas as linhas FALHA e confira as linhas ATENÇÃO. A verificação apenas consulta dados e autentica as duas contas. A contagem de testes considera projetos de João/Maria e clientes globais com `smoke`/`teste` no nome; mais de 10 registros somados gera orientação para o reset opcional.
3. No navegador, entre como João e capture as Figuras **10 e 11**, antes de rodar a coleção completa. No dashboard, eficiência nula e progresso vazio correspondem ao backend atual; não ative mocks para preencher esses campos.
4. Importe `docs/postman/evidencias-ted03.postman_collection.json`, selecione o mesmo ambiente local e execute manualmente as duas pastas em ordem, clicando em **Send** em cada requisição. Capture a Figura **13** na listagem dos arquivos e a Figura **14** nas respostas 404 e 401. O login de João da primeira pasta precisa ocorrer antes da segunda pasta; não capture os logins.
5. Capture a Figura **12 por último**: execute `npm run postman:run` na raiz ou rode `crm-engenharia.postman_collection.json` no Collection Runner. A coleção completa cria dados de teste e pode poluir as telas; não rode antes das capturas anteriores. No Postman, configure o working directory como `docs/postman`. O atalho do terminal usa `npx`, que pode baixar Newman na primeira execução, sem adicioná-lo às dependências do projeto.

| Figura | O que mostrar | Onde clicar/rodar | Nome do arquivo |
| --- | --- | --- | --- |
| 10 | Indicadores reais e atividades recentes do dashboard de João | Navegador: `http://localhost:5173/`, após login | `docs/evidencias/figura-10-dashboard.png` |
| 11 | Obra Demonstração TED 03, status em andamento e prioridade alta | Navegador: `http://localhost:5173/projetos`; busque o título da obra | `docs/evidencias/figura-11-projetos.png` |
| 12 | Resultado final dos testes da coleção completa | Por último: `npm run postman:run` ou Collection Runner da coleção completa | `docs/evidencias/figura-12-postman-runner.png` |
| 13 | HTTP 200 e planta-demonstracao.pdf nas versões 1 e 2 | Coleção de evidências → Figura 13 → Listar arquivos do projeto | `docs/evidencias/figura-13-versoes-arquivo.png` |
| 14 | HTTP 404 para projeto da Maria acessado por João e HTTP 401 sem autenticação | Coleção de evidências → Figura 14 → últimas duas requisições; os dois prints podem ser unidos lado a lado | `docs/evidencias/figura-14-acesso-negado.png` |

## Cuidados e inserção no Word

- Janela de 1366×768 ou maior, zoom 100% e barra de favoritos oculta. Deixe a informação importante legível, sem cortes.
- Não mostre token, senha, arquivo `.env` ou respostas de login. No Postman, esconda o cabeçalho Authorization e deixe visíveis método, URL, status e corpo das requisições de evidência. Na requisição sem token, mantenha **No Auth**.
- Se usar o terminal na Figura 12, altere a legenda no Word para **“Coleção executada pelo Newman”**.
- No Word: **Inserir > Imagem**, escolha o PNG, ajuste a largura para cerca de **14 cm** e apague a caixa amarela correspondente. Na Figura 14, insira a composição com 404 e 401.
