const { Router } = require('express');
const autenticarToken = require('../middlewares/autenticarToken');
const projetosController = require('../controllers/projetosController');

const router = Router();
router.use(autenticarToken);

router.get('/', projetosController.listar);
router.post('/', projetosController.criar);
router.put('/:id', projetosController.atualizar);

module.exports = router;
