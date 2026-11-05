const express = require('express');
// Precisa ser importado depois do express e antes de qualquer rota ser registrada.
require('express-async-errors');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('node:fs');
const path = require('node:path');
const env = require('./config/env');
const rotas = require('./routes');
const naoEncontrado = require('./middlewares/naoEncontrado');
const tratadorErros = require('./middlewares/tratadorErros');

fs.mkdirSync(env.uploadDir, { recursive: true });

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigem }));
app.use(morgan(env.ehProducao ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));

app.use('/uploads',
  helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }),
  express.static(env.uploadDir, {
    dotfiles: 'deny',
    index: false,
    setHeaders(res, caminho) {
      const imagem = ['.jpg', '.jpeg', '.png'].includes(path.extname(caminho).toLowerCase());
      res.setHeader('Content-Disposition', imagem ? 'inline' : 'attachment');
    },
  })
);

app.use(rotas);

app.use(naoEncontrado);
app.use(tratadorErros);

module.exports = app;
