const prisma = require('../lib/prisma');
const ErroHttp = require('../lib/erroHttp');

const camposOrcamento = {
  id: true,
  projetoId: true,
  nome: true,
  descricao: true,
  valor: true,
  dataCriacao: true,
  projeto: {
    select: {
      id: true,
      titulo: true,
      cliente: { select: { id: true, nome: true, telefone: true } },
    },
  },
};

const ordemOrcamentos = [{ dataCriacao: 'desc' }, { id: 'desc' }];

async function obterProjeto(projetoId, engenheiroId, select = { id: true }) {
  const projeto = await prisma.projeto.findFirst({
    where: { id: projetoId, engenheiroId },
    select,
  });

  if (!projeto) {
    throw new ErroHttp(404, 'Projeto não encontrado.');
  }

  return projeto;
}

/**
 * Cria um orçamento em um projeto do engenheiro autenticado.
 * @param {string} projetoId - Identificador do projeto
 * @param {object} dados - Nome, descrição e valor validados pelo controller
 * @param {string} engenheiroId - Identificador do token autenticado
 * @returns {Promise<object>} Orçamento com projeto e cliente embutidos
 * @throws {ErroHttp} 404 se o projeto não existir ou pertencer a outro engenheiro
 */
async function criar(projetoId, dados, engenheiroId) {
  await obterProjeto(projetoId, engenheiroId);

  return prisma.orcamento.create({
    data: { nome: dados.nome, descricao: dados.descricao, valor: dados.valor, projetoId },
    select: camposOrcamento,
  });
}

/**
 * Lista os orçamentos de um projeto do engenheiro, dos mais recentes aos mais antigos.
 * @param {string} projetoId - Identificador do projeto
 * @param {string} engenheiroId - Identificador do token autenticado
 * @returns {Promise<object[]>} Orçamentos com projeto e cliente embutidos
 * @throws {ErroHttp} 404 se o projeto não existir ou pertencer a outro engenheiro
 */
async function listarDoProjeto(projetoId, engenheiroId) {
  const projeto = await obterProjeto(projetoId, engenheiroId, {
    orcamentos: { select: camposOrcamento, orderBy: ordemOrcamentos },
  });
  return projeto.orcamentos;
}

/**
 * Lista até 200 orçamentos de projetos pertencentes ao engenheiro autenticado.
 * @param {string} engenheiroId - Identificador do token autenticado
 * @param {string} [projetoId] - Filtro opcional, sem remover a restrição de dono
 * @returns {Promise<object[]>} Orçamentos com projeto e cliente embutidos
 */
async function listar(engenheiroId, projetoId) {
  return prisma.orcamento.findMany({
    where: { projeto: { engenheiroId }, ...(projetoId ? { projetoId } : {}) },
    select: camposOrcamento,
    orderBy: ordemOrcamentos,
    take: 200,
  });
}

module.exports = { criar, listarDoProjeto, listar };
