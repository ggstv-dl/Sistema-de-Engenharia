const statusProjeto = Object.freeze([
  'planejamento',
  'em_andamento',
  'concluido',
  'cancelado',
]);

const prioridadesProjeto = Object.freeze(['baixa', 'media', 'alta']);

module.exports = { statusProjeto, prioridadesProjeto };
