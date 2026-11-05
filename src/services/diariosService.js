const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');
const ErroHttp = require('../lib/erroHttp');

const camposDiario = {
  id: true,
  projetoId: true,
  data: true,
  atividade: true,
  clima: true,
  descricao: true,
  observacoes: true,
  maoDeObra: true,
  equipamentos: true,
  fotos: true,
  criadoEm: true,
  projeto: { select: { id: true, titulo: true } },
  engenheiro: { select: { id: true, nome: true } },
};

/**
 * Cria um diário em um projeto pertencente ao engenheiro autenticado.
 * @param {object} dados - Campos validados pelo controller
 * @param {string} engenheiroId - Identificador do token autenticado
 * @returns {Promise<object>} Diário com projeto e engenheiro embutidos
 * @throws {ErroHttp} 404 se o projeto não existir ou pertencer a outro engenheiro
 */
async function criar(dados, engenheiroId) {
  const projeto = await prisma.projeto.findFirst({
    where: { id: dados.projetoId, engenheiroId },
    select: { id: true },
  });

  if (!projeto) {
    throw new ErroHttp(404, 'Projeto não encontrado.');
  }

  return prisma.diarioObra.create({
    data: {
      ...dados,
      engenheiroId,
      maoDeObra: dados.maoDeObra ?? Prisma.DbNull,
      equipamentos: dados.equipamentos ?? Prisma.DbNull,
    },
    select: camposDiario,
  });
}

module.exports = { criar };
