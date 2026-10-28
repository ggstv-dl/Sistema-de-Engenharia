const prisma = require('../lib/prisma');
const ErroHttp = require('../lib/erroHttp');

/**
 * Lista os clientes globais em ordem de nome.
 * @returns {Promise<Array<{id: string, nome: string, email: string, telefone: string}>>}
 */
async function listar() {
  return prisma.cliente.findMany({
    select: { id: true, nome: true, email: true, telefone: true },
    orderBy: { nome: 'asc' },
  });
}

/**
 * Cria um cliente com os dados validados pelo controller.
 * @param {{nome: string, email: string, telefone: string}} dados
 * @returns {Promise<object>} Cliente criado
 * @throws {ErroHttp} 409 se o e-mail já estiver cadastrado
 */
async function criar({ nome, email, telefone }) {
  const existente = await prisma.cliente.findUnique({ where: { email } });

  if (existente) {
    throw new ErroHttp(409, 'Já existe um cliente com este e-mail.');
  }

  try {
    return await prisma.cliente.create({ data: { nome, email, telefone } });
  } catch (erro) {
    if (erro.code === 'P2002') {
      throw new ErroHttp(409, 'Já existe um cliente com este e-mail.');
    }
    throw erro;
  }
}

module.exports = { listar, criar };
