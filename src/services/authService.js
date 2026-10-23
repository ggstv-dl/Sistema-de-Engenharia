const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../lib/prisma');
const ErroHttp = require('../lib/erroHttp');

const CUSTO_BCRYPT = 10;

// Remove a senha de qualquer objeto de usuário enviado ao frontend.
function usuarioPublico(engenheiro) {
  return {
    id: engenheiro.id,
    nome: engenheiro.nome,
    email: engenheiro.email,
    perfil: 'Engenheiro',
  };
}

function gerarToken(engenheiro) {
  return jwt.sign(
    {
      sub: engenheiro.id,
      email: engenheiro.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiraEm }
  );
}

/**
 * Cadastra um engenheiro com a senha protegida por hash.
 * @param {{nome: string, email: string, senha: string}} dados - Dados já validados e normalizados
 * @returns {Promise<{id: string, nome: string, email: string, perfil: string}>} Usuário sem senha
 * @throws {ErroHttp} 409 se o e-mail já estiver cadastrado
 */
async function registrar({ nome, email, senha }) {
  const existente = await prisma.engenheiro.findUnique({ where: { email } });

  if (existente) {
    throw new ErroHttp(409, 'Este e-mail já está cadastrado.');
  }

  const senhaHash = await bcrypt.hash(senha, CUSTO_BCRYPT);

  try {
    const engenheiro = await prisma.engenheiro.create({
      data: { nome, email, senha: senhaHash },
    });

    return usuarioPublico(engenheiro);
  } catch (erro) {
    // Dois cadastros simultâneos podem passar pela busca acima; o banco garante o e-mail único.
    if (erro.code === 'P2002') {
      throw new ErroHttp(409, 'Este e-mail já está cadastrado.');
    }
    throw erro;
  }
}

/**
 * Autentica um engenheiro e gera o token JWT.
 * @param {{email: string, senha: string}} dados - E-mail já normalizado e senha informada
 * @returns {Promise<{token: string, usuario: object}>} Token e usuário sem senha
 * @throws {ErroHttp} 401 se e-mail ou senha estiverem incorretos
 */
async function login({ email, senha }) {
  const engenheiro = await prisma.engenheiro.findUnique({ where: { email } });

  if (!engenheiro || !(await bcrypt.compare(senha, engenheiro.senha))) {
    throw new ErroHttp(401, 'E-mail ou senha incorretos.');
  }

  return {
    token: gerarToken(engenheiro),
    usuario: usuarioPublico(engenheiro),
  };
}

module.exports = { registrar, login };
