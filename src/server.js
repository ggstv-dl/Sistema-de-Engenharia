const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configurações básicas para receber JSON no Back-end
app.use(cors());
app.use(express.json());

// Rota de teste para ver no navegador
app.get('/', (req, res) => {
  res.json({ mensagem: "A API do CRM para Engenharia Civil está a funcionar perfeitamente! 🚀" });
});

// 1. Endpoint de Sincronização do Diário de Obra (Offline-First)
app.post('/api/rdo/sync', (req, res) => {
  const dadosOffline = req.body;
  // Aqui entraria a lógica de salvar no banco de dados (Prisma/PostgreSQL)
  console.log("Recebendo dados para sincronizar:", dadosOffline);
  res.status(200).json({ mensagem: "Sincronização concluída com sucesso!" });
});

// 2. Endpoint de Upload de Arquivos com Versionamento
app.post('/api/projetos/:id/arquivos', (req, res) => {
  const { id } = req.params;
  // Aqui entraria a biblioteca Multer para capturar o PDF/DWG
  console.log(`Recebendo novo arquivo para o projeto ID: ${id}`);
  res.status(201).json({ mensagem: "Nova versão do ficheiro guardada no repositório." });
});

// 3. Endpoint de Geração de PDF e envio por WhatsApp
app.post('/api/whatsapp/enviar-orcamento', (req, res) => {
  const { clienteId, orcamentoId } = req.body;
  // Aqui entraria o PDFKit gerando o documento e o Axios chamando a API do WhatsApp
  console.log(`Gerando PDF do orçamento ${orcamentoId} e enviando para o cliente ${clienteId}`);
  res.status(200).json({ mensagem: "PDF gerado e enviado para o WhatsApp do cliente!" });
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`Servidor a rodar! Teste no navegador: http://localhost:${PORT}`);
});