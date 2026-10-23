const { Router } = require('express');
const whatsappController = require('../controllers/whatsappController');

const router = Router();

router.post('/enviar-orcamento', whatsappController.enviarOrcamento);

module.exports = router;
