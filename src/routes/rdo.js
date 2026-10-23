const { Router } = require('express');
const rdoController = require('../controllers/rdoController');

const router = Router();

router.post('/sync', rdoController.sincronizar);

module.exports = router;
