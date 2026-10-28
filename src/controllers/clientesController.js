const clientesService = require('../services/clientesService');
const ErroHttp = require('../lib/erroHttp');

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function listar(req, res) {
  const clientes = await clientesService.listar();
  return res.json(clientes);
}

async function criar(req, res) {
  const { nome, email, telefone } = req.body || {};

  if (
    typeof nome !== 'string' ||
    typeof email !== 'string' ||
    typeof telefone !== 'string'
  ) {
    throw new ErroHttp(400, 'Informe nome, e-mail e telefone válidos.');
  }

  const nomeNormalizado = nome.trim();
  const emailNormalizado = email.trim().toLowerCase();
  const telefoneInformado = telefone.trim();

  if (nomeNormalizado.length < 2 || nomeNormalizado.length > 100) {
    throw new ErroHttp(400, 'O nome deve ter entre 2 e 100 caracteres.');
  }

  if (emailNormalizado.length > 254 || !REGEX_EMAIL.test(emailNormalizado)) {
    throw new ErroHttp(400, 'Informe um endereço de e-mail válido.');
  }

  const digitosTelefone = telefoneInformado.replace(/\D/g, '');
  if (digitosTelefone.length < 10 || digitosTelefone.length > 13) {
    throw new ErroHttp(400, 'O telefone deve conter de 10 a 13 dígitos.');
  }

  const cliente = await clientesService.criar({
    nome: nomeNormalizado,
    email: emailNormalizado,
    telefone: telefoneInformado,
  });

  return res.status(201).json(cliente);
}

module.exports = { listar, criar };
