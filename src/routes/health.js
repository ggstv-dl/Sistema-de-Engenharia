const { Router } = require('express');
const healthController = require('../controllers/healthController');

const router = Router();

router.get('/', healthController.raiz);
router.get('/api/health', healthController.verificar);

module.exports = router;
