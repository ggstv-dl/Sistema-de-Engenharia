const { Router } = require('express');
const autenticarToken = require('../middlewares/autenticarToken');
const dashboardController = require('../controllers/dashboardController');

const router = Router();

router.get('/', autenticarToken, dashboardController.obterDashboard);

module.exports = router;
