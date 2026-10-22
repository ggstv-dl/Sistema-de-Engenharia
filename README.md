# CRM Engenheiro Civil

**API REST e aplicação web para gerenciamento de atividades de engenheiros civis autônomos.**

## Equipe do Projeto

- Gustavo Barros Martins
- Hugo Alexandre Carvalho Coelho Coutinho
- Jeferson Machado dos Santos
- Maicon de Sousa Pontes

## 1. Sobre o Projeto

O CRM Engenheiro Civil é um sistema em desenvolvimento que tem como objetivo auxiliar engenheiros civis autônomos na organização e no acompanhamento de suas atividades profissionais. A proposta é centralizar informações relacionadas a projetos, obras, registros de campo e documentos técnicos em uma aplicação web integrada a uma API REST.

Nesta etapa, foram implementados a estrutura inicial do ambiente, a conexão com o banco de dados PostgreSQL, a autenticação de usuários e a integração do dashboard com a API. As demais funcionalidades serão desenvolvidas de forma incremental.

## 2. Objetivos

- Centralizar informações relacionadas às atividades profissionais do engenheiro civil.
- Disponibilizar autenticação de usuários.
- Integrar a interface web ao back-end.
- Preparar a estrutura de persistência para os dados do sistema.
- Desenvolver progressivamente o gerenciamento de projetos e obras.
- Evoluir a aplicação para oferecer recursos de registro de campo, documentos técnicos e comunicação com clientes.

## 3. Funcionalidades

### 3.1. Funcionalidades Implementadas

- **Cadastro de usuários:** registro de novos usuários com validação dos dados informados.
- **Autenticação:** login com verificação de senha e emissão de token JWT.
- **Proteção de rotas:** validação de tokens JWT nos endpoints protegidos.
- **Persistência de dados:** integração com PostgreSQL por meio do Prisma ORM.
- **Dashboard integrado:** consumo de dados da API e apresentação de indicadores e atividades.
- **Verificação de saúde:** endpoint para verificar a disponibilidade da API e a conexão com o banco de dados.
- **Ambiente conteinerizado:** configuração do PostgreSQL por meio do Docker Compose.

Os indicadores do dashboard dependem dos registros existentes no banco. Quando não há dados cadastrados, os valores podem aparecer zerados ou indisponíveis.

### 3.2. Funcionalidades Planejadas

- Cadastro, consulta, atualização e exclusão de projetos.
- Diário de Obra com suporte a registros realizados em campo.
- Sincronização de dados registrados sem conexão com a internet.
- Gerenciamento e versionamento de arquivos dos projetos.
- Geração de orçamentos e relatórios técnicos em PDF.
- Integração com um provedor de WhatsApp para envio de documentos aos clientes.

Essas funcionalidades dependem de implementação e testes adicionais. A existência de uma rota provisória não significa que o recurso esteja concluído.

## 4. Tecnologias Utilizadas

| Tecnologia | Finalidade |
|---|---|
| Node.js | Ambiente de execução do back-end |
| Express | Construção da API REST |
| JavaScript (CommonJS) | Implementação atual do back-end |
| React | Construção da interface web |
| Vite | Ambiente de desenvolvimento do front-end |
| PostgreSQL 16 | Banco de dados relacional |
| Prisma ORM | Acesso ao banco de dados e gerenciamento de migrações |
| JWT | Autenticação baseada em tokens |
| bcrypt | Hash e verificação de senhas |
| dotenv | Leitura de variáveis de ambiente |
| CORS | Configuração de acesso entre diferentes origens |
| Docker Compose | Inicialização do banco de dados em contêiner |

## 5. Requisitos

Para executar o projeto, são necessários:

- Node.js e npm.
- Docker Desktop com Docker Compose.
- Git.
- Navegador atualizado.

## 6. Instalação e Configuração

Clone o repositório e acesse o diretório do projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd Sistema-de-Engenharia-main
```

Instale as dependências do back-end:

```bash
npm install
```

Crie o arquivo de ambiente a partir do modelo:

```powershell
Copy-Item .env.example .env
```

Revise as variáveis do arquivo `.env`, especialmente `DATABASE_URL` e `JWT_SECRET`. Utilize um segredo aleatório forte e mantenha as credenciais fora do repositório.

Instale as dependências do front-end:

```powershell
Set-Location .\front-login
npm install
```

Crie o arquivo `front-login/.env` com a seguinte configuração para desenvolvimento local:

```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK=false
```

Depois da configuração, volte à raiz do projeto para executar os comandos de banco de dados.

## 7. Banco de Dados

Na raiz do projeto, inicie o PostgreSQL:

```bash
docker compose up -d postgres
```

Confira o estado do contêiner:

```bash
docker compose ps
```

Valide o schema do Prisma:

```bash
npx prisma validate
```

Gere o cliente do Prisma:

```bash
npx prisma generate
```

Aplique as migrações existentes:

```bash
npx prisma migrate deploy
```

As migrações devem ser executadas após conferir a configuração do banco e a disponibilidade dos arquivos de migração. Não utilize `prisma migrate reset` em um banco cujos dados devam ser preservados.

## 8. Execução da Aplicação

Abra dois terminais na raiz do projeto.

### 8.1. Back-end

No primeiro terminal, execute:

```bash
npm run dev
```

Esse comando pressupõe que o script `dev` esteja configurado no `package.json`.

A API utiliza a porta 3000 por padrão, conforme a configuração atual.

### 8.2. Front-end

No segundo terminal, execute:

```powershell
Set-Location .\front-login
npm run dev
```

O front-end será disponibilizado no endereço informado pelo Vite, normalmente:

`http://localhost:5173`

Mantenha os dois processos em execução enquanto testa a aplicação.

## 9. Endpoints da API

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/` | Verificação básica da API |
| GET | `/api/health` | Verificação da API e do banco de dados |
| POST | `/api/auth/registro` | Cadastro de usuário |
| POST | `/api/auth/login` | Autenticação e emissão de token JWT |
| GET | `/api/dashboard` | Consulta de indicadores e atividades; exige token JWT |
| POST | `/api/rdo/sync` | Rota provisória para sincronização do Diário de Obra |
| POST | `/api/projetos/:id/arquivos` | Rota provisória para envio de arquivos |
| POST | `/api/whatsapp/enviar-orcamento` | Rota provisória para integração com WhatsApp |

As três últimas rotas ainda dependem de implementação. Portanto, não devem ser consideradas funcionalidades concluídas enquanto retornarem respostas indicando que o recurso não está disponível.

### 9.1. Autenticação

O endpoint de login retorna um token JWT após a validação das credenciais. Esse token deve ser enviado no cabeçalho HTTP das requisições protegidas:

```http
Authorization: Bearer SEU_TOKEN_JWT
```

O token deve ser obtido pelo endpoint de login. Não publique tokens, senhas ou segredos nos arquivos do projeto.

### 9.2. Dashboard

O endpoint `/api/dashboard` fornece os dados utilizados pela interface para apresentar indicadores e atividades relacionadas ao usuário autenticado.

A resposta inclui campos para obras ativas, diários registrados, custos do mês, eficiência, progresso das obras e atividades recentes. Alguns indicadores podem estar zerados, vazios ou indisponíveis enquanto os respectivos dados e cálculos não estiverem implementados ou não existirem registros no banco.

## 10. Estrutura do Projeto

A organização geral inclui os seguintes diretórios e arquivos:

```text
Sistema-de-Engenharia-main/
├── front-login/
│   └── src/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   └── server.js
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── teste-conexao.js
└── README.md
```

Essa estrutura apresenta os principais componentes do projeto. Os módulos internos do front-end e os demais recursos devem ser documentados conforme forem implementados.

## 11. Segurança e Configuração

- Os arquivos `.env` não devem ser versionados.
- O arquivo `.env.example` deve conter apenas valores ilustrativos.
- As senhas dos usuários são armazenadas utilizando hash.
- Os endpoints protegidos validam o token JWT.
- O segredo JWT deve ser mantido fora do código-fonte e não deve ser compartilhado.
- A configuração de desenvolvimento não deve ser utilizada diretamente em produção.
- As credenciais e permissões do banco devem ser ajustadas conforme o ambiente de execução.

## 12. Estado Atual e Próximos Passos

A versão atual estabelece a base de persistência, autenticação e integração entre a API e o dashboard. A conexão com o banco foi verificada, os endpoints de cadastro e login foram testados e o dashboard já consome os dados disponibilizados pelo back-end.

Os próximos passos incluem o gerenciamento completo de projetos, a implementação das operações necessárias para o Diário de Obra e, posteriormente, os recursos de documentos e comunicação com clientes.

O desenvolvimento seguirá de forma incremental, com testes e atualização da documentação a cada etapa.