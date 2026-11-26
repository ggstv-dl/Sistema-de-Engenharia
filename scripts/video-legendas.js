const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const limiteLinha = 42;
const duracaoMinima = 1200;
const duracaoMaxima = 6000;
const pausaEntreCenas = 600;

function lerOpcoes(argumentos) {
  const opcoes = { ppm: 140, deslocamento: 0 };
  const usadas = new Set();
  for (let i = 0; i < argumentos.length; i += 2) {
    const nome = argumentos[i];
    if (!['--ppm', '--deslocamento'].includes(nome) || usadas.has(nome)) {
      throw new Error('Use apenas --ppm <número> e --deslocamento <segundos>, sem repetir opções.');
    }
    const entrada = argumentos[i + 1];
    if (!entrada || !/^[+-]?\d+(?:\.\d+)?$/.test(entrada)) {
      throw new Error('Informe um número válido depois de ' + nome + '.');
    }
    const valor = Number(entrada);
    if (!Number.isFinite(valor)) throw new Error('O número informado precisa ser finito.');
    opcoes[nome === '--ppm' ? 'ppm' : 'deslocamento'] = valor;
    usadas.add(nome);
  }
  if (opcoes.ppm <= 0) throw new Error('--ppm precisa ser maior que zero.');
  if (opcoes.deslocamento < 0) {
    throw new Error('--deslocamento não pode produzir tempos negativos; use zero ou um valor positivo.');
  }
  return opcoes;
}

function lerCenas(conteudo) {
  const texto = conteudo.replace(/^\uFEFF/, '');
  const cabecalhos = [...texto.matchAll(/^## Cena (\d+) - (.+)\r?$/gm)];
  if (!cabecalhos.length) throw new Error('Nenhuma cena encontrada. Use ## Cena N - Título.');
  return cabecalhos.map((cabecalho, indice) => {
    const numero = Number(cabecalho[1]);
    if (numero !== indice + 1) throw new Error('Numere as cenas em sequência, começando pela Cena 1.');
    const fim = cabecalhos[indice + 1]?.index ?? texto.length;
    const fala = texto.slice(cabecalho.index + cabecalho[0].length, fim).trim();
    if (!fala) throw new Error('A Cena ' + numero + ' está sem texto de narração.');
    if (/^#/m.test(fala) || /\x60{3}/.test(fala)) {
      throw new Error('A Cena ' + numero + ' deve conter somente parágrafos de fala.');
    }
    return { numero, titulo: cabecalho[2].trim(), texto: fala.replace(/\s+/g, ' ') };
  });
}

function quebrarLinhas(texto) {
  const linhas = [];
  let atual = '';
  for (let palavra of texto.split(/\s+/)) {
    if (Array.from(palavra).length > limiteLinha) {
      if (atual) { linhas.push(atual); atual = ''; }
      const caracteres = Array.from(palavra);
      while (caracteres.length > limiteLinha) linhas.push(caracteres.splice(0, limiteLinha).join(''));
      palavra = caracteres.join('');
    }
    const tentativa = atual ? atual + ' ' + palavra : palavra;
    if (Array.from(tentativa).length <= limiteLinha) {
      atual = tentativa;
    } else {
      if (atual) linhas.push(atual);
      atual = palavra;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function separarLegendas(texto, ppm) {
  const palavras = texto.split(/\s+/);
  const resultado = [];
  let inicio = 0;
  while (inicio < palavras.length) {
    let fim = inicio;
    let fimFrase = -1;
    for (let i = inicio; i < palavras.length; i++) {
      const trecho = palavras.slice(inicio, i + 1).join(' ');
      const duracao = (i - inicio + 1) * 60000 / ppm;
      if (duracao > duracaoMaxima || quebrarLinhas(trecho).length > 2) break;
      fim = i + 1;
      if (/[.!?][)"'\u201d\u2019\]]*$/.test(palavras[i]) && duracao >= duracaoMinima) fimFrase = fim;
    }
    if (fim === inicio) {
      throw new Error('Não foi possível legendar uma palavra em até duas linhas e seis segundos; revise o texto ou --ppm.');
    }
    if (fim < palavras.length && fimFrase > inicio) fim = fimFrase;
    const trecho = palavras.slice(inicio, fim).join(' ');
    resultado.push({
      linhas: quebrarLinhas(trecho),
      duracao: Math.max(duracaoMinima, Math.round((fim - inicio) * 60000 / ppm)),
    });
    inicio = fim;
  }
  return resultado;
}

function formatarTempo(ms) {
  if (!Number.isSafeInteger(ms) || ms < 0) throw new Error('Tempo de deslocamento inválido ou fora do limite.');
  const horas = Math.floor(ms / 3600000);
  const minutos = Math.floor(ms / 60000) % 60;
  const segundos = Math.floor(ms / 1000) % 60;
  const milissegundos = ms % 1000;
  const preencher = (n, tamanho = 2) => String(n).padStart(tamanho, '0');
  return preencher(horas) + ':' + preencher(minutos) + ':' + preencher(segundos) + ',' + preencher(milissegundos, 3);
}

function gerarLegendas(cenas, { ppm = 140, deslocamento = 0 } = {}) {
  if (!cenas.length) throw new Error('Nenhuma cena encontrada.');
  if (!Number.isFinite(ppm) || ppm <= 0 || !Number.isFinite(deslocamento) || deslocamento < 0) {
    throw new Error('Ritmo ou deslocamento inválido.');
  }
  const deslocamentoMs = Math.round(deslocamento * 1000);
  const legendas = [];
  const temposCenas = [];
  let relogio = 0;
  for (const [indice, cena] of cenas.entries()) {
    if (!cena.texto?.trim()) throw new Error('A Cena ' + cena.numero + ' está sem texto.');
    if (indice) relogio += pausaEntreCenas;
    const inicio = relogio;
    for (const bloco of separarLegendas(cena.texto, ppm)) {
      legendas.push({
        indice: legendas.length + 1,
        inicio: relogio + deslocamentoMs,
        fim: relogio + bloco.duracao + deslocamentoMs,
        linhas: bloco.linhas,
      });
      relogio += bloco.duracao;
    }
    temposCenas.push({ numero: cena.numero, titulo: cena.titulo, inicio, fim: relogio });
  }
  if (relogio < 180000 || relogio > 300000) {
    throw new Error('A duração calculada foi ' + formatarTempo(relogio) + '; ajuste a fala ou --ppm para ficar entre 3:00 e 5:00.');
  }
  const srt = legendas.map((legenda) =>
    legenda.indice + '\n' +
    formatarTempo(legenda.inicio) + ' --> ' + formatarTempo(legenda.fim) + '\n' +
    legenda.linhas.join('\n') + '\n'
  ).join('\n') + '\n';
  return { srt, legendas, temposCenas, duracao: relogio };
}

function principal() {
  const opcoes = lerOpcoes(process.argv.slice(2));
  let origem;
  try {
    origem = fs.readFileSync(path.join(raiz, 'docs/video/narracao.md'), 'utf8');
  } catch {
    throw new Error('Não foi possível ler docs/video/narracao.md.');
  }
  const cenas = lerCenas(origem);
  const resultado = gerarLegendas(cenas, opcoes);
  try {
    fs.writeFileSync(path.join(raiz, 'docs/video/legendas.srt'), resultado.srt);
  } catch {
    throw new Error('Não foi possível salvar docs/video/legendas.srt.');
  }
  for (const cena of resultado.temposCenas) {
    console.log('Cena ' + cena.numero + ' — ' + cena.titulo + ': ' +
      formatarTempo(cena.inicio) + '–' + formatarTempo(cena.fim) +
      ' (' + ((cena.fim - cena.inicio) / 1000).toFixed(3) + ' s).');
  }
  console.log('Total com pausas: ' + formatarTempo(resultado.duracao) + '.');
  console.log('Legendas: ' + resultado.legendas.length + '; ritmo: ' + opcoes.ppm + ' palavras/min; deslocamento: ' + opcoes.deslocamento + ' s.');
  console.log('Arquivo: docs/video/legendas.srt. Ajuste os tempos após o ensaio; a estimativa não mede a gravação.');
  if (/\[(?:preencher|equipe:)/i.test(origem)) {
    console.log('ATENÇÃO: substitua os campos entre colchetes antes de gravar e gere as legendas novamente.');
  }
}

if (require.main === module) {
  try {
    principal();
  } catch (erro) {
    console.error('Não foi possível gerar as legendas: ' + erro.message);
    process.exitCode = 1;
  }
}

module.exports = { lerOpcoes, lerCenas, quebrarLinhas, separarLegendas, formatarTempo, gerarLegendas };
