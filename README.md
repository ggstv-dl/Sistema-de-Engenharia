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
| Node.js | Ambiente de execução JavaScript |
| TypeScript | Tipagem estática e organização do código |
| Express | Desenvolvimento da API REST |
| PostgreSQL | Banco de dados relacional |
| Prisma | Acesso e gerenciamento do banco de dados |
| JWT | Autenticação baseada em tokens |
| Bcryptjs | Hash de senhas |
| Multer | Recebimento de arquivos |
| PDFKit | Geração de documentos PDF |
| Dotenv | Gerenciamento de variáveis de ambiente |
| CORS | Controle de requisições entre diferentes origens |
| Nodemon | Reinicialização automática durante o desenvolvimento |

## 5. Requisitos para Execução

Antes de executar o projeto, verifique se os seguintes recursos estão instalados:

- Node.js versão 18 ou superior.
- npm, instalado junto ao Node.js.
- PostgreSQL.
- Git.

## 6. Instalação

Clone o repositório e acesse o diretório do projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd crm-engineer-civil
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente conforme a próxima seção.

## 7. Configuração do Ambiente

Crie um arquivo `.env` com base no arquivo `.env.example`, caso ele esteja disponível:

```bash
cp .env.example .env
```

Configure as variáveis necessárias:

```env
PORT=3000
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/crm_engineer_civil?schema=public"
JWT_SECRET="SUA_CHAVE_SECRETA"
JWT_EXPIRES_IN=24h
WHATSAPP_API_KEY="SUA_CHAVE_API"
WHATSAPP_FROM_NUMBER="NUMERO_CONFIGURADO_NO_SERVICO"
```

**Importante:** substitua os valores de exemplo pelas configurações reais do ambiente. Não compartilhe credenciais e nunca envie o arquivo `.env` ao repositório.

A variável `WHATSAPP_API_KEY` e as configurações relacionadas ao WhatsApp dependem do provedor de integração escolhido.

Caso o projeto utilize Prisma, execute também os comandos de preparação do banco de dados previstos na configuração real do projeto.

## 8. Execução

### Desenvolvimento

```bash
npm run dev
```

### Compilação para produção

```bash
npm run build
```

### Produção

```bash
npm start
```

Os comandos acima pressupõem que os scripts correspondentes estejam configurados no `package.json`.

Por padrão, considerando `PORT=3000`, a API estará disponível em:

`http://localhost:3000`

## 9. Endpoints da API

Os endpoints abaixo representam as rotas descritas na proposta atual e devem ser confirmados no código-fonte.

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/` | Verificação de disponibilidade da API |
| POST | `/api/rdo/sync` | Sincronização de registros do Diário de Obra |
| POST | `/api/projetos/:id/arquivos` | Envio de arquivos vinculados a um projeto |
| POST | `/api/whatsapp/enviar-orcamento` | Solicitação de geração e envio de orçamento por WhatsApp |

## 10. Exemplos de Requisições

### 10.1. Verificar a API

```bash
curl http://localhost:3000/
```

### 10.2. Sincronizar o Diário de Obra

```bash
curl -X POST http://localhost:3000/api/rdo/sync \
  -H "Content-Type: application/json" \
  -d '{
    "obraId": "123",
    "data": "2024-01-15",
    "anotacoes": "Fundação executada com sucesso"
  }'
```

### 10.3. Enviar um arquivo para um projeto

```bash
curl -X POST http://localhost:3000/api/projetos/42/arquivos \
  -F "arquivo=@caminho/do/arquivo.pdf"
```

### 10.4. Solicitar orçamento via WhatsApp

```bash
curl -X POST http://localhost:3000/api/whatsapp/enviar-orcamento \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "cliente-001",
    "orcamentoId": "orc-2024-001"
  }'
```

Os corpos das requisições e as respostas esperadas devem ser ajustados conforme a implementação efetiva da API.

## 11. Estrutura do Projeto

A estrutura abaixo é uma referência inicial, baseada na organização apresentada na documentação. Ela deve ser atualizada para refletir os arquivos realmente existentes no repositório.

```text
crm-engineer-civil/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── routes.ts
│   ├── controllers/
│   ├── services/
│   └── middleware/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```


## 12. Considerações Finais

O CRM Engineer Civil tem como objetivo contribuir para a organização e a digitalização das atividades de engenheiros civis autônomos, integrando recursos de gerenciamento de projetos, registro de informações de campo e geração de documentos em uma API preparada para evoluir conforme as necessidades do sistema.
