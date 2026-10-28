const { Router } = require('express');
const autenticarToken = require('../middlewares/autenticarToken');
const clientesController = require('../controllers/clientesController');

const router = Router();
router.use(autenticarToken);

router.get('/', clientesController.listar);
router.post('/', clientesController.criar);

module.exports = router;
