# CRM Engenheiro Civil
## Equipe do Projeto

- Gustavo Barros Martins
- Hugo Alexandre Carvalho Coelho Coutinho
- Jeferson Machado dos Santos
- Maicon de Sousa Pontes

**API REST para gerenciamento de clientes e projetos de engenharia civil**

## 1. Sobre o Projeto

O CRM Engineer Civil é uma solução de software desenvolvida para auxiliar engenheiros civis autônomos na organização e no gerenciamento de suas atividades profissionais. A rotina desses profissionais envolve o acompanhamento de diferentes projetos e obras, o registro de informações em campo, a organização de documentos técnicos, a elaboração de orçamentos e a comunicação constante com os clientes. Quando essas atividades são realizadas de forma descentralizada ou dependem de processos manuais, podem dificultar o acesso às informações, o acompanhamento das obras e a gestão eficiente dos projetos.

Diante desse cenário, o projeto propõe o desenvolvimento de uma API REST back-end capaz de centralizar e facilitar esses processos, oferecendo recursos para gerenciamento de projetos, sincronização de dados do Diário de Obra, organização e versionamento de arquivos, geração automatizada de orçamentos e relatórios técnicos em PDF e integração com o WhatsApp para o envio de documentos aos clientes.
## 2. Objetivos do Projeto

- Centralizar informações de clientes e projetos de engenharia civil.
- Facilitar o registro e o acompanhamento das atividades realizadas nas obras.
- Permitir a sincronização de informações registradas sem conexão com a internet.
- Organizar arquivos e documentos relacionados aos projetos.
- Automatizar a geração de orçamentos e relatórios técnicos em PDF.
- Facilitar o envio de documentos e orçamentos por meio da integração com o WhatsApp.

## 3. Principais Funcionalidades

### 3.1. Diário de Obra (RDO)

Registro e sincronização de informações do Diário de Obra, permitindo que dados coletados em campo sejam enviados à API quando houver conexão com a internet.

### 3.2. Gestão de Projetos

Organização e acompanhamento de projetos de engenharia civil, com suporte ao gerenciamento das informações e dos documentos associados a cada projeto.

### 3.3. Gestão de Arquivos

Envio e organização de arquivos vinculados aos projetos, incluindo documentos PDF, desenhos DWG e outros formatos pertinentes, com possibilidade de controle de versões.

### 3.4. Geração de Documentos em PDF

Geração automatizada de orçamentos e relatórios técnicos para facilitar a elaboração e o compartilhamento de documentos profissionais.

### 3.5. Integração com WhatsApp

Integração planejada para facilitar o envio de orçamentos e documentos aos clientes por meio do WhatsApp, conforme a configuração do serviço utilizado.

## 4. Tecnologias Utilizadas

| Tecnologia | Finalidade |
|---|---|
| Node.js (JavaScript, CommonJS) | Ambiente de execução |
| Express 4 | Desenvolvimento da API REST |
| PostgreSQL | Banco de dados relacional |
| Prisma | Acesso e gerenciamento do banco de dados |
| JWT (jsonwebtoken) | Autenticação baseada em tokens |
| bcrypt | Hash de senhas |
| Helmet | Cabeçalhos de segurança HTTP |
| Morgan | Log de requisições |
| express-async-errors | Encaminha erros de funções assíncronas ao tratador de erros |
| Dotenv | Gerenciamento de variáveis de ambiente |
| CORS | Controle de requisições entre diferentes origens |
| Nodemon | Reinicialização automática durante o desenvolvimento |
| Multer e PDFKit | Planejados para upload de arquivos e geração de PDF (ainda não instalados) |

## 5. Requisitos para Execução

Antes de executar o projeto, verifique se os seguintes recursos estão instalados:

- Node.js versão 18 ou superior.
- npm, instalado junto ao Node.js.
- Docker (para o PostgreSQL) ou um PostgreSQL já instalado.
- Git.

## 6. Instalação

Clone o repositório e acesse o diretório do projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd Sistema-de-Engenharia-main
```

### 6.1. Subir o PostgreSQL com Docker

```bash
docker run --name crm-db -e POSTGRES_PASSWORD=senha123 -e POSTGRES_DB=crm_engineer_civil -p 5432:5432 -d postgres:16
```

Nas próximas vezes, inicie o container existente com `docker start crm-db`.

### 6.2. Instalar dependências e configurar o ambiente

```bash
npm install
cp .env.example .env
```

No PowerShell, use `Copy-Item .env.example .env`. O `.env.example` já aponta para o banco criado acima; troque ao menos o `JWT_SECRET`.

### 6.3. Preparar o banco

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

O seed cria dois engenheiros, dois clientes e dados de exemplo. Os dois engenheiros usam a senha `123456` (somente para desenvolvimento). Ele pode ser executado mais de uma vez sem duplicar nem quebrar.

### 6.4. Iniciar a API

```bash
npm run dev
```

## 7. Configuração do Ambiente

Todas as variáveis ficam no arquivo `.env` (modelo em `.env.example`):

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta da API | `3000` |
| `DATABASE_URL` | Conexão com o PostgreSQL | sem padrão |
| `JWT_SECRET` | Segredo do token (obrigatório) | sem padrão |
| `JWT_EXPIRES_IN` | Validade do token | `8h` |
| `CORS_ORIGIN` | Origem permitida (aceita várias, separadas por vírgula) | `http://localhost:5173` |
| `UPLOAD_DIR`, `MAX_FILE_SIZE_MB` | Upload de arquivos (ainda não implementado) | |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_API_URL` | Integração com WhatsApp (ainda não implementada) | |

**Importante:** não compartilhe credenciais e nunca envie o arquivo `.env` ao repositório.

## 8. Execução e Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia a API com reinício automático (nodemon) |
| `npm start` | Inicia a API (produção) |
| `npm run check` | Verifica a sintaxe dos arquivos JavaScript |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:migrate` | Aplica as migrations (`prisma migrate dev`) |
| `npm run db:seed` | Popula o banco com dados de exemplo |
| `npm run db:studio` | Abre o Prisma Studio |

Não há etapa de build: o projeto é JavaScript puro. Por padrão, a API estará disponível em `http://localhost:3000`.

## 9. Endpoints da API

| Método | Endpoint | Autenticação | Situação |
|---|---|---|---|
| GET | `/` | Não | Implementado |
| GET | `/api/health` | Não | Implementado (503 se o banco estiver indisponível) |
| POST | `/api/auth/registro` | Não | Implementado |
| POST | `/api/auth/login` | Não | Implementado |
| GET | `/api/dashboard` | Bearer token | Implementado |
| POST | `/api/rdo/sync` | Não (por enquanto) | 501, ainda não implementado |
| POST | `/api/projetos/:id/arquivos` | Não (por enquanto) | 501, ainda não implementado |
| POST | `/api/whatsapp/enviar-orcamento` | Não (por enquanto) | 501, ainda não implementado |

Rotas inexistentes respondem 404 em JSON. Erros respondem sempre no formato `{ "message": "..." }`.

## 10. Exemplos de Requisições

### 10.1. Verificar a API

```bash
curl http://localhost:3000/
curl http://localhost:3000/api/health
```

### 10.2. Cadastro e login

```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"nome": "Ana Souza", "email": "ana@exemplo.com", "senha": "senha12345"}'

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ana@exemplo.com", "senha": "senha12345"}'
```

A senha deve ter de 8 a 72 caracteres. O login devolve um `token` para o cabeçalho `Authorization: Bearer <token>`.

### 10.3. Dashboard

```bash
curl http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer <token>"
```

### 10.4. Sincronizar o Diário de Obra (501)

```bash
curl -X POST http://localhost:3000/api/rdo/sync \
  -H "Content-Type: application/json" \
  -d '{
    "projetoId": "<id-do-projeto>",
    "data": "2024-01-15",
    "descricao": "Fundação executada com sucesso",
    "observacoes": "Profundidade de 2,5 m"
  }'
```

### 10.5. Enviar um arquivo para um projeto (501)

```bash
curl -X POST http://localhost:3000/api/projetos/<id-do-projeto>/arquivos \
  -F "arquivo=@caminho/do/arquivo.pdf"
```

### 10.6. Solicitar orçamento via WhatsApp (501)

```bash
curl -X POST http://localhost:3000/api/whatsapp/enviar-orcamento \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "<id-do-cliente>",
    "orcamentoId": "<id-do-orcamento>"
  }'
```

Os três endpoints 501 ainda não leem o corpo da requisição; os corpos acima indicam o formato previsto.

## 11. Estrutura do Projeto

```text
Sistema-de-Engenharia-main/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
├── scripts/
│   └── check.js
├── src/
│   ├── server.js              # listen e encerramento limpo
│   ├── app.js                 # configuração do Express
│   ├── config/env.js          # leitura e validação das variáveis
│   ├── lib/                   # prisma.js, erroHttp.js
│   ├── middlewares/           # autenticarToken, tratadorErros, naoEncontrado
│   ├── routes/                # index.js e um arquivo por domínio
│   ├── controllers/           # transporte HTTP
│   └── services/              # regra de negócio e Prisma
├── front-login/               # front-end React + Vite
├── .clinerules
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

Fluxo de uma requisição: `routes` → `controllers` → `services`.

## 12. Considerações Finais

O CRM Engineer Civil tem como objetivo contribuir para a organização e a digitalização das atividades de engenheiros civis autônomos, integrando recursos de gerenciamento de projetos, registro de informações de campo e geração de documentos em uma API preparada para evoluir conforme as necessidades do sistema.
