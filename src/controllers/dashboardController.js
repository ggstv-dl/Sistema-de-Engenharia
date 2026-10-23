const dashboardService = require('../services/dashboardService');

async function obterDashboard(req, res) {
  const resumo = await dashboardService.obterResumo(req.usuario.sub);
  return res.json(resumo);
}

module.exports = { obterDashboard };
