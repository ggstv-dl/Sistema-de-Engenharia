const healthService = require('../services/healthService');

function raiz(req, res) {
  res.json({
    mensagem: 'API do CRM de Engenharia Civil',
    status: 'online',
  });
}

async function verificar(req, res) {
  const conectado = await healthService.bancoDisponivel();

  if (conectado) {
    return res.status(200).json({ api: 'online', banco: 'conectado' });
  }

  return res.status(503).json({ api: 'online', banco: 'indisponivel' });
}

module.exports = { raiz, verificar };
