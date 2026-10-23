function enviar(req, res) {
  res.status(501).json({
    message: 'Upload de arquivos ainda não implementado.',
  });
}

module.exports = { enviar };
