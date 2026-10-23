const jwt = require('jsonwebtoken');
const env = require('../config/env');

function autenticarToken(req, res, next) {
  const autorizacao = req.headers.authorization;

  if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Autenticação necessária.',
    });
  }

  const token = autorizacao.slice(7);

  try {
    req.usuario = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({
      message: 'Token inválido ou expirado. Faça login novamente.',
    });
  }
}

module.exports = autenticarToken;
