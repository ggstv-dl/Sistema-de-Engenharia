const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const raiz = path.join(__dirname, '..');

function listarArquivosJs(pasta) {
  return fs.readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const caminho = path.join(pasta, item.name);
    if (item.isDirectory()) return listarArquivosJs(caminho);
    return item.name.endsWith('.js') ? [caminho] : [];
  });
}

const arquivos = [
  ...listarArquivosJs(path.join(raiz, 'src')),
  path.join(raiz, 'prisma', 'seed.js'),
];

let falhou = false;

for (const arquivo of arquivos) {
  const resultado = spawnSync(process.execPath, ['--check', arquivo], { stdio: 'inherit' });
  if (resultado.status !== 0) falhou = true;
}

if (falhou) {
  console.error('Verificação de sintaxe falhou.');
  process.exit(1);
}

console.log(`Sintaxe OK em ${arquivos.length} arquivos.`);
