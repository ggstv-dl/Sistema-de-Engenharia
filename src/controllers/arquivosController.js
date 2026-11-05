const arquivosService = require('../services/arquivosService');

async function verificarProjeto(req, res, next) {
  await arquivosService.verificarProjeto(req.params.id, req.usuario.sub);
  return next();
}

async function enviar(req, res) {
  const arquivo = await arquivosService.criar(req.params.id, req.file);
  return res.status(201).json(arquivo);
}

async function listar(req, res) {
  const arquivos = await arquivosService.listar(req.params.id);
  return res.json(arquivos);
}

module.exports = { verificarProjeto, enviar, listar };
