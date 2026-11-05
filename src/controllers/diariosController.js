const diariosService = require('../services/diariosService');
const ErroHttp = require('../lib/erroHttp');

async function listar(req, res) {
  const { projetoId } = req.query;

  if (projetoId !== undefined && (typeof projetoId !== 'string' || !projetoId.trim())) {
    throw new ErroHttp(400, 'Informe um projetoId válido.');
  }

  const diarios = await diariosService.listar(req.usuario.sub, projetoId?.trim());
  return res.json(diarios);
}

module.exports = { listar };
