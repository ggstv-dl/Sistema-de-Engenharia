const ErroHttp = require('../lib/erroHttp');

// O Express só reconhece middleware de erro com 4 parâmetros, mesmo sem usar "next".
function tratadorErros(erro, req, res, next) {
  if (res.headersSent) {
    return next(erro);
  }

  if (erro instanceof ErroHttp) {
    return res.status(erro.status).json({ message: erro.message });
  }

  if (erro instanceof SyntaxError && erro.status === 400 && 'body' in erro) {
    return res.status(400).json({
      message: 'O corpo da requisição contém JSON inválido.',
    });
  }

  console.error('Erro inesperado:', erro);
  return res.status(500).json({
    message: 'Erro interno do servidor.',
  });
}

module.exports = tratadorErros;
