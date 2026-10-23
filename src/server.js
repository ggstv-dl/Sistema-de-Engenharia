const env = require('./config/env');
const app = require('./app');
const prisma = require('./lib/prisma');

const servidor = app.listen(env.porta, () => {
  console.log(`CRM API disponível em http://localhost:${env.porta}`);
});

let encerrando = false;

function encerrarServidor() {
  if (encerrando) return;
  encerrando = true;

  servidor.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', encerrarServidor);
process.on('SIGTERM', encerrarServidor);
