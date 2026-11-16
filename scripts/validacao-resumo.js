const fs = require('node:fs');

const normalizar = (valor) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const formatar = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const media = (valores) => valores.length ? formatar(valores.reduce((a, b) => a + b, 0) / valores.length) : 'sem respostas';

function separarCsv(texto, delimitador) {
  const linhas = [];
  let linha = [];
  let campo = '';
  let estado = 'inicio';
  const guardarCampo = () => { linha.push(campo); campo = ''; estado = 'inicio'; };
  const guardarLinha = () => {
    guardarCampo();
    if (linha.some((item) => item.trim() !== '')) linhas.push(linha);
    linha = [];
  };
  for (let i = 0; i < texto.length; i += 1) {
    const c = texto[i];
    if (estado === 'aspas') {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i += 1; }
      else if (c === '"') estado = 'fechado';
      else campo += c;
    } else if (c === delimitador) guardarCampo();
    else if (c === '\r' || c === '\n') {
      guardarLinha();
      if (c === '\r' && texto[i + 1] === '\n') i += 1;
    } else if (c === '"' && estado === 'inicio') estado = 'aspas';
    else if (estado === 'fechado' || c === '"') throw new Error('Aspas fora de posição no CSV.');
    else { campo += c; estado = 'texto'; }
  }
  if (estado === 'aspas') throw new Error('Campo entre aspas não foi fechado no CSV.');
  guardarLinha();
  if (!linhas.length || linhas[0].length < 2) throw new Error('CSV vazio ou sem colunas separadas.');
  const largura = linhas[0].length;
  const irregular = linhas.findIndex((item) => item.length !== largura);
  if (irregular >= 0) throw new Error('Registro ' + (irregular + 1) + ': quantidade de campos diferente do cabeçalho.');
  return linhas;
}

function lerCsv(arquivo) {
  let texto;
  try { texto = fs.readFileSync(arquivo, 'utf8').replace(/^\uFEFF/, ''); }
  catch { throw new Error('Não foi possível ler o CSV informado. Confira o caminho e a permissão de leitura.'); }
  const tentativas = [',', ';'].map((delimitador) => {
    try { return { delimitador, linhas: separarCsv(texto, delimitador) }; }
    catch (erro) { return { delimitador, erro: erro.message }; }
  });
  const validas = tentativas.filter((item) => item.linhas);
  if (validas.length !== 1) {
    if (validas.length > 1) throw new Error('Delimitador ambíguo: use vírgula ou ponto e vírgula e coloque textos com separadores entre aspas.');
    throw new Error('Formato CSV inválido. Vírgula: ' + tentativas[0].erro + ' Ponto e vírgula: ' + tentativas[1].erro);
  }
  const [cabecalho, ...dados] = validas[0].linhas;
  const titulos = cabecalho.map((item) => item.trim());
  if (titulos.some((item) => !item) || new Set(titulos.map(normalizar)).size !== titulos.length) {
    throw new Error('O cabeçalho precisa ter títulos preenchidos e sem repetição.');
  }
  return { titulos, dados };
}

function localizarColunas(titulos) {
  const colunas = titulos.map((titulo, indice) => ({ titulo, indice })).filter(({ titulo }) =>
    !/^(timestamp|carimbo de data(?:\/hora| e hora)?|data e hora)$/i.test(normalizar(titulo))
  );
  if (colunas.length !== 16) {
    throw new Error('Respostas: esperadas 16 perguntas (3 de perfil, 8 de escala, 1 de recomendação e 4 abertas), além do horário opcional do Forms. Confira o questionario.md.');
  }
  const numeradas = colunas.map((coluna) => ({ ...coluna, numero: coluna.titulo.match(/^([1-8])(?:\s*[.):\-]\s*|\s+|$)/)?.[1] })).filter((item) => item.numero);
  let escalas;
  let modo;
  if (!numeradas.length) {
    escalas = colunas.slice(3, 11);
    modo = 'pela ordem: 3 de perfil, 8 de escala, recomendação, 4 abertas';
  } else {
    if (numeradas.length !== 8 || new Set(numeradas.map((item) => item.numero)).size !== 8) {
      throw new Error('Escalas: numere todos os títulos de 1 a 8, sem repetição, ou retire todos os números e mantenha a ordem do questionário.');
    }
    escalas = numeradas.sort((a, b) => Number(a.numero) - Number(b.numero));
    modo = 'pelos números 1 a 8 no início dos títulos';
  }
  const restantes = colunas.filter((item) => !escalas.some((escala) => escala.indice === item.indice));
  const recomendacoes = restantes.filter(({ titulo }) => /^r1[.\s):\-]/i.test(titulo) || /quanto recomendaria/.test(normalizar(titulo)));
  if (recomendacoes.length > 1) throw new Error('Há mais de uma coluna de recomendação. Use R1 para a nota de 0 a 10.');
  const recomendacao = recomendacoes[0] ?? restantes[3];
  const outras = restantes.filter((item) => item.indice !== recomendacao.indice);
  const abertasNumeradas = outras.map((coluna) => ({ ...coluna, numero: coluna.titulo.match(/^a([1-4])[.\s):\-]/i)?.[1] })).filter((item) => item.numero);
  if (abertasNumeradas.length && (abertasNumeradas.length !== 4 || new Set(abertasNumeradas.map((item) => item.numero)).size !== 4)) {
    throw new Error('Abertas: use A1 a A4 sem repetição ou preserve as quatro perguntas abertas ao final.');
  }
  const abertas = abertasNumeradas.length ? abertasNumeradas.sort((a, b) => Number(a.numero) - Number(b.numero)) : outras.slice(3);
  return { escalas, recomendacao, abertas, modo };
}

function lerNota(valor, minimo, maximo, registro, titulo) {
  const texto = valor.trim();
  if (!texto) return null;
  const numero = Number(texto);
  if (!/^\d+$/.test(texto) || !Number.isInteger(numero) || numero < minimo || numero > maximo) {
    throw new Error('Respostas, registro ' + (registro + 2) + ', coluna "' + titulo + '": use inteiro de ' + minimo + ' a ' + maximo + ' ou deixe vazio.');
  }
  return numero;
}

function resumirRespostas(csv) {
  const { escalas, recomendacao, abertas, modo } = localizarColunas(csv.titulos);
  const valoresEscala = escalas.map((coluna) => csv.dados.map((linha, i) => lerNota(linha[coluna.indice], 1, 5, i, coluna.titulo)).filter((n) => n !== null));
  const notas = csv.dados.map((linha, i) => lerNota(linha[recomendacao.indice], 0, 10, i, recomendacao.titulo)).filter((n) => n !== null);
  const saida = [
    'RESUMO DAS RESPOSTAS',
    'Respondentes: ' + csv.dados.length + ' (linhas não vazias; sem deduplicação por pessoa)',
    'Escalas identificadas ' + modo + '.',
    'Vazios são ignorados por pergunta; a quantidade válida aparece em cada resultado.',
  ];
  escalas.forEach((coluna, i) => {
    const valores = valoresEscala[i];
    const distribuicao = [1, 2, 3, 4, 5].map((n) => n + '=' + valores.filter((valor) => valor === n).length).join(' | ');
    saida.push('\n' + (i + 1) + '. ' + coluna.titulo.replace(/^[1-8][.):\-]?\s*/, ''), 'Média: ' + media(valores) + ' | válidas: ' + valores.length + ' | distribuição: ' + distribuicao);
  });
  const percentual = notas.length ? formatar(100 * notas.filter((nota) => nota >= 9).length / notas.length) + '%' : 'sem respostas';
  saida.push('\nRecomendação (0 a 10): média ' + media(notas) + ' | válidas: ' + notas.length + ' | notas 9 a 10: ' + percentual);
  abertas.forEach((coluna) => {
    saida.push('\n' + coluna.titulo);
    const textos = csv.dados.map((linha) => linha[coluna.indice].trim()).filter(Boolean);
    if (!textos.length) saida.push('(sem respostas)');
    textos.forEach((texto) => saida.push('- ' + texto.replace(/\r\n?/g, '\n').replace(/\n/g, '\n  ')));
  });
  saida.push('\nResumo descritivo; uma amostra pequena não representa todos os profissionais.');
  return saida;
}

function resumirObservacoes(csv) {
  const cabecalho = csv.titulos.map((titulo) => normalizar(titulo).replace(/[\s-]+/g, '_'));
  const campos = ['tarefa', 'concluiu', 'tempo_min'];
  if (cabecalho.length !== 3 || campos.some((campo) => !cabecalho.includes(campo))) {
    throw new Error('Observações: use exatamente as colunas tarefa, concluiu, tempo_min.');
  }
  const indices = campos.map((campo) => cabecalho.indexOf(campo));
  const tarefas = new Map();
  csv.dados.forEach((linha, i) => {
    const [tarefa, concluiu, tempo] = indices.map((indice) => linha[indice].trim());
    const resultado = normalizar(concluiu).replace(/\s+/g, ' ');
    if (!tarefa || !['sim', 'com ajuda', 'nao'].includes(resultado)) {
      throw new Error('Observações, registro ' + (i + 2) + ': preencha tarefa e concluiu com sim, com ajuda ou não.');
    }
    const minutos = tempo === '' ? null : Number(tempo.replace(',', '.'));
    if (minutos !== null && (!/^\d+(?:[.,]\d+)?$/.test(tempo) || !Number.isFinite(minutos))) {
      throw new Error('Observações, registro ' + (i + 2) + ': tempo_min deve ser um número não negativo ou vazio.');
    }
    if (!tarefas.has(tarefa)) tarefas.set(tarefa, { total: 0, semAjuda: 0, tempos: [] });
    const grupo = tarefas.get(tarefa);
    grupo.total += 1;
    if (resultado === 'sim') grupo.semAjuda += 1;
    if (minutos !== null) grupo.tempos.push(minutos);
  });
  const saida = ['\nRESUMO DAS OBSERVAÇÕES', 'Sem ajuda = sim / todas as observações da tarefa. Tempo médio = todos os tempos informados, inclusive interrupções; não é tempo médio de sucesso.'];
  if (!tarefas.size) saida.push('(sem observações)');
  for (const [tarefa, grupo] of tarefas) {
    saida.push(tarefa + ': ' + formatar(100 * grupo.semAjuda / grupo.total) + '% sem ajuda (' + grupo.semAjuda + '/' + grupo.total + ') | tempo médio: ' + media(grupo.tempos) + ' min | tempos válidos: ' + grupo.tempos.length);
  }
  return saida;
}

function executar() {
  const argumentos = process.argv.slice(2);
  if (argumentos.length < 1 || argumentos.length > 2) {
    throw new Error('Uso: npm run validacao:resumo -- <respostas.csv> [observacoes.csv]');
  }
  // Valida os dois arquivos antes de imprimir qualquer resposta.
  const respostas = resumirRespostas(lerCsv(argumentos[0]));
  const observacoes = argumentos[1] ? resumirObservacoes(lerCsv(argumentos[1])) : [];
  console.log([...respostas, ...observacoes].join('\n'));
}

try { executar(); }
catch (erro) { console.error('Erro: ' + erro.message); process.exitCode = 1; }
