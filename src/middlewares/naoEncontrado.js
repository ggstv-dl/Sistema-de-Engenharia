function naoEncontrado(req, res) {
  return res.status(404).json({
    message: 'Rota não encontrada.',
  });
}

module.exports = naoEncontrado;
