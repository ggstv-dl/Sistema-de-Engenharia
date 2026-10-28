const { Router } = require('express');
const autenticarToken = require('../middlewares/autenticarToken');
const rdoController = require('../controllers/rdoController');

const router = Router();
router.use(autenticarToken);

router.post('/sync', rdoController.sincronizar);

module.exports = router;
