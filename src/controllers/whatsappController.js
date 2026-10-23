function enviarOrcamento(req, res) {
  res.status(501).json({
    message: 'Integração com WhatsApp ainda não implementada.',
  });
}

module.exports = { enviarOrcamento };
