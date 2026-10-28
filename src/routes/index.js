const { Router } = require('express');
const health = require('./health');
const auth = require('./auth');
const clientes = require('./clientes');
const dashboard = require('./dashboard');
const rdo = require('./rdo');
const arquivos = require('./arquivos');
const whatsapp = require('./whatsapp');

const router = Router();

router.use(health);
router.use('/api/auth', auth);
router.use('/api/clientes', clientes);
router.use('/api/dashboard', dashboard);
router.use('/api/rdo', rdo);
router.use('/api/projetos', arquivos);
router.use('/api/whatsapp', whatsapp);

module.exports = router;
