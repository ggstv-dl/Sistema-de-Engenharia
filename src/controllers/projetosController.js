const projetosService = require('../services/projetosService');
const ErroHttp = require('../lib/erroHttp');
const { statusProjeto, prioridadesProjeto } = require('../lib/constantesProjeto');

function validarTextoOpcional(valor, campo, limite) {
  if (valor !== undefined && (typeof valor !== 'string' || valor.length > limite)) {
    throw new ErroHttp(400, `${campo} deve ser um texto de até ${limite} caracteres.`);
  }
}

function validarDataInicio(valor) {
  if (valor === undefined) return undefined;

  const formatoIso = /^(\d{4})-(\d{2})-(\d{2})(?:T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?)?$/;
  const partes = typeof valor === 'string' ? formatoIso.exec(valor) : null;

  if (!partes) {
    throw new ErroHttp(400, 'dataInicio deve ser uma data válida em ISO 8601.');
  }

  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const bissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0);
  const diasPorMes = [31, bissexto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const data = new Date(valor);

  if (mes < 1 || mes > 12 || dia < 1 || dia > diasPorMes[mes - 1] || Number.isNaN(data.getTime())) {
    throw new ErroHttp(400, 'dataInicio deve ser uma data válida em ISO 8601.');
  }

  return data;
}

async function listar(req, res) {
  const projetos = await projetosService.listar(req.usuario.sub);
  return res.json(projetos);
}

async function criar(req, res) {
  const { titulo, descricao, status, prioridade, clienteId, localizacao, dataInicio } = req.body || {};

  if (typeof titulo !== 'string' || typeof clienteId !== 'string') {
    throw new ErroHttp(400, 'Informe título e clienteId válidos.');
  }

  const tituloNormalizado = titulo.trim();
  const clienteIdInformado = clienteId.trim();

  if (tituloNormalizado.length < 3 || tituloNormalizado.length > 150) {
    throw new ErroHttp(400, 'O título deve ter entre 3 e 150 caracteres.');
  }

  if (!clienteIdInformado) {
    throw new ErroHttp(400, 'Informe um clienteId válido.');
  }

  validarTextoOpcional(descricao, 'descricao', 1000);
  validarTextoOpcional(localizacao, 'localizacao', 200);

  if (!statusProjeto.includes(status)) {
    throw new ErroHttp(400, `Status inválido. Valores aceitos: ${statusProjeto.join(', ')}.`);
  }

  if (!prioridadesProjeto.includes(prioridade)) {
    throw new ErroHttp(400, `Prioridade inválida. Valores aceitos: ${prioridadesProjeto.join(', ')}.`);
  }

  const projeto = await projetosService.criar({
    titulo: tituloNormalizado,
    descricao,
    status,
    prioridade,
    clienteId: clienteIdInformado,
    localizacao,
    dataInicio: validarDataInicio(dataInicio),
  }, req.usuario.sub);

  return res.status(201).json(projeto);
}

module.exports = { listar, criar };
