const fs = require('node:fs/promises');
const path = require('node:path');
const prisma = require('../lib/prisma');
const ErroHttp = require('../lib/erroHttp');

const camposArquivo = { id: true, nome: true, tipo: true, caminho: true, versao: true };
const assinaturas = {
  pdf: Buffer.from('%PDF'),
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  jpg: Buffer.from([0xff, 0xd8, 0xff]),
  jpeg: Buffer.from([0xff, 0xd8, 0xff]),
};

async function verificarConteudo(arquivo, tipo) {
  const assinatura = assinaturas[tipo];
  if (!assinatura) return;

  const descritor = await fs.open(arquivo.path, 'r');
  const inicio = Buffer.alloc(assinatura.length);
  try {
    const { bytesRead } = await descritor.read(inicio, 0, inicio.length, 0);
    if (bytesRead !== assinatura.length || !inicio.equals(assinatura)) {
      throw new ErroHttp(400, 'O conteúdo do arquivo não corresponde ao tipo informado.');
    }
  } finally {
    await descritor.close();
  }
}

/**
 * Verifica se o projeto pertence ao engenheiro antes de receber ou listar arquivos.
 * @param {string} id - Identificador do projeto
 * @param {string} engenheiroId - Identificador do token autenticado
 * @returns {Promise<void>}
 * @throws {ErroHttp} 404 se o projeto não existir ou pertencer a outro engenheiro
 */
async function verificarProjeto(id, engenheiroId) {
  const projeto = await prisma.projeto.findFirst({
    where: { id, engenheiroId },
    select: { id: true },
  });

  if (!projeto) throw new ErroHttp(404, 'Projeto não encontrado.');
}

/**
 * Valida o conteúdo e cria uma versão sem modificar os arquivos anteriores.
 * @param {string} projetoId - Projeto autorizado antes do upload
 * @param {object} arquivo - Arquivo recebido pelo multer
 * @returns {Promise<object>} Identificação, nome, tipo, caminho e versão do arquivo
 */
async function criar(projetoId, arquivo) {
  try {
    const nome = path.basename(arquivo.originalname).replace(/[\u0000-\u001f\u007f-\u009f]/g, '').trim().slice(0, 150);
    // O modo insensitive usa ILIKE; nomes com curingas devem continuar literais.
    const nomeConsulta = nome.replace(/[\\%_]/g, (caractere) => '\\' + caractere);
    const tipo = path.extname(arquivo.filename).slice(1).toLowerCase();
    await verificarConteudo(arquivo, tipo);

    return await prisma.$transaction(async (transacao) => {
      // Serializa uploads do projeto para impedir versões repetidas em requisições simultâneas.
      await transacao.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${projetoId}))`;
      const anterior = await transacao.arquivo.findFirst({
        where: { projetoId, nome: { equals: nomeConsulta, mode: 'insensitive' } },
        select: { versao: true },
        orderBy: { versao: 'desc' },
      });

      return transacao.arquivo.create({
        data: {
          projetoId,
          nome,
          tipo,
          caminho: `/uploads/${arquivo.filename}`,
          versao: (anterior?.versao ?? 0) + 1,
        },
        select: camposArquivo,
      });
    });
  } catch (erro) {
    await fs.unlink(arquivo.path);
    throw erro;
  }
}

/**
 * Lista as versões do projeto por nome sem diferenciar caixa e por versão decrescente.
 * @param {string} projetoId - Projeto autorizado antes da consulta
 * @returns {Promise<object[]>} Arquivos com identificação, versão e data de criação
 */
async function listar(projetoId) {
  const arquivos = await prisma.arquivo.findMany({
    where: { projetoId },
    select: { ...camposArquivo, criadoEm: true },
  });

  return arquivos.sort((a, b) => a.nome.toLowerCase().localeCompare(b.nome.toLowerCase(), 'pt-BR') || b.versao - a.versao);
}

module.exports = { verificarProjeto, criar, listar };
