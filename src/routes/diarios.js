const { Router } = require('express');
const autenticarToken = require('../middlewares/autenticarToken');
const diariosController = require('../controllers/diariosController');

const router = Router();
router.use(autenticarToken);

router.get('/', diariosController.listar);

module.exports = router;
