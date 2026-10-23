const prisma = require('../lib/prisma');

/**
 * Monta os dados do dashboard do engenheiro logado.
 * @param {string} engenheiroId - Id do engenheiro (req.usuario.sub)
 * @returns {Promise<object>} Indicadores e atividades recentes
 */
async function obterResumo(engenheiroId) {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [obrasAtivas, totalDiarios, custoMes, projetos, diarios] =
    await Promise.all([
      prisma.projeto.count({
        where: {
          status: 'em_andamento',
          engenheiroId,
        },
      }),
      prisma.diarioObra.count({
        where: {
          engenheiroId,
        },
      }),
      prisma.orcamento.aggregate({
        where: {
          projeto: {
            engenheiroId,
          },
          dataCriacao: {
            gte: inicioMes,
          },
        },
        _sum: {
          valor: true,
        },
      }),
      prisma.projeto.findMany({
        where: {
          engenheiroId,
        },
        select: {
          id: true,
          titulo: true,
          status: true,
          criadoEm: true,
        },
        orderBy: {
          atualizadoEm: 'desc',
        },
        take: 6,
      }),
      prisma.diarioObra.findMany({
        where: {
          engenheiroId,
        },
        select: {
          id: true,
          descricao: true,
          data: true,
          criadoEm: true,
          projeto: {
            select: {
              titulo: true,
            },
          },
        },
        orderBy: {
          criadoEm: 'desc',
        },
        take: 5,
      }),
    ]);

  const atividades = diarios.map((diario) => ({
    tipo: 'diario',
    texto: `Diário de Obra — ${diario.projeto.titulo}: ${diario.descricao}`,
    quando: diario.criadoEm.toISOString(),
    autor: 'Engenheiro',
  }));

  return {
    obrasAtivas: {
      valor: obrasAtivas,
      detalhe: 'Projetos em andamento',
    },
    diariosPendentes: {
      valor: totalDiarios,
      detalhe: 'Total de diários registrados; pendências não modeladas',
    },
    custoTotal: {
      valor: custoMes._sum.valor ?? 0,
      detalhe: 'Soma dos orçamentos criados neste mês',
    },
    eficiencia: {
      valor: null,
    },
    progressoObras: [],
    atividades,
  };
}

module.exports = { obterResumo };
