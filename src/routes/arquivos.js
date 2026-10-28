const { Router } = require('express');
const autenticarToken = require('../middlewares/autenticarToken');
const arquivosController = require('../controllers/arquivosController');

const router = Router();
router.use(autenticarToken);

router.post('/:id/arquivos', arquivosController.enviar);

module.exports = router;
