const projetosService = require('../services/projetosService');
const ErroHttp = require('../lib/erroHttp');
const { statusProjeto, prioridadesProjeto } = require('../lib/constantesProjeto');

function validarTextoOpcional(valor, campo, limite) {
  if (valor !== undefined && valor !== null && (typeof valor !== 'string' || valor.length > limite)) {
    throw new ErroHttp(400, `${campo} deve ser um texto de até ${limite} caracteres.`);
  }
}

function validarDataInicio(valor) {
  if (valor === undefined || valor === null) return valor;

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

function validarDadosProjeto(corpo, parcial = false) {
  const { titulo, descricao, status, prioridade, clienteId, localizacao, dataInicio } = corpo || {};
  const dados = {};

  if (!parcial || titulo !== undefined) {
    if (typeof titulo !== 'string' || titulo.trim().length < 3 || titulo.trim().length > 150) {
      throw new ErroHttp(400, 'O título deve ter entre 3 e 150 caracteres.');
    }
    dados.titulo = titulo.trim();
  }

  if (!parcial || clienteId !== undefined) {
    if (typeof clienteId !== 'string' || !clienteId.trim()) {
      throw new ErroHttp(400, 'Informe um clienteId válido.');
    }
    dados.clienteId = clienteId.trim();
  }

  if (descricao !== undefined) {
    validarTextoOpcional(descricao, 'descricao', 1000);
    dados.descricao = descricao;
  }

  if (localizacao !== undefined) {
    validarTextoOpcional(localizacao, 'localizacao', 200);
    dados.localizacao = localizacao;
  }

  if (!parcial || status !== undefined) {
    if (!statusProjeto.includes(status)) {
      throw new ErroHttp(400, `Status inválido. Valores aceitos: ${statusProjeto.join(', ')}.`);
    }
    dados.status = status;
  }

  if (!parcial || prioridade !== undefined) {
    if (!prioridadesProjeto.includes(prioridade)) {
      throw new ErroHttp(400, `Prioridade inválida. Valores aceitos: ${prioridadesProjeto.join(', ')}.`);
    }
    dados.prioridade = prioridade;
  }

  if (dataInicio !== undefined) {
    dados.dataInicio = validarDataInicio(dataInicio);
  }

  if (parcial && Object.keys(dados).length === 0) {
    throw new ErroHttp(400, 'Informe ao menos um campo para atualizar.');
  }

  return dados;
}

async function criar(req, res) {
  const dados = validarDadosProjeto(req.body);
  const projeto = await projetosService.criar(dados, req.usuario.sub);

  return res.status(201).json(projeto);
}

async function atualizar(req, res) {
  const dados = validarDadosProjeto(req.body, true);
  const projeto = await projetosService.atualizar(req.params.id, dados, req.usuario.sub);
  return res.json(projeto);
}

module.exports = { listar, criar, atualizar };
