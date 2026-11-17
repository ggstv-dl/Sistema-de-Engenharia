const fs = require('node:fs/promises');
const path = require('node:path');
const zlib = require('node:zlib');

const largura = 800;
const altura = 600;
const pasta = path.join(__dirname, '..', 'docs', 'validacao', 'fotos-exemplo');
const nomes = [1, 2, 3].map((numero) => 'foto-obra-' + numero + '.png');
const assinatura = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function crc32(dados) {
  let acumulador = 0xffffffff;
  for (const byte of dados) {
    acumulador ^= byte;
    for (let bit = 0; bit < 8; bit += 1) acumulador = (acumulador >>> 1) ^ ((acumulador & 1) ? 0xedb88320 : 0);
  }
  return (acumulador ^ 0xffffffff) >>> 0;
}

function montarChunk(tipo, dados) {
  const nome = Buffer.from(tipo, 'ascii');
  const tamanho = Buffer.alloc(4);
  tamanho.writeUInt32BE(dados.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([nome, dados])));
  return Buffer.concat([tamanho, nome, dados, crc]);
}

function gerarImagem(variacao) {
  const pixels = Buffer.alloc(largura * altura * 3);
  const paletas = [
    { ceu: [114, 175, 220], solo: [179, 141, 101], concreto: [139, 145, 150], aco: [219, 159, 45] },
    { ceu: [142, 177, 196], solo: [162, 130, 101], concreto: [149, 153, 150], aco: [219, 113, 54] },
    { ceu: [105, 163, 190], solo: [190, 151, 105], concreto: [126, 137, 143], aco: [210, 171, 54] },
  ];
  const cores = paletas[variacao];
  function pixel(x, y, cor) {
    if (x < 0 || y < 0 || x >= largura || y >= altura) return;
    const inicio = (y * largura + x) * 3;
    for (let canal = 0; canal < 3; canal += 1) pixels[inicio + canal] = cor[canal];
  }
  function retangulo(x, y, comprimento, comprimentoVertical, cor) {
    for (let linha = Math.max(0, y); linha < Math.min(altura, y + comprimentoVertical); linha += 1) {
      for (let coluna = Math.max(0, x); coluna < Math.min(largura, x + comprimento); coluna += 1) pixel(coluna, linha, cor);
    }
  }
  function segmento(x1, y1, x2, y2, espessura, cor) {
    const passos = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= passos; i += 1) {
      const fracao = passos ? i / passos : 0;
      retangulo(Math.round(x1 + (x2 - x1) * fracao), Math.round(y1 + (y2 - y1) * fracao), espessura, espessura, cor);
    }
  }
  for (let y = 0; y < altura; y += 1) {
    const cor = y < 410 ? cores.ceu.map((canal) => Math.min(255, Math.round(canal + y * 0.10))) : cores.solo;
    for (let x = 0; x < largura; x += 1) pixel(x, y, cor);
  }
  retangulo(45, 478, 710, 14, [138, 113, 89]);
  retangulo(95, 200, 435, 240, cores.concreto);
  const corVao = cores.ceu.map((canal) => Math.min(255, canal + 28));
  for (let andar = 0; andar < 3; andar += 1) {
    for (let vao = 0; vao < 4; vao += 1) retangulo(115 + vao * 104, 220 + andar * 76, 80, 55, corVao);
    retangulo(84, 202 + andar * 76, 457, 12, [103, 112, 119]);
  }
  retangulo(84, 430, 457, 22, [108, 116, 121]);
  retangulo(145, 172, 6, 28, [91, 97, 102]);
  retangulo(380, 165, 6, 35, [91, 97, 102]);
  if (variacao < 2) {
    for (const x of [635, 663]) retangulo(x, 95, 6, 355, cores.aco);
    for (let y = 110; y < 425; y += 40) {
      segmento(638, y, 663, y + 35, 3, cores.aco);
      segmento(663, y, 638, y + 35, 3, cores.aco);
    }
    retangulo(435, 91, 310, 9, cores.aco);
    retangulo(620, 58, 70, 33, cores.aco);
    segmento(650, 60, 435, 91, 3, cores.aco);
    segmento(650, 60, 742, 91, 3, cores.aco);
    retangulo(705, 101, 34, 30, [102, 111, 119]);
    retangulo(473 + variacao * 25, 100, 2, 145, [75, 83, 87]);
    retangulo(468 + variacao * 25, 242, 12, 6, [75, 83, 87]);
  } else {
    for (const x of [555, 635, 715]) retangulo(x, 232, 5, 220, cores.aco);
    for (let y = 240; y <= 420; y += 60) {
      retangulo(550, y, 175, 7, cores.aco);
      segmento(558, y + 7, 635, y + 60, 3, cores.aco);
      segmento(638, y + 7, 715, y + 60, 3, cores.aco);
    }
  }
  for (let camada = 0; camada < 3; camada += 1) {
    for (let bloco = 0; bloco < 6 - camada; bloco += 1) retangulo(115 + bloco * 31 + camada * 13, 510 - camada * 20, 28, 17, [179 + variacao * 8, 95, 64]);
  }
  retangulo(435, 506, 155, 15, [114, 120, 124]);
  retangulo(450, 490, 125, 13, [152, 155, 151]);
  retangulo(670, 520, 60, 8, [88, 100, 107]);
  const linhas = Buffer.alloc((largura * 3 + 1) * altura);
  for (let y = 0; y < altura; y += 1) pixels.copy(linhas, y * (largura * 3 + 1) + 1, y * largura * 3, (y + 1) * largura * 3);
  const cabecalho = Buffer.alloc(13);
  cabecalho.writeUInt32BE(largura, 0);
  cabecalho.writeUInt32BE(altura, 4);
  cabecalho[8] = 8;
  cabecalho[9] = 2;
  return Buffer.concat([assinatura, montarChunk('IHDR', cabecalho), montarChunk('IDAT', zlib.deflateSync(linhas, { level: 9 })), montarChunk('IEND', Buffer.alloc(0))]);
}

function validarPng(arquivo) {
  if (!arquivo.subarray(0, 8).equals(assinatura)) throw new Error('Assinatura PNG inválida.');
  let posicao = 8;
  const chunks = [];
  const comprimidos = [];
  while (posicao < arquivo.length) {
    if (posicao + 12 > arquivo.length) throw new Error('Chunk PNG truncado.');
    const tamanho = arquivo.readUInt32BE(posicao);
    const fim = posicao + 12 + tamanho;
    if (fim > arquivo.length) throw new Error('Tamanho de chunk PNG inválido.');
    const tipo = arquivo.toString('ascii', posicao + 4, posicao + 8);
    if (crc32(arquivo.subarray(posicao + 4, fim - 4)) !== arquivo.readUInt32BE(fim - 4)) throw new Error('CRC inválido no chunk ' + tipo + '.');
    const dados = arquivo.subarray(posicao + 8, fim - 4);
    if (tipo === 'IHDR' && (chunks.length || tamanho !== 13 || dados.readUInt32BE(0) !== largura || dados.readUInt32BE(4) !== altura ||
      dados[8] !== 8 || dados[9] !== 2 || dados[10] !== 0 || dados[11] !== 0 || dados[12] !== 0)) throw new Error('IHDR incompatível com as imagens 800x600 RGB.');
    if (tipo === 'IDAT') comprimidos.push(dados);
    if (tipo === 'IEND' && (tamanho !== 0 || fim !== arquivo.length)) throw new Error('IEND inválido ou conteúdo após o fim do PNG.');
    chunks.push(tipo);
    posicao = fim;
  }
  if (chunks.join(',') !== 'IHDR,IDAT,IEND') throw new Error('Sequência de chunks PNG inesperada.');
  const linhas = zlib.inflateSync(Buffer.concat(comprimidos));
  if (linhas.length !== (largura * 3 + 1) * altura) throw new Error('Dados de pixels incompletos.');
  for (let y = 0; y < altura; y += 1) if (linhas[y * (largura * 3 + 1)] !== 0) throw new Error('Filtro de linha PNG inesperado.');
  if (arquivo.length >= 400 * 1024) throw new Error('Imagem deve ter menos de 400 KB.');
  return { largura: arquivo.readUInt32BE(16), altura: arquivo.readUInt32BE(20), tamanhoKb: (arquivo.length / 1024).toFixed(2), chunks: chunks.join('/') };
}

async function principal() {
  await fs.mkdir(pasta, { recursive: true });
  for (const [indice, nome] of nomes.entries()) {
    const imagem = gerarImagem(indice);
    const resultado = validarPng(imagem);
    await fs.writeFile(path.join(pasta, nome), imagem);
    console.log(nome + ' | assinatura PNG OK | IHDR ' + resultado.largura + 'x' + resultado.altura + ' | ' + resultado.tamanhoKb + ' KB | CRC OK: ' + resultado.chunks);
  }
}

module.exports = { nomes, pasta, gerarImagem, validarPng, crc32 };
if (require.main === module) principal().catch(() => { console.error('FALHA: não foi possível gerar ou validar as imagens fictícias.'); process.exitCode = 1; });
