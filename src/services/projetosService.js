const prisma = require('../lib/prisma');
const ErroHttp = require('../lib/erroHttp');

const camposProjeto = {
  id: true,
  titulo: true,
  descricao: true,
  status: true,
  prioridade: true,
  localizacao: true,
  dataInicio: true,
  criadoEm: true,
  atualizadoEm: true,
  cliente: { select: { id: true, nome: true, email: true, telefone: true } },
  engenheiro: { select: { id: true, nome: true } },
};

/**
 * Lista os projetos do engenheiro com cliente e engenheiro embutidos.
 * @param {string} engenheiroId - Identificador do token autenticado
 * @returns {Promise<object[]>} Projetos ordenados pela atualização mais recente
 */
async function listar(engenheiroId) {
  return prisma.projeto.findMany({
    where: { engenheiroId },
    select: camposProjeto,
    orderBy: { atualizadoEm: 'desc' },
  });
}

async function verificarCliente(clienteId) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { id: true },
  });

  if (!cliente) {
    throw new ErroHttp(404, 'Cliente não encontrado.');
  }
}

/**
 * Cria um projeto vinculado ao engenheiro autenticado e a um cliente existente.
 * @param {object} dados - Campos validados pelo controller
 * @param {string} engenheiroId - Identificador do token autenticado
 * @returns {Promise<object>} Projeto no formato da listagem
 * @throws {ErroHttp} 404 se o cliente não existir
 */
async function criar(dados, engenheiroId) {
  await verificarCliente(dados.clienteId);

  return prisma.projeto.create({
    data: { ...dados, engenheiroId },
    select: camposProjeto,
  });
}

/**
 * Atualiza somente um projeto pertencente ao engenheiro autenticado.
 * @param {string} id - Identificador do projeto
 * @param {object} dados - Campos reconhecidos e validados pelo controller
 * @param {string} engenheiroId - Identificador do token autenticado
 * @returns {Promise<object>} Projeto no formato da listagem
 * @throws {ErroHttp} 404 se o projeto não pertencer ao engenheiro ou o cliente não existir
 */
async function atualizar(id, dados, engenheiroId) {
  const projeto = await prisma.projeto.findFirst({
    where: { id, engenheiroId },
    select: { id: true },
  });

  if (!projeto) {
    throw new ErroHttp(404, 'Projeto não encontrado.');
  }

  if (dados.clienteId !== undefined) {
    await verificarCliente(dados.clienteId);
  }

  return prisma.projeto.update({
    where: { id },
    data: dados,
    select: camposProjeto,
  });
}

module.exports = { listar, criar, atualizar };
