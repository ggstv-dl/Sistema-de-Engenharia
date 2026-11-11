const orcamentosService = require('../services/orcamentosService');
const ErroHttp = require('../lib/erroHttp');

function validarDadosOrcamento(corpo) {
  const { nome, descricao, valor } = corpo || {};

  if (typeof nome !== 'string' || nome.trim().length < 3 || nome.trim().length > 150) {
    throw new ErroHttp(400, 'O nome deve ter entre 3 e 150 caracteres.');
  }

  if (descricao !== undefined && (typeof descricao !== 'string' || descricao.trim().length > 2000)) {
    throw new ErroHttp(400, 'A descrição deve ser um texto de até 2000 caracteres.');
  }

  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new ErroHttp(400, 'O valor deve ser um número finito.');
  }

  if (valor <= 0 || valor > 999999999.99) {
    throw new ErroHttp(400, 'O valor deve ser maior que zero e no máximo 999999999,99.');
  }

  if (!/^\d+(?:\.\d{1,2})?$/.test(String(valor))) {
    throw new ErroHttp(400, 'O valor deve ter no máximo duas casas decimais.');
  }

  return {
    nome: nome.trim(),
    descricao: descricao === undefined ? null : descricao.trim() || null,
    valor,
  };
}

async function criar(req, res) {
  const dados = validarDadosOrcamento(req.body);
  const orcamento = await orcamentosService.criar(req.params.id, dados, req.usuario.sub);
  return res.status(201).json(orcamento);
}

async function listarDoProjeto(req, res) {
  const orcamentos = await orcamentosService.listarDoProjeto(req.params.id, req.usuario.sub);
  return res.json(orcamentos);
}

async function listar(req, res) {
  const { projetoId } = req.query;

  if (projetoId !== undefined && (typeof projetoId !== 'string' || !projetoId.trim())) {
    throw new ErroHttp(400, 'Informe um projetoId válido.');
  }

  const orcamentos = await orcamentosService.listar(req.usuario.sub, projetoId?.trim());
  return res.json(orcamentos);
}

module.exports = { criar, listarDoProjeto, listar };
