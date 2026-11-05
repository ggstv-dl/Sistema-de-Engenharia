require('dotenv').config();

const jwt = require('jsonwebtoken');
const path = require('node:path');

if (!process.env.JWT_SECRET) {
  throw new Error('Configure JWT_SECRET no arquivo .env antes de iniciar a API.');
}

// Valor só com dígitos vira número (segundos); o jsonwebtoken o leria como milissegundos.
function lerExpiracao(valor) {
  if (!valor) return '8h';
  return /^\d+$/.test(valor) ? Number(valor) : valor;
}

const jwtExpiraEm = lerExpiracao(process.env.JWT_EXPIRES_IN);

// Falha na inicialização, e não no primeiro login, se o valor for inválido.
try {
  jwt.sign({}, 'validacao', { expiresIn: jwtExpiraEm });
} catch {
  throw new Error('JWT_EXPIRES_IN inválido. Use valores como 8h, 30m ou 3600.');
}

const origens = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origem) => origem.trim())
  .filter(Boolean);

const tamanhoInformado = Number(process.env.MAX_FILE_SIZE_MB);
const maxFileSizeMb = Number.isFinite(tamanhoInformado) && tamanhoInformado > 0 ? tamanhoInformado : 10;
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR?.trim() || 'uploads');

module.exports = {
  ehProducao: process.env.NODE_ENV === 'production',
  porta: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiraEm,
  corsOrigem: origens.length === 1 ? origens[0] : origens,
  uploadDir,
  maxFileSizeMb,
};
