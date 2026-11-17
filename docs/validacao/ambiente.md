# Ambiente da validação — 18/11/2026

O grupo preparou os scripts e exemplos para a sessão de 30 minutos. O procedimento abaixo deverá ser executado pelo facilitador antes do ensaio; Docker, migrations, reset e seed não foram executados durante esta preparação. As tarefas e suas adaptações estão em [dados-da-sessao.md](dados-da-sessao.md), e o registro do ensaio está em [ensaio.md](ensaio.md).

## 1. Conferência e testes antes de qualquer reset

Os serviços reais do Compose são `db` (PostgreSQL 16) e `api`, com volume `postgres_data`. O banco configurado por padrão é `crm_engineer_civil`, com usuário `crm`; os comandos abaixo utilizam `POSTGRES_DB` e `POSTGRES_USER` do container para respeitar os valores locais. Antes de iniciar, o grupo deverá conferir, sem projetar o arquivo, a correspondência de `DATABASE_URL` com `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` e `POSTGRES_PORT` no `.env`. No host, a conexão utiliza a porta publicada; no container da API, o Compose utiliza `db:5432`. Alterar variáveis não redefine credenciais de um volume existente.

Com o ambiente anterior disponível, as duas contas do seed presentes e Newman disponível, o grupo deverá executar os testes e guardar os resultados antes do reset. O atalho `postman:run` existe; utiliza `npx --yes newman` e pode requerer acesso à rede caso Newman não esteja disponível. Se faltar esse recurso ou algum teste falhar, o grupo deverá interromper a preparação e registrar a pendência, sem avançar para o reset.

```bash
umask 077
mkdir -p docs/validacao/backups
set -o pipefail
npm run smoke 2>&1 | tee docs/validacao/backups/smoke-antes-reset.log
npm run postman:run 2>&1 | tee docs/validacao/backups/postman-antes-reset.log
```

O resultado esperado é `46 OK, 0 FALHOU` no smoke e zero falhas nas 45 requisições/120 asserções do Newman. O grupo deverá conferir o resultado e o código de saída de cada comando. Os logs e backups são privados, ficam ignorados pelo Git e não deverão ser compartilhados sem revisão. Os testes deixam dados e uploads; por isso antecedem o reset. Nenhum resultado integrado foi presumido nesta documentação.

## 2. Reset limpo — APAGA todos os dados do banco e os volumes do Compose

Esta etapa deverá ser executada somente no banco local de desenvolvimento cujos dados possam ser descartados, após a aprovação dos testes. O grupo deverá encerrar a API e o front do host com Ctrl+C nos respectivos terminais. O reset abaixo não é uma restauração de snapshot e não recupera os dados antigos.

```bash
docker compose down -v
docker compose up -d
docker compose ps
docker compose exec -T db sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

O grupo deverá aguardar o serviço `db` ficar saudável e a confirmação de disponibilidade pelo último comando, repetindo a consulta se necessário. Só então deverá executar:

```bash
npm run db:migrate
npm run db:seed
```

O serviço `api` também inicia com `up -d` e aplica `prisma migrate deploy` conforme o Compose. O comando local `db:migrate` corresponde a `prisma migrate dev`; qualquer solicitação de nova migration ou reset inesperado deverá interromper o procedimento. O seed inicializa as contas de demonstração existentes do projeto, sem alterar o código. As referências de fotos do seed não criam arquivos físicos.

## 3. API e front no host

Após o banco e as migrations estarem disponíveis, o grupo deverá parar apenas a API do container para liberar a porta 3000 e iniciar a API no host:

```bash
docker compose stop api
npm run dev
```

Em outro terminal, deverá conferir `VITE_USE_MOCK=false` e `VITE_API_URL=http://localhost:3000` em `front-login/.env.local` (ou `.env`, respeitando a precedência dos arquivos do Vite) e iniciar o front:

```bash
cd front-login && npm run dev
```

O banco permanecerá no container `db`. A sessão utilizará `http://localhost:5173`; mudanças no ambiente do front exigem reiniciar o Vite. O grupo deverá manter os dois terminais em execução e utilizar um terceiro terminal na raiz para a preparação seguinte.

## 4. Variáveis, imagens e dados fictícios

No Bash, o grupo deverá informar a credencial e o contato do facilitador sem eco dos valores, sem salvá-los em arquivo ou histórico. O contato deverá conter somente 10 a 13 dígitos, incluindo DDD; com código de país, deverá usar 55 e conter 12 ou 13 dígitos para o link brasileiro do front. A credencial deverá ter de 8 a 72 caracteres. Não será utilizada a conta pessoal do participante.

```bash
export SMOKE_BASE_URL=http://localhost:3000
export VALIDACAO_EMAIL=convidado.validacao@exemplo.com
read -r -s -p 'Credencial temporária do convidado: ' VALIDACAO_SENHA
printf '\n'
export VALIDACAO_SENHA
read -r -s -p 'WhatsApp do facilitador, somente dígitos: ' VALIDACAO_TELEFONE
printf '\n'
export VALIDACAO_TELEFONE
npm run validacao:fotos
npm run validacao:preparar
npm run validacao:preparar
npm run validacao:check
```

Na segunda preparação consecutiva, o resumo deverá mostrar zero itens criados. Se aparecer conflito ou sobras de ensaio, o grupo deverá investigar ou restaurar o snapshot, sem repetir o preparador como se fosse um reset. O preparador não altera a credencial de uma conta existente nem o contato de um cliente já cadastrado; a API não oferece edição de clientes. As variáveis precisarão ser informadas novamente se o terminal for fechado. Ao final da utilização, poderão ser retiradas da sessão com `unset VALIDACAO_SENHA VALIDACAO_TELEFONE`.

O verificador é somente de leitura, exceto pela autenticação necessária às consultas, e termina com código 1 quando houver FALHA. Os alertas deverão ser revisados. Como clientes são globais, a conta também verá os clientes do seed: o verificador identifica os dois exemplos e apresenta o total global, com alerta sobre extras que não podem ser atribuídos exclusivamente a ensaio. O snapshot preservará esses registros compartilhados; não se deve apagá-los seletivamente para esconder o alerta.

## 5. Snapshot antes do ensaio

Após a preparação aprovada e antes de executar T1–T5, o grupo deverá guardar o estado do banco. A API do host poderá permanecer iniciada, mas ninguém deverá editar dados durante o dump. O arquivo guarda dados de acesso e o contato operacional do banco; por isso terá permissão restrita e permanecerá somente na pasta ignorada. Não deverá ser projetado nem enviado ao repositório.

```bash
(
  umask 077
  mkdir -p docs/validacao/backups
  docker compose exec -T db sh -c 'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-acl' > docs/validacao/backups/antes-ensaio.dump.tmp &&
  mv docs/validacao/backups/antes-ensaio.dump.tmp docs/validacao/backups/antes-ensaio.dump
)
docker compose exec -T db pg_restore --list < docs/validacao/backups/antes-ensaio.dump > /dev/null
```

O grupo deverá confirmar sucesso nos dois comandos antes de ensaiar e não sobrescrever esse snapshot com dados alterados do ensaio. Arquivo temporário de dump com falha não deverá ser utilizado. A extensão `.dump` identifica o formato customizado; `*.sql` e a pasta de backups também estão ignorados. As migrations SQL já versionadas permanecem no Git.

## 6. Restauração depois do ensaio e antes da sessão real

Primeiro, o grupo deverá encerrar a API do host com Ctrl+C e impedir outras edições. Em seguida, deverá validar o arquivo de backup e executar a restauração abaixo. Ela substitui os objetos e dados incluídos no snapshot, incluindo os dados alterados durante o ensaio. O uso de transação única e interrupção em erro evita apresentar uma restauração parcial como concluída.

```bash
docker compose exec -T db pg_restore --list < docs/validacao/backups/antes-ensaio.dump > /dev/null &&
docker compose stop api &&
docker compose exec -T db sh -c 'exec pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-acl --exit-on-error --single-transaction' < docs/validacao/backups/antes-ensaio.dump
```

Após sucesso, o grupo deverá reiniciar `npm run dev` no terminal da API e, no terceiro terminal com as variáveis ainda definidas, executar `npm run validacao:check`. Deverá sair e entrar novamente na conta de convidado, recarregar as telas e conferir o primeiro projeto em planejamento, os seis diários e os dois orçamentos de reserva. Não deverá executar seed ou os testes integrados depois da restauração: eles alterariam o estado preparado.

O backup cobre somente o banco. No fluxo com API no host, os arquivos originais de `uploads/` precisam continuar no mesmo local para os caminhos do snapshot funcionarem. Fotos de ensaio sem referência poderão permanecer no disco após a restauração; o grupo não deverá apagar toda a pasta. O Compose não fornece volume persistente de uploads para sua API, motivo pelo qual este procedimento utiliza a API no host.

## 7. Plano B — cinco situações

1. API não sobe: o grupo deverá conferir o terminal e a ocupação da porta 3000; se o container `api` estiver ativo, deverá pará-lo antes de executar a API no host.
2. Banco não responde: o grupo deverá consultar `docker compose ps` e a coerência da conexão local; durante a sessão, não deverá realizar reset, recorrendo ao vídeo se não houver recuperação.
3. Foto não carrega: o grupo deverá utilizar as amostras PNG desta pasta e registrar a falha; sem duas imagens visíveis, T3 não será considerada totalmente concluída.
4. WhatsApp não abre: o grupo deverá usar Copiar mensagem ou o texto selecionável, registrar T5 incompleta quando necessário e apenas mostrar a mensagem pronta; NÃO deverá apertar Enviar.
5. Tela em branco: o grupo deverá conferir os terminais e o endereço do front, reiniciar o Vite se a configuração tiver mudado e recorrer ao vídeo se a falha persistir.

## Verificações desta preparação — 17/11/2026

O grupo conferiu os dados e a idempotência com transporte HTTP simulado em memória: primeira execução com 16 itens criados, segunda com zero novos e 16 existentes; as contagens foram 2 clientes, 3 projetos, 6 diários, 2 versões do PDF e 2 orçamentos. Também verificou a interrupção diante de versão adicional ou contato divergente. Esses resultados são isolados e não comprovam integração real.

O verificador passou por nove cenários simulados, permitindo somente consultas e autenticação: conjunto pronto, dados extras, diário ausente, rede bloqueada, credencial ausente, imagem inválida, contato divergente e orçamento ausente. As três imagens tiveram assinatura, dimensões, descompressão e CRC conferidos por leitores de chunks; uma nova geração manteve os mesmos bytes.

API/banco reais e execução dupla contra eles: **NÃO VERIFICADO**. A consulta com `curl` para `localhost:3000/api/health` retornou código 7; a consulta Node retornou `EPERM`, e o front também retornou `EPERM`. O grupo não iniciou serviços nem contornou a restrição. Snapshot, restauração, reset, smoke e Newman deste procedimento: **NÃO VERIFICADO**, pois não foram executados nesta preparação.

Na conferência final, os três scripts passaram por `node --check`, e `npm run check` confirmou sintaxe em **48 arquivos**. O comando `npm run validacao:check` terminou com código 1 e resumo **5 OK, 7 ATENÇÃO, 1 FALHA**, identificando a indisponibilidade da rede local, a falta das variáveis de autenticação e as consultas dependentes. Os três documentos necessários e as imagens foram encontrados; o modo real do front foi confirmado pela configuração, sem teste integrado no navegador.

| Imagem | Assinatura e IHDR | Tamanho | CRC |
|---|---|---|---|
| foto-obra-1.png | PNG, 800×600 RGB | 7,15 KB | IHDR, IDAT e IEND válidos |
| foto-obra-2.png | PNG, 800×600 RGB | 7,14 KB | IHDR, IDAT e IEND válidos |
| foto-obra-3.png | PNG, 800×600 RGB | 5,96 KB | IHDR, IDAT e IEND válidos |

O grupo confirmou por comparação de hashes que os documentos anteriores, incluindo roteiro e questionário, permaneceram intactos. Os novos comandos do procedimento passaram pela análise de sintaxe do Bash, sem execução. As regras de exclusão de backups e SQL foram conferidas com `git check-ignore`; nenhum backup foi produzido. A revisão de privacidade não encontrou valores fixos de credenciais nos arquivos novos; os únicos e-mails fictícios definidos usam `exemplo.com`, e os testes em memória confirmaram saídas sem os valores transitórios de acesso ou contato.
