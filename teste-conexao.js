
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testarConexao() {
  try {
    const resultado = await prisma.$queryRaw`SELECT 1 AS conectado`;
    console.log("Conexão Prisma OK:", resultado);
  } catch (erro) {
    console.error("Erro ao conectar ao banco:", erro.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

testarConexao();
