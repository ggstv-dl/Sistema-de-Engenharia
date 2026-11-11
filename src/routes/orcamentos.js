const { Router } = require('express');
const autenticarToken = require('../middlewares/autenticarToken');
const orcamentosController = require('../controllers/orcamentosController');

const porProjeto = Router();
porProjeto.use(autenticarToken);
porProjeto.post('/:id/orcamentos', orcamentosController.criar);
porProjeto.get('/:id/orcamentos', orcamentosController.listarDoProjeto);

const geral = Router();
geral.use(autenticarToken);
geral.get('/', orcamentosController.listar);

module.exports = { porProjeto, geral };
