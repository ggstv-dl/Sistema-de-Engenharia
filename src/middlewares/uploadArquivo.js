const multer = require('multer');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const env = require('../config/env');
const ErroHttp = require('../lib/erroHttp');

const extensoes = ['.pdf', '.dwg', '.rvt', '.jpg', '.jpeg', '.png'];
const campoObrigatorio = "Envie o arquivo no campo 'arquivo'.";

const receber = multer({
  defParamCharset: 'utf8',
  storage: multer.diskStorage({
    destination: env.uploadDir,
    filename(req, arquivo, callback) {
      callback(null, `${randomUUID()}${path.extname(arquivo.originalname.trim()).toLowerCase()}`);
    },
  }),
  limits: { fileSize: Math.floor(env.maxFileSizeMb * 1024 * 1024) },
  fileFilter(req, arquivo, callback) {
    if (!extensoes.includes(path.extname(arquivo.originalname.trim()).toLowerCase())) {
      return callback(new ErroHttp(400, 'Tipo de arquivo não permitido. Aceitos: pdf, dwg, rvt, jpg, jpeg, png.'));
    }
    return callback(null, true);
  },
}).single('arquivo');

function uploadArquivo(req, res, next) {
  receber(req, res, (erro) => {
    if (erro instanceof multer.MulterError) {
      if (erro.code === 'LIMIT_FILE_SIZE') {
        return next(new ErroHttp(413, `Arquivo maior que ${env.maxFileSizeMb} MB.`));
      }
      const mensagem = ['LIMIT_UNEXPECTED_FILE', 'LIMIT_FILE_COUNT', 'MISSING_FIELD_NAME'].includes(erro.code)
        ? campoObrigatorio
        : 'Requisição de upload inválida.';
      return next(new ErroHttp(400, mensagem));
    }

    if (erro) return next(erro);
    if (!req.file) return next(new ErroHttp(400, campoObrigatorio));
    return next();
  });
}

module.exports = uploadArquivo;
