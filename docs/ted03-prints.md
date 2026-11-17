# Capturas da TED 03 — Figuras 10 a 14

O grupo organizou o procedimento de captura das Figuras 10 a 14 para compor o PDF final da TED 03. Definiu `docs/evidencias/` como local de armazenamento das imagens, sem incluí-las no Git. Os arquivos PNG dessa pasta são ignorados, enquanto `.gitkeep` mantém a estrutura no repositório. O procedimento abaixo orienta as capturas manuais; sua documentação não comprova que as imagens já foram produzidas.

## Pré-requisitos

- Node.js 22 ou superior e dependências do projeto já instaladas.
- Banco disponível, migrations já aplicadas e contas/projetos de João e Maria já preparados pelo seed de desenvolvimento. Os scripts de prints não executam Docker, migrations, reset ou seed.
- API em `http://localhost:3000`, iniciada com `npm run dev` na raiz; front em `http://localhost:5173`, iniciado com `npm run dev` dentro de `front-login/`, em outro terminal.
- `front-login/.env.local` com `VITE_USE_MOCK=false` e `VITE_API_URL=http://localhost:3000`. O grupo deverá preservar os arquivos existentes e reiniciar o Vite após ajustes. Caso utilize outra API, deverá alinhar `VITE_API_URL`, `SMOKE_BASE_URL` e `baseUrl` do ambiente Postman.
- Postman com `docs/postman/local.postman_environment.json` importado e selecionado. O grupo deverá preservar os campos da conta de demonstração e manter os tokens preenchidos fora do Git.

## Reset limpo opcional — APAGA todos os dados de desenvolvimento

O grupo previu o reset somente para ambientes de desenvolvimento com dados de teste que possam ser descartados. Antes desse procedimento, deverá encerrar a API e o front executados no host. A remoção dos volumes abaixo é destrutiva e não é executada pelos scripts de preparação das capturas. Este documento não registra a execução de um reset.

```bash
docker compose down -v
docker compose up -d
npm run db:migrate
npm run db:seed
```

O comando `docker compose up -d` também inicia a API no container. Para utilizar novamente a API no host, o grupo deverá executar `docker compose stop api` antes de `npm run dev`, liberando a porta 3000. Em seguida, deverá iniciar o front em outro terminal.

## Ordem obrigatória das capturas

1. Primeiro, o grupo deverá executar `npm run prints:preparar` na raiz. O script lê `SENHA_PADRAO` do arquivo do seed sem executá-lo e usa somente a API para preparar cliente, projeto, duas versões do PDF e diário. A execução sequencial preserva os dados já encontrados. Se houver nomes ou versões inconsistentes, o script interrompe o procedimento sem apagar registros nem enviar versões extras.
2. Em seguida, o grupo deverá executar `npm run prints:check`, investigar todas as linhas FALHA e conferir as linhas ATENÇÃO. A verificação apenas consulta dados e autentica as duas contas. A contagem considera projetos de João/Maria e clientes globais com `smoke`/`teste` no nome; mais de 10 registros somados gera orientação para o reset opcional.
3. Após a conferência, o grupo deverá entrar como João no navegador e capturar as Figuras **10 e 11**, antes de executar a coleção completa. No dashboard, eficiência nula e progresso vazio correspondem ao backend disponível; o procedimento mantém os dados reais, sem preencher esses campos com simulações.
4. Na sequência, o grupo deverá importar `docs/postman/evidencias-ted03.postman_collection.json`, selecionar o mesmo ambiente local e executar manualmente as duas pastas em ordem, pelo botão **Send**. A Figura **13** deverá mostrar a listagem dos arquivos, e a Figura **14**, as respostas 404 e 401. O login de João da primeira pasta precisa ocorrer antes da segunda pasta, mas as respostas de login não devem aparecer nas capturas.
5. Por último, o grupo deverá capturar a Figura **12**, executando `npm run postman:run` na raiz ou `crm-engenharia.postman_collection.json` no Collection Runner. Como a coleção completa cria dados de teste, essa etapa ficará depois das capturas das telas. No Postman, o working directory deverá ser `docs/postman`. O atalho do terminal usa `npx`, que pode baixar Newman na primeira execução, sem adicioná-lo às dependências do projeto.

| Figura | O que mostrar | Onde clicar/rodar | Nome do arquivo |
| --- | --- | --- | --- |
| 10 | Indicadores reais e atividades recentes do dashboard de João | Navegador: `http://localhost:5173/`, após login | `docs/evidencias/figura-10-dashboard.png` |
| 11 | Obra Demonstração TED 03, status em andamento e prioridade alta | Navegador: `http://localhost:5173/projetos`; busque o título da obra | `docs/evidencias/figura-11-projetos.png` |
| 12 | Resultado final dos testes da coleção completa | Por último: `npm run postman:run` ou Collection Runner da coleção completa | `docs/evidencias/figura-12-postman-runner.png` |
| 13 | HTTP 200 e planta-demonstracao.pdf nas versões 1 e 2 | Coleção de evidências → Figura 13 → Listar arquivos do projeto | `docs/evidencias/figura-13-versoes-arquivo.png` |
| 14 | HTTP 404 para projeto da Maria acessado por João e HTTP 401 sem autenticação | Coleção de evidências → Figura 14 → últimas duas requisições; os dois prints podem ser unidos lado a lado | `docs/evidencias/figura-14-acesso-negado.png` |

## Cuidados e inserção no Word

- O grupo deverá utilizar uma janela de 1366×768 ou maior, zoom de 100% e barra de favoritos oculta, mantendo as informações legíveis e sem cortes.
- As capturas deverão omitir token, senha, arquivo `.env` e respostas de login. No Postman, o grupo deverá ocultar o cabeçalho Authorization e manter visíveis método, URL, status e corpo das requisições de evidência. A requisição sem token deverá permanecer em **No Auth**.
- Caso utilize o terminal na Figura 12, o grupo deverá adotar a legenda **“Coleção executada pelo Newman”** no Word.
- No Word, o grupo deverá utilizar **Inserir > Imagem**, selecionar o PNG, ajustar a largura para cerca de **14 cm** e remover a caixa amarela correspondente. A Figura 14 deverá reunir as respostas 404 e 401.
