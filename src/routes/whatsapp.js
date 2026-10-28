const { Router } = require('express');
const autenticarToken = require('../middlewares/autenticarToken');
const whatsappController = require('../controllers/whatsappController');

const router = Router();
router.use(autenticarToken);

router.post('/enviar-orcamento', whatsappController.enviarOrcamento);

module.exports = router;
