# CRM Engineer Civil - API Back-end

## Descrição

Esta é uma API REST back-end desenvolvida para um CRM voltado a **Engenheiros Civis Autônomos**. O sistema oferece suporte a:

- **Diário de Obra offline-first**: Sincronização de dados coletados offline diretamente no campo
- **Gestão de projetos**: Controle e organização de projetos de engenharia civil
- **Geração de PDFs**: Criação automatizada de orçamentos e relatórios técnicos
- **Integração com WhatsApp**: Envio automático de documentos e orçamentos via WhatsApp

A API foi construída com **Node.js**, **Express** e **TypeScript**, seguindo boas práticas de desenvolvimento software arquitetural limpa e escalável.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)
- [PostgreSQL](https://www.postgresql.org/) (banco de dados relacional)
- [Git](https://git-scm.com/) para controle de versão

## Instalação

Siga os passos abaixo para clonar o repositório e configurar o projeto:

```bash
# 1. Clone o repositório
git clone https://seu-usuario/crm-engineer-civil.git

# 2. Acesse o diretório do projeto
cd crm-engineer-civil

# 3. Instale as dependências
npm install
```

## Configuração de Ambiente

1. **Copie o arquivo .env.example**:

```bash
cp .env.example .env
```

2. **Configure as variáveis de ambiente** no arquivo `.env`:

```env
# Porta do servidor
PORT=3000

# URL de conexão com o PostgreSQL
DATABASE_URL="postgresql://localhost:5432/crm_engineer_civil?schema=public"

# Segredo para JWT (JWT_SECRET deve ser uma string longa e aleatória)
JWT_SECRET=sua-chave-secreta-aqui

# Tempo de expiração do JWT (em horas ou dias)
JWT_EXPIRES_IN=24h

# Chave da API do WhatsApp (opcional, para envio de orçamentos)
WHATSAPP_API_KEY=sua-chave-api-whatsapp

# Número de WhatsApp remetente (formato internacional sem +)
WHATSAPP_FROM_NUMBER=+5511999999999
```

## Execução

### Modo Desenvolvimento

```bash
# Inicia o servidor com hot-reload usando Nodemon
npm run dev
```

### Modo Produção

```bash
# Build TypeScript para JavaScript
npm run build

# Inicia o servidor em produção
npm start
```

O servidor estará disponível em `http://localhost:3000` por padrão.

## Utilização (Endpoints da API)

Abaixo estão os principais endpoints disponíveis para teste e desenvolvimento:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/` | Status da API - retorna mensagem de saúde |
| `POST` | `/api/rdo/sync` | Sincronização do Diário de Obra (recebe dados offline) |
| `POST` | `/api/projetos/:id/arquivos` | Upload e versionamento de arquivos (PDF, DWG, etc.) do projeto |
| `POST` | `/api/whatsapp/enviar-orcamento` | Geração de PDF e envio via WhatsApp do orçamento |

### Exemplos de Requisições

#### 1. Status da API

```bash
curl -X GET http://localhost:3000/
```

```json
Response: {"mensagem": "A API do CRM para Engenharia Civil está a funcionar perfeitamente! 🚀"}
```

#### 2. Sincronização do Diário de Obra

```bash
curl -X POST http://localhost:3000/api/rdo/sync \
  -H "Content-Type: application/json" \
  -d {
    "obraId": "123",
    "data": "2024-01-15",
    "anotacoes": "Fundação executada com sucesso"
  }
```

```json
Response: {"mensagem": "Sincronização concluída com sucesso!"}
```

#### 3. Upload de Arquivos

```bash
curl -X POST http://localhost:3000/api/projetos/42/arquivos \
  -H "Content-Type: multipart/form-data" \
  -F "arquivo=@caminho/do/arquivo.pdf"
```

```json
Response: {"mensagem": "Nova versão do ficheiro guardada no repositório."}
```

#### 4. Geração de PDF e Envio via WhatsApp

```bash
curl -X POST http://localhost:3000/api/whatsapp/enviar-orcamento \
  -H "Content-Type: application/json" \
  -d {
    "clienteId": "cliente-001",
    "orcamentoId": "orc-2024-001"
  }
```

```json
Response: {"mensagem": "PDF gerado e enviado para o WhatsApp do cliente!"}
```

## Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web para API REST
- **CORS** - Middleware para permitir requisições cross-origin
- **Dotenv** - Gerenciamento de variáveis de ambiente
- **Nodemon** - Reinicialização do servidor durante desenvolvimento
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM para banco de dados (configurado no projeto)
- **Multer** - Middleware para upload de arquivos
- **PDFKit** - Geração de PDFs no Node.js
- **Bcryptjs** - Hash de senhas
- **Jsonwebtoken** - Autenticação via JWT

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento com Nodemon |
| `npm start` | Inicia o servidor em modo produção |
| `npm build` | Compila o TypeScript para JavaScript |

## Estrutura do Projeto

```
crm-engineer-civil/
├── .env              # Variáveis de ambiente (nunca commitar!)
├── .gitignore        # Arquivo de exclusão do Git
├── package.json      # Dependências e scripts
├── package-lock.json # Lock file do npm
├── prisma/
│   └── schema.prisma # Esquema do banco de dados
├── src/
│   ├── app.ts        # Configuração do Express
│   ├── server.js     # Ponto de entrada do servidor
│   ├── routes.ts     # Rotas da API
│   ├── controllers/  # Controladores de lógica
│   │   ├── fileUpload.ts
│   │   └── rdoSync.ts
│   ├── services/     # Serviços de negócio
│   │   └── whatsappPdf.ts
│   └── middleware/   # Middlewares customizados
│       └── auth.ts
└── README.md         # Documentação do projeto
```