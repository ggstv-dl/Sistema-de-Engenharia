const fs = require('node:fs/promises');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const clientesPrevistos = [
  { nome: 'Família Almeida (exemplo)', email: 'familia.almeida.validacao@exemplo.com' },
  { nome: 'Condomínio Vila Verde (exemplo)', email: 'condominio.vila.verde.validacao@exemplo.com' },
];
const projetosPrevistos = [
  { titulo: 'Residencial Vila Verde - Bloco B', cliente: 0, status: 'planejamento', prioridade: 'alta', dias: 30,
    descricao: 'Bloco residencial fictício com estrutura de concreto e fechamento em alvenaria.' },
  { titulo: 'Galpão Logístico Cerrado', cliente: 1, status: 'em_andamento', prioridade: 'media', dias: 60,
    descricao: 'Galpão fictício para armazenamento, com cobertura metálica e piso industrial.' },
  { titulo: 'Reforma da Escola Municipal (exemplo)', cliente: 1, status: 'concluido', prioridade: 'baixa', dias: 120,
    descricao: 'Reforma fictícia de salas, instalações e áreas de circulação, sem vínculo com instituição real.' },
];
const diariosPrevistos = [
  { projeto: 0, dias: 9, atividade: 'Levantamento e locação preliminar (exemplo)', clima: 'ensolarado',
    descricao: 'A equipe levantou as dimensões do terreno e marcou os limites da implantação prevista. As informações foram reunidas para o planejamento do bloco B antes do início dos serviços.',
    maoDeObra: [{ funcao: 'Topógrafos', qtd: 1 }, { funcao: 'Auxiliares de topografia', qtd: 1 }], equipamentos: [{ nome: 'Nível a laser', qtd: 1 }] },
  { projeto: 1, dias: 7, atividade: 'Concretagem dos pilares (exemplo)', clima: 'nublado',
    descricao: 'Os pilares do pavimento térreo receberam concreto após a verificação do cobrimento. A equipe acompanhou o adensamento e iniciou a cura ao fim do serviço.',
    maoDeObra: [{ funcao: 'Pedreiros', qtd: 3 }, { funcao: 'Ajudantes', qtd: 3 }], equipamentos: [{ nome: 'Vibrador de imersão', qtd: 1 }] },
  { projeto: 1, dias: 5, atividade: 'Alvenaria de vedação (exemplo)', clima: 'ensolarado',
    descricao: 'A equipe iniciou a alvenaria de vedação da área de apoio do galpão com conferência de prumo e nível. Os vãos de portas foram preservados conforme a planta de exemplo.',
    maoDeObra: [{ funcao: 'Pedreiros', qtd: 4 }, { funcao: 'Ajudantes', qtd: 2 }], equipamentos: [{ nome: 'Betoneira', qtd: 1 }] },
  { projeto: 1, dias: 4, atividade: 'Interrupção por chuva (exemplo)', clima: 'chuvoso',
    descricao: 'A chuva intensa impediu o serviço externo de preparação do piso do galpão. A equipe protegeu os materiais e organizou a área coberta até a liberação do canteiro.',
    maoDeObra: [{ funcao: 'Ajudantes', qtd: 2 }], equipamentos: [{ nome: 'Bomba de drenagem', qtd: 1 }] },
  { projeto: 2, dias: 2, atividade: 'Passagem de eletrodutos (exemplo)', clima: 'nublado',
    descricao: 'Os eletrodutos foram instalados nas salas da escola fictícia antes do fechamento das paredes. A equipe verificou os percursos e fixou as caixas de passagem.',
    maoDeObra: [{ funcao: 'Eletricistas', qtd: 2 }, { funcao: 'Ajudantes', qtd: 1 }], equipamentos: [{ nome: 'Furadeira', qtd: 1 }] },
  { projeto: 2, dias: 1, atividade: 'Vistoria final da reforma (exemplo)', clima: 'ensolarado',
    descricao: 'A equipe revisou os acabamentos das salas e realizou a limpeza final da reforma fictícia. Os pontos de iluminação foram testados antes da conclusão do serviço.',
    maoDeObra: [{ funcao: 'Pintores', qtd: 2 }, { funcao: 'Eletricistas', qtd: 1 }], equipamentos: [{ nome: 'Escada', qtd: 1 }] },
];
const orcamentosPrevistos = [
  { projeto: 0, nome: 'Estrutura e alvenaria - Vila Verde (exemplo)', descricao: 'Concreto, formas e fechamento do bloco residencial fictício.', valor: 38500.5 },
  { projeto: 1, nome: 'Cobertura e piso - Cerrado (exemplo)', descricao: 'Cobertura metálica e piso do galpão fictício.', valor: 67200 },
];
const nomePdf = 'planta-vila-verde-bloco-b.pdf';

function obterConfiguracao({ exigirTelefone = true, exigirSenha = true } = {}) {
  const urlBase = (process.env.SMOKE_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
  let endereco;
  try { endereco = new URL(urlBase); } catch { throw new Error('SMOKE_BASE_URL inválida; use HTTP ou HTTPS.'); }
  if (!['http:', 'https:'].includes(endereco.protocol) || endereco.username || endereco.password || endereco.search || endereco.hash) {
    throw new Error('SMOKE_BASE_URL deve usar HTTP ou HTTPS, sem credenciais, query ou fragmento.');
  }
  const senha = process.env.VALIDACAO_SENHA || '';
  const telefone = (process.env.VALIDACAO_TELEFONE || '').trim();
  const email = (process.env.VALIDACAO_EMAIL || 'convidado.validacao@exemplo.com').trim().toLowerCase();
  if ((exigirSenha || senha) && (senha.length < 8 || senha.length > 72)) {
    throw new Error('VALIDACAO_SENHA é obrigatória e deve ter de 8 a 72 caracteres; informe-a somente no ambiente do processo.');
  }
  if (exigirTelefone && !/^\d{10,13}$/.test(telefone)) {
    throw new Error('VALIDACAO_TELEFONE é obrigatória e deve conter de 10 a 13 dígitos, sem formatação, do facilitador.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error('VALIDACAO_EMAIL deve ser um e-mail válido.');
  return { urlBase, senha, telefone, email };
}

function motivoRede(erro) {
  if (erro.name === 'TimeoutError') return 'TEMPO_ESGOTADO';
  return ['ECONNREFUSED', 'EPERM', 'EACCES', 'ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT'].includes(erro.cause?.code) ? erro.cause.code : 'REDE_INDISPONIVEL';
}

function criarRequisicao(configuracao) {
  return async function requisitar(metodo, rota, { autenticacao, corpo, status = [200] } = {}) {
    const cabecalhos = {};
    if (autenticacao) cabecalhos.Authorization = 'Bearer ' + autenticacao;
    const formulario = corpo instanceof FormData;
    if (corpo !== undefined && !formulario) cabecalhos['Content-Type'] = 'application/json';
    let resposta;
    try {
      resposta = await fetch(configuracao.urlBase + rota, {
        method: metodo, headers: cabecalhos,
        body: corpo === undefined ? undefined : formulario ? corpo : JSON.stringify(corpo),
        signal: AbortSignal.timeout(10000),
      });
    } catch (erro) {
      throw new Error('NÃO VERIFICADO: API inacessível (' + motivoRede(erro) + '); suba o banco e a API.');
    }
    if (!status.includes(resposta.status)) {
      throw new Error(metodo + ' ' + rota + ': esperado HTTP ' + status.join(' ou ') + ', recebido ' + resposta.status + '. Confira a configuração e as permissões da conta.');
    }
    let dados;
    try { dados = await resposta.json(); } catch { throw new Error(metodo + ' ' + rota + ': resposta JSON inválida.'); }
    return { status: resposta.status, dados };
  };
}

function exigirLista(dados, origem) {
  if (!Array.isArray(dados)) throw new Error(origem + ': era esperada uma lista.');
  return dados;
}

function unico(lista, campo, valor, origem) {
  const encontrados = lista.filter((item) => item[campo] === valor);
  if (encontrados.length > 1) throw new Error(origem + ': há itens duplicados; restaure o snapshot (ver docs/validacao/ambiente.md).');
  return encontrados[0];
}

function exigirId(item, origem) {
  if (typeof item?.id !== 'string' || !item.id) throw new Error(origem + ': identificação ausente na resposta.');
  return item.id;
}

function dataPassada(dias) {
  const data = new Date();
  data.setHours(12, 0, 0, 0);
  data.setDate(data.getDate() - dias);
  return data.toISOString();
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
    pdf += (indice + 1) + ' 0 obj\n' + objeto + '\nendobj\n';
  });
  const inicioTabela = Buffer.byteLength(pdf);
  pdf += 'xref\n0 ' + posicoes.length + '\n0000000000 65535 f \n';
  posicoes.slice(1).forEach((posicao) => { pdf += String(posicao).padStart(10, '0') + ' 00000 n \n'; });
  pdf += 'trailer\n<< /Size ' + posicoes.length + ' /Root 1 0 R >>\nstartxref\n' + inicioTabela + '\n%%EOF\n';
  return new Blob([pdf], { type: 'application/pdf' });
}

function conferirVersoes(arquivos) {
  const versoes = arquivos.filter((arquivo) => String(arquivo.nome).toLowerCase() === nomePdf);
  const numeros = versoes.map((arquivo) => arquivo.versao).sort((a, b) => a - b);
  if (versoes.some((arquivo) => arquivo.nome !== nomePdf) || numeros.length > 2 || numeros.some((numero, i) => numero !== i + 1)) {
    throw new Error('PDF com nomes ou versões inconsistentes; nenhum upload adicional será feito. Restaure o snapshot (ver docs/validacao/ambiente.md).');
  }
  return numeros;
}

async function rotasOrcamentoExistem() {
  try {
    const [indice, rotas] = await Promise.all(['index.js', 'orcamentos.js'].map((nome) => fs.readFile(path.join(raiz, 'src', 'routes', nome), 'utf8')));
    return indice.includes("router.use('/api/projetos', orcamentos.porProjeto)") &&
      indice.includes("router.use('/api/orcamentos', orcamentos.geral)") &&
      /porProjeto\.post\(['"]\/:id\/orcamentos['"]/.test(rotas) &&
      /porProjeto\.get\(['"]\/:id\/orcamentos['"]/.test(rotas) && /geral\.get\(['"]\/['"]/.test(rotas);
  } catch (erro) {
    if (erro.code === 'ENOENT') return false;
    throw new Error('Não foi possível conferir as rotas de orçamento no repositório.');
  }
}

function mensagemSegura(erro) {
  let mensagem = String(erro.message || 'Não foi possível concluir a execução.').replace(/[\r\n|]+/g, ' ');
  for (const valor of [process.env.VALIDACAO_SENHA, process.env.VALIDACAO_TELEFONE]) {
    if (valor) mensagem = mensagem.split(valor).join('[omitido]');
  }
  return mensagem;
}

async function principal() {
  const configuracao = obterConfiguracao();
  const roteiro = await fs.readFile(path.join(raiz, 'docs', 'validacao', 'roteiro-sessao.md'), 'utf8').catch(() => {
    throw new Error('Roteiro obrigatório não encontrado em docs/validacao/roteiro-sessao.md.');
  });
  const reservados = ['Conferência da laje', 'Reparo da laje — teste'];
  if (reservados.some((nome) => !roteiro.includes(nome))) throw new Error('O roteiro mudou; confira os nomes reservados antes de preparar os dados.');
  const nomes = [...projetosPrevistos.map((item) => item.titulo), ...diariosPrevistos.map((item) => item.atividade), ...orcamentosPrevistos.map((item) => item.nome)];
  if (reservados.some((nome) => nomes.includes(nome))) throw new Error('Há colisão entre os dados preparados e os nomes reservados às tarefas.');
  const requisitar = criarRequisicao(configuracao);
  const { dados: saude } = await requisitar('GET', '/api/health');
  if (saude.api !== 'online' || saude.banco !== 'conectado') throw new Error('API ou banco indisponível; suba o banco e a API.');
  const registros = [];
  const registrar = (item, criado) => {
    registros.push({ item, criado });
    console.log('OK ' + item + ': ' + (criado ? 'criado' : 'já existia') + '.');
  };
  const cadastro = await requisitar('POST', '/api/auth/registro', {
    corpo: { nome: 'Engenheiro(a) Convidado(a)', email: configuracao.email, senha: configuracao.senha }, status: [201, 409],
  });
  const { dados: sessao } = await requisitar('POST', '/api/auth/login', { corpo: { email: configuracao.email, senha: configuracao.senha } });
  if (typeof sessao.token !== 'string' || !sessao.token || sessao.usuario?.nome !== 'Engenheiro(a) Convidado(a)') {
    throw new Error('Conta de convidado não confirmada; confira VALIDACAO_EMAIL e VALIDACAO_SENHA.');
  }
  const autenticacao = sessao.token;
  registrar('Conta de convidado', cadastro.status === 201);
  const listar = async (rota, origem) => exigirLista((await requisitar('GET', rota, { autenticacao })).dados, origem);
  const clientes = await listar('/api/clientes', 'Clientes');
  const clientesDaSessao = [];
  for (const previsto of clientesPrevistos) {
    let cliente = unico(clientes, 'email', previsto.email, 'Cliente');
    const criado = !cliente;
    if (!cliente) {
      const resposta = await requisitar('POST', '/api/clientes', {
        autenticacao, corpo: { ...previsto, telefone: configuracao.telefone }, status: [201, 409],
      });
      cliente = resposta.status === 201 ? resposta.dados : unico(await listar('/api/clientes', 'Clientes'), 'email', previsto.email, 'Cliente');
      if (resposta.status === 409) {
        if (!cliente) throw new Error('Cliente em conflito não foi encontrado na listagem.');
        registrar(previsto.nome, false);
      } else registrar(previsto.nome, true);
    } else registrar(previsto.nome, false);
    exigirId(cliente, 'Cliente');
    if (cliente.nome !== previsto.nome || String(cliente.telefone).replace(/\D/g, '') !== configuracao.telefone) {
      throw new Error('Cliente existente diverge do exemplo ou do contato do facilitador; a API não permite editar clientes. Confira o ambiente antes de continuar.');
    }
    clientesDaSessao.push(cliente);
    if (criado) clientes.push(cliente);
  }
  const projetos = await listar('/api/projetos', 'Projetos');
  const projetosDaSessao = [];
  for (const previsto of projetosPrevistos) {
    let projeto = unico(projetos, 'titulo', previsto.titulo, 'Projeto');
    const criado = !projeto;
    if (!projeto) {
      const { cliente, dias, ...campos } = previsto;
      projeto = (await requisitar('POST', '/api/projetos', {
        autenticacao, status: [201],
        corpo: { ...campos, clienteId: clientesDaSessao[cliente].id, localizacao: 'Balsas - MA', dataInicio: dataPassada(dias) },
      })).dados;
      projetos.push(projeto);
    }
    exigirId(projeto, 'Projeto');
    if (projeto.cliente?.id !== clientesDaSessao[previsto.cliente].id || projeto.status !== previsto.status || projeto.prioridade !== previsto.prioridade) {
      throw new Error('Projeto existente foi alterado ou usa outro cliente; restaure o snapshot (ver docs/validacao/ambiente.md).');
    }
    projetosDaSessao.push(projeto);
    registrar(previsto.titulo, criado);
  }
  for (const [indice, projeto] of projetosDaSessao.entries()) {
    const diarios = await listar('/api/diarios?projetoId=' + encodeURIComponent(projeto.id), 'Diários');
    if (diarios.length >= 200) throw new Error('Listagem de diários atingiu o limite de 200; preparação interrompida para evitar duplicação.');
    for (const previsto of diariosPrevistos.filter((item) => item.projeto === indice)) {
      const existente = unico(diarios, 'atividade', previsto.atividade, 'Diário');
      if (!existente) {
        const { projeto: numeroProjeto, dias, ...campos } = previsto;
        const resposta = await requisitar('POST', '/api/rdo/sync', {
          autenticacao, status: [201], corpo: { ...campos, projetoId: projeto.id, data: dataPassada(dias), fotos: [] },
        });
        exigirId(resposta.dados, 'Diário');
        diarios.push(resposta.dados);
      }
      registrar(previsto.atividade, !existente);
    }
  }
  const rotaArquivos = '/api/projetos/' + encodeURIComponent(projetosDaSessao[0].id) + '/arquivos';
  const versoes = conferirVersoes(await listar(rotaArquivos, 'Arquivos'));
  for (const versao of [1, 2]) {
    if (!versoes.includes(versao)) {
      const formulario = new FormData();
      formulario.append('arquivo', criarPdf(), nomePdf);
      const { dados } = await requisitar('POST', rotaArquivos, { autenticacao, corpo: formulario, status: [201] });
      if (dados.nome !== nomePdf || dados.versao !== versao) throw new Error('PDF retornou versão inesperada; nenhum upload adicional será feito.');
    }
    registrar(nomePdf + ', versão ' + versao, !versoes.includes(versao));
  }
  const temOrcamentos = await rotasOrcamentoExistem();
  if (!temOrcamentos) console.log('ATENÇÃO: rotas de orçamento ausentes no código; preparação de orçamentos pulada.');
  for (const previsto of temOrcamentos ? orcamentosPrevistos : []) {
    const rota = '/api/projetos/' + encodeURIComponent(projetosDaSessao[previsto.projeto].id) + '/orcamentos';
    const existentes = await listar(rota, 'Orçamentos');
    const encontrado = unico(existentes, 'nome', previsto.nome, 'Orçamento');
    if (!encontrado) {
      const { projeto, ...corpo } = previsto;
      exigirId((await requisitar('POST', rota, { autenticacao, corpo, status: [201] })).dados, 'Orçamento');
    } else if (encontrado.valor !== previsto.valor) throw new Error('Orçamento existente tem valor divergente; confira os dados da sessão.');
    registrar(previsto.nome, !encontrado);
  }
  const finais = await Promise.all([
    listar('/api/clientes', 'Clientes'), listar('/api/projetos', 'Projetos'), listar('/api/diarios', 'Diários'),
    listar(rotaArquivos, 'Arquivos'), temOrcamentos ? listar('/api/orcamentos', 'Orçamentos') : Promise.resolve([]),
  ]);
  if (conferirVersoes(finais[3]).length !== 2) throw new Error('Não foi possível confirmar as duas versões do PDF.');
  const criados = registros.filter((item) => item.criado).length;
  console.log('\nResumo: ' + criados + ' criado(s); ' + (registros.length - criados) + ' já existia(m).');
  console.log('Contagens finais: ' + finais[0].filter((item) => clientesPrevistos.some((cliente) => cliente.email === item.email)).length +
    ' clientes da sessão (' + finais[0].length + ' globais), ' + finais[1].length + ' projetos, ' + finais[2].length + ' diários, 2 versões do PDF, ' +
    (temOrcamentos ? finais[4].length + ' orçamentos.' : 'orçamentos pulados.'));
  console.log('E-mail da conta de convidado: ' + configuracao.email);
  for (const tela of ['', '/projetos', '/diario', '/orcamentos']) console.log('Tela: http://localhost:5173' + tela);
  console.log('Dados fictícios; execução sequencial não duplica registros e não restaura alterações de ensaio.');
}

module.exports = {
  raiz, clientesPrevistos, projetosPrevistos, diariosPrevistos, orcamentosPrevistos, nomePdf,
  obterConfiguracao, motivoRede, criarRequisicao, exigirLista, unico, conferirVersoes, rotasOrcamentoExistem, mensagemSegura,
};

if (require.main === module) principal().catch((erro) => { console.error('FALHA: ' + mensagemSegura(erro)); process.exitCode = 1; });
