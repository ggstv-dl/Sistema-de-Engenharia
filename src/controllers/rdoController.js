const diariosService = require('../services/diariosService');
const ErroHttp = require('../lib/erroHttp');

function validarData(valor) {
  const formatoIso = /^(\d{4})-(\d{2})-(\d{2})(?:T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?)?$/;
  const partes = typeof valor === 'string' ? formatoIso.exec(valor) : null;

  if (!partes) {
    throw new ErroHttp(400, 'data deve ser uma data válida em ISO 8601.');
  }

  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const bissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0);
  const diasPorMes = [31, bissexto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const data = new Date(valor.length === 10 ? `${valor}T00:00:00` : valor);

  if (mes < 1 || mes > 12 || dia < 1 || dia > diasPorMes[mes - 1] || Number.isNaN(data.getTime())) {
    throw new ErroHttp(400, 'data deve ser uma data válida em ISO 8601.');
  }

  const fimHoje = new Date();
  fimHoje.setHours(23, 59, 59, 999);

  if (data > fimHoje) {
    throw new ErroHttp(400, 'A data do diário não pode ser futura.');
  }

  return data;
}

function validarTextoOpcional(valor, campo, limite) {
  if (valor === undefined) return null;

  if (typeof valor !== 'string' || valor.length > limite) {
    throw new ErroHttp(400, `${campo} deve ser um texto de até ${limite} caracteres.`);
  }

  return valor;
}

function validarLista(valor, campo, chaveTexto) {
  if (valor === undefined) return null;

  if (!Array.isArray(valor) || valor.length > 30) {
    throw new ErroHttp(400, `${campo} deve ser um array com no máximo 30 itens.`);
  }

  return valor.map((item, indice) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new ErroHttp(400, `${campo}[${indice}] deve ser um objeto com ${chaveTexto} e qtd.`);
    }

    const texto = item[chaveTexto];
    if (typeof texto !== 'string' || texto.trim().length < 1 || texto.trim().length > 60) {
      throw new ErroHttp(400, `${campo}[${indice}].${chaveTexto} deve ter entre 1 e 60 caracteres.`);
    }

    if (!Number.isInteger(item.qtd) || item.qtd < 1 || item.qtd > 1000) {
      throw new ErroHttp(400, `${campo}[${indice}].qtd deve ser um inteiro de 1 a 1000.`);
    }

    return { [chaveTexto]: texto.trim(), qtd: item.qtd };
  });
}

function validarFotos(valor) {
  if (valor === undefined) return [];

  if (!Array.isArray(valor) || valor.length > 10) {
    throw new ErroHttp(400, 'fotos deve ser um array com no máximo 10 caminhos de upload.');
  }

  valor.forEach((foto, indice) => {
    if (typeof foto !== 'string' || !foto.startsWith('/uploads/') || foto.length > 255 || foto.includes('..')) {
      throw new ErroHttp(400, `fotos[${indice}] deve começar com /uploads/, ter até 255 caracteres e não conter "..".`);
    }
  });

  return valor;
}

async function sincronizar(req, res) {
  const { projetoId, data, descricao, atividade, clima, observacoes, maoDeObra, equipamentos, fotos } = req.body || {};

  if (typeof projetoId !== 'string' || !projetoId.trim()) {
    throw new ErroHttp(400, 'Informe um projetoId válido.');
  }

  if (typeof descricao !== 'string' || descricao.trim().length < 3 || descricao.trim().length > 5000) {
    throw new ErroHttp(400, 'descricao deve ter entre 3 e 5000 caracteres.');
  }

  const dados = {
    projetoId: projetoId.trim(),
    data: validarData(data),
    descricao: descricao.trim(),
    atividade: validarTextoOpcional(atividade, 'atividade', 200),
    clima: validarTextoOpcional(clima, 'clima', 100),
    observacoes: validarTextoOpcional(observacoes, 'observacoes', 2000),
    maoDeObra: validarLista(maoDeObra, 'maoDeObra', 'funcao'),
    equipamentos: validarLista(equipamentos, 'equipamentos', 'nome'),
    fotos: validarFotos(fotos),
  };

  const diario = await diariosService.criar(dados, req.usuario.sub);
  return res.status(201).json(diario);
}

module.exports = { sincronizar };
