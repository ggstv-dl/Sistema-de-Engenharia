const { Router } = require('express');
const health = require('./health');
const auth = require('./auth');
const clientes = require('./clientes');
const projetos = require('./projetos');
const dashboard = require('./dashboard');
const rdo = require('./rdo');
const diarios = require('./diarios');
const arquivos = require('./arquivos');
const orcamentos = require('./orcamentos');
const whatsapp = require('./whatsapp');

const router = Router();

router.use(health);
router.use('/api/auth', auth);
router.use('/api/clientes', clientes);
router.use('/api/dashboard', dashboard);
router.use('/api/rdo', rdo);
router.use('/api/diarios', diarios);
router.use('/api/projetos', projetos);
router.use('/api/projetos', arquivos);
router.use('/api/projetos', orcamentos.porProjeto);
router.use('/api/orcamentos', orcamentos.geral);
router.use('/api/whatsapp', whatsapp);

module.exports = router;
