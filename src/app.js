const express = require('express');
// Precisa ser importado depois do express e antes de qualquer rota ser registrada.
require('express-async-errors');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const rotas = require('./routes');
const naoEncontrado = require('./middlewares/naoEncontrado');
const tratadorErros = require('./middlewares/tratadorErros');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigem }));
app.use(morgan(env.ehProducao ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));

app.use(rotas);

app.use(naoEncontrado);
app.use(tratadorErros);

module.exports = app;
