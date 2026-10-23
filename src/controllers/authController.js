const authService = require('../services/authService');
const ErroHttp = require('../lib/erroHttp');

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function registrar(req, res) {
  const { nome, email, senha } = req.body || {};

  if (
    typeof nome !== 'string' ||
    typeof email !== 'string' ||
    typeof senha !== 'string'
  ) {
    throw new ErroHttp(400, 'Informe nome, e-mail e senha válidos.');
  }

  const nomeNormalizado = nome.trim();
  const emailNormalizado = email.trim().toLowerCase();

  if (nomeNormalizado.length < 2 || nomeNormalizado.length > 100) {
    throw new ErroHttp(400, 'O nome deve ter entre 2 e 100 caracteres.');
  }

  if (emailNormalizado.length > 254 || !REGEX_EMAIL.test(emailNormalizado)) {
    throw new ErroHttp(400, 'Informe um endereço de e-mail válido.');
  }

  if (senha.length < 8 || senha.length > 72) {
    throw new ErroHttp(400, 'A senha deve ter entre 8 e 72 caracteres.');
  }

  const usuario = await authService.registrar({
    nome: nomeNormalizado,
    email: emailNormalizado,
    senha,
  });

  return res.status(201).json({
    message: 'Cadastro realizado com sucesso.',
    usuario,
  });
}

async function login(req, res) {
  const { email, senha } = req.body || {};

  if (
    typeof email !== 'string' ||
    typeof senha !== 'string' ||
    !email.trim() ||
    !senha
  ) {
    throw new ErroHttp(400, 'Informe e-mail e senha.');
  }

  const { token, usuario } = await authService.login({
    email: email.trim().toLowerCase(),
    senha,
  });

  return res.status(200).json({
    message: 'Login realizado com sucesso.',
    token,
    usuario,
  });
}

module.exports = { registrar, login };
