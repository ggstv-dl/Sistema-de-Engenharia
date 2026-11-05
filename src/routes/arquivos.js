const { Router } = require('express');
const autenticarToken = require('../middlewares/autenticarToken');
const arquivosController = require('../controllers/arquivosController');
const uploadArquivo = require('../middlewares/uploadArquivo');

const router = Router();
router.use(autenticarToken);

router.post('/:id/arquivos', arquivosController.verificarProjeto, uploadArquivo, arquivosController.enviar);
router.get('/:id/arquivos', arquivosController.verificarProjeto, arquivosController.listar);

module.exports = router;
