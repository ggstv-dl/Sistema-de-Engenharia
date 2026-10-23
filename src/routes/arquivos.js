const { Router } = require('express');
const arquivosController = require('../controllers/arquivosController');

const router = Router();

router.post('/:id/arquivos', arquivosController.enviar);

module.exports = router;
