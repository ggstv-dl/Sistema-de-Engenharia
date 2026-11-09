const fs = require('node:fs/promises');
const path = require('node:path');

const urlBase = (process.env.SMOKE_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const tituloProjeto = 'Obra Demonstração TED 03';
const nomeArquivo = 'planta-demonstracao.pdf';
const atividadeDiario = 'Concretagem da laje (demonstração TED 03)';
const resumo = [];

function validarUrlBase() {
  let endereco;
  try {
    endereco = new URL(urlBase);
  } catch {
    throw new Error('SMOKE_BASE_URL deve ser uma URL HTTP ou HTTPS válida.');
  }
  if (!['http:', 'https:'].includes(endereco.protocol) || endereco.username || endereco.password || endereco.search || endereco.hash) {
    throw new Error('SMOKE_BASE_URL deve usar HTTP/HTTPS, sem credenciais, query ou fragmento.');
  }
}

async function lerSenhaDemonstracao() {
  const origem = await fs.readFile(path.join(__dirname, '..', 'prisma', 'seed.js'), 'utf8');
  const constante = /const\s+SENHA_PADRAO\s*=\s*(['"])([^'"\r\n]*)\1\s*;/.exec(origem);
  if (!constante) throw new Error('Constante SENHA_PADRAO não encontrada em prisma/seed.js. Nenhum seed foi executado.');
  return constante[2];
}

async function requisitar(metodo, rota, { token, corpo, status = [200] } = {}) {
  const cabecalhos = {};
  if (token) cabecalhos.Authorization = `Bearer ${token}`;
  const formulario = corpo instanceof FormData;
  if (corpo !== undefined && !formulario) cabecalhos['Content-Type'] = 'application/json';

  let resposta;
  try {
    resposta = await fetch(`${urlBase}${rota}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : formulario ? corpo : JSON.stringify(corpo),
      signal: AbortSignal.timeout(10000),
    });
  } catch (erro) {
    const codigo = erro.name === 'TimeoutError' ? 'TEMPO_ESGOTADO' : erro.cause?.code;
    const motivo = ['TEMPO_ESGOTADO', 'ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'EPERM', 'ETIMEDOUT'].includes(codigo) ? codigo : 'REDE_INDISPONIVEL';
    throw new Error(`API inacessível (${motivo}); suba a API e o banco e confira SMOKE_BASE_URL.`);
  }
  if (!status.includes(resposta.status)) {
    throw new Error(`${metodo} ${rota}: esperado HTTP ${status.join(' ou ')}, recebido ${resposta.status}. Confira a API e os usuários de demonstração.`);
  }
  try {
    return { status: resposta.status, dados: await resposta.json() };
  } catch {
    throw new Error(`${metodo} ${rota}: a resposta não contém JSON válido.`);
  }
}

function exigirLista(dados, origem) {
  if (!Array.isArray(dados)) throw new Error(`${origem}: era esperada uma lista.`);
  return dados;
}

function exigirId(registro, origem) {
  if (typeof registro?.id !== 'string' || !registro.id) throw new Error(`${origem}: identificação não recebida.`);
  return registro.id;
}

function registrar(item, criado) {
  resumo.push({ item, criado });
  console.log(`OK ${item}: ${criado ? 'criado' : 'já existia'}.`);
}

function criarPdf() {
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>',
  ];
  let pdf = '%PDF-1.4\n';
  const posicoes = [0];
  objetos.forEach((objeto, indice) => {
    posicoes.push(Buffer.byteLength(pdf));
    pdf += `${indice + 1} 0 obj\n${objeto}\nendobj\n`;
  });
  const inicioTabela = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${posicoes.length}\n0000000000 65535 f \n`;
  posicoes.slice(1).forEach((posicao) => { pdf += `${String(posicao).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${posicoes.length} /Root 1 0 R >>\nstartxref\n${inicioTabela}\n%%EOF\n`;
  return new Blob([pdf], { type: 'application/pdf' });
}

function conferirVersoes(arquivos) {
  const encontrados = arquivos.filter((arquivo) => typeof arquivo.nome === 'string' && arquivo.nome.toLowerCase() === nomeArquivo);
  const versoes = encontrados.map((arquivo) => arquivo.versao).sort((a, b) => a - b);
  if (encontrados.some((arquivo) => arquivo.nome !== nomeArquivo) || versoes.length > 2 || versoes.some((versao, indice) => versao !== indice + 1)) {
    throw new Error('O PDF de demonstração tem nomes ou versões inconsistentes. Nenhum upload adicional será feito; confira os dados antes dos prints.');
  }
  return versoes;
}

async function principal() {
  validarUrlBase();
  const { dados: saude } = await requisitar('GET', '/api/health');
  if (saude.api !== 'online' || saude.banco !== 'conectado') throw new Error('API ou banco indisponível; suba a API e o banco.');
  const senha = await lerSenhaDemonstracao();
  const { dados: sessao } = await requisitar('POST', '/api/auth/login', { corpo: { email: 'joao@engineer.com', senha } });
  if (typeof sessao.token !== 'string' || !sessao.token) throw new Error('Login de João não retornou uma sessão válida.');
  const token = sessao.token;
  console.log('OK Login de João.');

  const emailCliente = 'ted03.demo@exemplo.com';
  const respostaCliente = await requisitar('POST', '/api/clientes', {
    token,
    corpo: { nome: 'Cliente Demonstração TED 03', email: emailCliente, telefone: '(11) 98888-0000' },
    status: [201, 409],
  });
  let cliente = respostaCliente.dados;
  if (respostaCliente.status === 409) {
    const { dados } = await requisitar('GET', '/api/clientes', { token });
    cliente = exigirLista(dados, 'Clientes').find((item) => item.email === emailCliente);
  }
  const clienteId = exigirId(cliente, 'Cliente de demonstração');
  registrar('Cliente Demonstração TED 03', respostaCliente.status === 201);

  const { dados: dadosProjetos } = await requisitar('GET', '/api/projetos', { token });
  const existentes = exigirLista(dadosProjetos, 'Projetos').filter((projeto) => projeto.titulo === tituloProjeto);
  if (existentes.length > 1) throw new Error('Há mais de um projeto com o título de demonstração. Confira os dados antes de preparar os prints.');
  let projeto = existentes[0];
  const agora = new Date();
  const hoje = [agora.getFullYear(), String(agora.getMonth() + 1).padStart(2, '0'), String(agora.getDate()).padStart(2, '0')].join('-');
  if (!projeto) {
    const { dados } = await requisitar('POST', '/api/projetos', {
      token,
      status: [201],
      corpo: { titulo: tituloProjeto, status: 'em_andamento', prioridade: 'alta', localizacao: 'Balsas - MA', dataInicio: hoje, clienteId },
    });
    projeto = dados;
  }
  const projetoId = exigirId(projeto, 'Projeto de demonstração');
  registrar(tituloProjeto, existentes.length === 0);

  const rotaArquivos = `/api/projetos/${encodeURIComponent(projetoId)}/arquivos`;
  const { dados: dadosArquivos } = await requisitar('GET', rotaArquivos, { token });
  const versoes = conferirVersoes(exigirLista(dadosArquivos, 'Arquivos'));
  for (const versao of [1, 2]) {
    if (versoes.includes(versao)) {
      registrar(`${nomeArquivo}, versão ${versao}`, false);
      continue;
    }
    const formulario = new FormData();
    formulario.append('arquivo', criarPdf(), nomeArquivo);
    const { dados: arquivo } = await requisitar('POST', rotaArquivos, { token, corpo: formulario, status: [201] });
    if (arquivo.nome !== nomeArquivo || arquivo.versao !== versao) throw new Error('O upload retornou uma versão inesperada. Nenhum outro upload será feito.');
    registrar(`${nomeArquivo}, versão ${versao}`, true);
  }
  const { dados: arquivosFinais } = await requisitar('GET', rotaArquivos, { token });
  if (conferirVersoes(exigirLista(arquivosFinais, 'Arquivos')).length !== 2) throw new Error('Não foi possível confirmar as versões 1 e 2 do PDF.');

  const { dados: dadosDiarios } = await requisitar('GET', `/api/diarios?projetoId=${encodeURIComponent(projetoId)}`, { token });
  const diarioExistente = exigirLista(dadosDiarios, 'Diários').find((diario) => diario.atividade === atividadeDiario);
  if (!diarioExistente) {
    const { dados: diario } = await requisitar('POST', '/api/rdo/sync', {
      token,
      status: [201],
      corpo: {
        projetoId,
        data: new Date().toISOString(),
        atividade: atividadeDiario,
        clima: 'Ensolarado',
        descricao: 'A equipe realizou a concretagem da laje após a conferência das formas e da armação. O adensamento e o início da cura foram acompanhados pelo responsável técnico, sem intercorrências.',
        maoDeObra: [{ funcao: 'Pedreiro', qtd: 4 }, { funcao: 'Servente', qtd: 3 }],
        equipamentos: [{ nome: 'Betoneira', qtd: 1 }],
        fotos: [],
      },
    });
    exigirId(diario, 'Diário de demonstração');
  }
  registrar(atividadeDiario, !diarioExistente);

  const criados = resumo.filter((item) => item.criado).length;
  console.log(`\nResumo: ${criados} criado(s); ${resumo.length - criados} já existia(m).`);
  console.log(`Projeto: ${projetoId}`);
  console.log('Dashboard: http://localhost:5173/');
  console.log('Projetos: http://localhost:5173/projetos');
  console.log('Diário: http://localhost:5173/diario');
  console.log('Ordem: prints:check → Figuras 10 e 11 no navegador → Figuras 13 e 14 no Postman → Figura 12 por último.');
}

principal().catch((erro) => {
  console.error(`FALHA na preparação: ${erro.message}`);
  process.exitCode = 1;
});
