const { Router } = require('express');
const autenticarToken = require('../middlewares/autenticarToken');
const projetosController = require('../controllers/projetosController');

const router = Router();
router.use(autenticarToken);

router.get('/', projetosController.listar);
router.post('/', projetosController.criar);

module.exports = router;
