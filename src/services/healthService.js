const prisma = require('../lib/prisma');

/**
 * Verifica se o PostgreSQL responde.
 * @returns {Promise<boolean>} true se o banco estiver conectado
 */
async function bancoDisponivel() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (erro) {
    console.error('Falha na conexão com o banco:', erro.message);
    return false;
  }
}

module.exports = { bancoDisponivel };
