const fs = require('node:fs/promises');
const path = require('node:path');

const urlBase = (process.env.SMOKE_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const raiz = path.join(__dirname, '..');
const itens = [];

function registrar(item, situacao, orientacao) {
  itens.push({ item, situacao, orientacao });
}

async function avaliar(item, executar) {
  try {
    const resultado = await executar();
    registrar(item, resultado.situacao || 'OK', resultado.orientacao);
  } catch (erro) {
    registrar(item, 'FALHA', erro.message);
  }
}

function motivoRede(erro) {
  const codigo = erro.name === 'TimeoutError' ? 'TEMPO_ESGOTADO' : erro.cause?.code;
  return ['TEMPO_ESGOTADO', 'ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'EPERM', 'ETIMEDOUT'].includes(codigo) ? codigo : 'REDE_INDISPONIVEL';
}

async function requisitar(rota, { token, corpo } = {}) {
  const cabecalhos = {};
  if (token) cabecalhos.Authorization = `Bearer ${token}`;
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
  let resposta;
  try {
    resposta = await fetch(`${urlBase}${rota}`, {
      method: corpo === undefined ? 'GET' : 'POST',
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: AbortSignal.timeout(10000),
    });
  } catch (erro) {
    throw new Error(`NÃO VERIFICADO: API inacessível (${motivoRede(erro)}); suba a API e o banco e confira SMOKE_BASE_URL.`);
  }
  if (resposta.status !== 200) {
    const dica = rota === '/api/health' ? 'suba a API e o banco' : 'confira a API e as contas de demonstração';
    throw new Error(`${rota}: HTTP ${resposta.status}; ${dica}.`);
  }
  try {
    return await resposta.json();
  } catch {
    throw new Error(`${rota}: resposta JSON inválida; confira a API.`);
  }
}

async function lerSenhaDemonstracao() {
  const origem = await fs.readFile(path.join(raiz, 'prisma', 'seed.js'), 'utf8');
  const constante = /const\s+SENHA_PADRAO\s*=\s*(['"])([^'"\r\n]*)\1\s*;/.exec(origem);
  if (!constante) throw new Error('Constante SENHA_PADRAO não encontrada em prisma/seed.js; confira os dados de demonstração.');
  return constante[2];
}

async function lerAmbienteFront() {
  const valores = {};
  const arquivos = [];
  for (const nome of ['.env', '.env.local']) {
    let conteudo;
    try {
      conteudo = await fs.readFile(path.join(raiz, 'front-login', nome), 'utf8');
    } catch (erro) {
      if (erro.code === 'ENOENT') continue;
      throw new Error(`Não foi possível ler front-login/${nome}.`);
    }
    arquivos.push(nome);
    for (const linha of conteudo.split(/\r?\n/)) {
      const campo = /^\s*(?:export\s+)?(VITE_USE_MOCK|VITE_API_URL)\s*=\s*(.*?)\s*$/.exec(linha);
      if (!campo) continue;
      let valor = campo[2];
      if (['"', "'"].includes(valor[0]) && valor.lastIndexOf(valor[0]) > 0) {
        valor = valor.slice(1, valor.lastIndexOf(valor[0]));
      } else {
        valor = valor.replace(/\s+#.*$/, '').trim();
      }
      valores[campo[1]] = valor;
    }
  }
  for (const chave of ['VITE_USE_MOCK', 'VITE_API_URL']) {
    if (process.env[chave] !== undefined) valores[chave] = process.env[chave];
  }
  return { valores, arquivos };
}

function exigirLista(dados, origem) {
  if (!Array.isArray(dados)) throw new Error(`${origem}: a API não retornou uma lista.`);
  return dados;
}

async function principal() {
  let apiOnline = false;
  let tokenJoao;
  let tokenMaria;
  let projetosJoao;
  let projetosMaria;
  let projetoDemonstracao;

  await avaliar('API e banco', async () => {
    let endereco;
    try { endereco = new URL(urlBase); } catch { throw new Error('SMOKE_BASE_URL inválida; use uma URL HTTP ou HTTPS.'); }
    if (!['http:', 'https:'].includes(endereco.protocol) || endereco.username || endereco.password || endereco.search || endereco.hash) {
      throw new Error('SMOKE_BASE_URL deve usar HTTP/HTTPS, sem credenciais, query ou fragmento.');
    }
    const dados = await requisitar('/api/health');
    if (dados.api !== 'online' || dados.banco !== 'conectado') throw new Error('API ou banco indisponível; suba a API e o banco.');
    apiOnline = true;
    return { orientacao: 'API online e banco conectado.' };
  });

  for (const [nome, email] of [['João', 'joao@engineer.com'], ['Maria', 'maria@engineer.com']]) {
    if (!apiOnline) {
      registrar(`Login de ${nome}`, 'FALHA', 'NÃO VERIFICADO; suba a API e o banco antes do login.');
      continue;
    }
    await avaliar(`Login de ${nome}`, async () => {
      const senha = await lerSenhaDemonstracao();
      const dados = await requisitar('/api/auth/login', { corpo: { email, senha } });
      if (typeof dados.token !== 'string' || !dados.token) throw new Error(`Login de ${nome} não retornou uma sessão válida.`);
      if (nome === 'João') tokenJoao = dados.token;
      else tokenMaria = dados.token;
      return { orientacao: 'Conta de demonstração autenticada; sessão não exibida.' };
    });
  }

  await avaliar('Front: configuração', async () => {
    const { valores, arquivos } = await lerAmbienteFront();
    if (valores.VITE_USE_MOCK !== 'false') {
      return { situacao: 'ATENÇÃO', orientacao: 'As capturas ficariam com dados simulados. Defina VITE_USE_MOCK=false em front-login/.env.local e reinicie o Vite.' };
    }
    const urlFront = (valores.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
    if (urlFront !== urlBase) return { situacao: 'ATENÇÃO', orientacao: 'VITE_API_URL difere de SMOKE_BASE_URL; alinhe os endereços e reinicie o Vite.' };
    return { orientacao: `VITE_USE_MOCK=false; configuração conferida em ${arquivos.join(' + ') || 'variáveis do processo'}.` };
  });

  await avaliar('Front: http://localhost:5173', async () => {
    let resposta;
    try {
      resposta = await fetch('http://localhost:5173', { signal: AbortSignal.timeout(5000) });
    } catch (erro) {
      return { situacao: 'ATENÇÃO', orientacao: `NÃO VERIFICADO (${motivoRede(erro)}); execute npm run dev em front-login/ e use a porta 5173.` };
    }
    await resposta.body?.cancel();
    if (!resposta.ok) return { situacao: 'ATENÇÃO', orientacao: `Front respondeu HTTP ${resposta.status}; confira o servidor Vite.` };
    return { orientacao: 'Servidor do front respondeu; abra o navegador e entre como João.' };
  });

  if (tokenJoao) {
    await avaliar('Figura 10: dashboard', async () => {
      const dados = await requisitar('/api/dashboard', { token: tokenJoao });
      const valores = ['obrasAtivas', 'diariosPendentes', 'custoTotal'].map((chave) => dados[chave]?.valor);
      if (!valores.every((valor) => typeof valor === 'number' && Number.isFinite(valor))) throw new Error('Dashboard sem os indicadores esperados; confira a API.');
      if (valores.every((valor) => valor === 0)) return { situacao: 'ATENÇÃO', orientacao: 'Todos os indicadores estão zerados; rode npm run prints:preparar antes das capturas.' };
      return { orientacao: 'Indicadores disponíveis. Eficiência nula e progresso vazio fazem parte do backend atual.' };
    });
    await avaliar('Figura 11: projetos de João', async () => {
      projetosJoao = exigirLista(await requisitar('/api/projetos', { token: tokenJoao }), 'Projetos de João');
      const encontrados = projetosJoao.filter((projeto) => projeto.titulo === 'Obra Demonstração TED 03');
      if (projetosJoao.length === 0 || encontrados.length === 0) throw new Error('Projeto de demonstração ausente; rode npm run prints:preparar.');
      if (encontrados.length !== 1) throw new Error('Há projetos de demonstração duplicados; confira os dados antes das capturas.');
      projetoDemonstracao = encontrados[0];
      return { orientacao: `${projetosJoao.length} projeto(s); Obra Demonstração TED 03 encontrada.` };
    });
  } else {
    registrar('Figura 10: dashboard', 'FALHA', 'NÃO VERIFICADO; primeiro resolva o login de João.');
    registrar('Figura 11: projetos de João', 'FALHA', 'NÃO VERIFICADO; primeiro resolva o login de João.');
  }

  if (tokenJoao && projetoDemonstracao) {
    await avaliar('Figura 13: versões do PDF', async () => {
      const arquivos = exigirLista(await requisitar(`/api/projetos/${encodeURIComponent(projetoDemonstracao.id)}/arquivos`, { token: tokenJoao }), 'Arquivos');
      const versoes = arquivos.filter((arquivo) => arquivo.nome === 'planta-demonstracao.pdf').map((arquivo) => arquivo.versao).sort((a, b) => a - b);
      if (versoes.length !== 2 || versoes[0] !== 1 || versoes[1] !== 2) throw new Error('O PDF precisa ter exatamente as versões 1 e 2; rode prints:preparar ou confira os dados inconsistentes.');
      return { orientacao: 'planta-demonstracao.pdf com versões 1 e 2.' };
    });
  } else registrar('Figura 13: versões do PDF', 'FALHA', 'NÃO VERIFICADO; resolva o login de João e prepare o projeto de demonstração.');

  if (tokenMaria) {
    await avaliar('Figura 14: projetos de Maria', async () => {
      projetosMaria = exigirLista(await requisitar('/api/projetos', { token: tokenMaria }), 'Projetos de Maria');
      if (projetosMaria.length === 0) throw new Error('Maria não tem projeto para demonstrar o 404; confira a preparação prévia das contas e projetos do seed.');
      return { orientacao: `${projetosMaria.length} projeto(s) disponível(is) para o teste de acesso negado.` };
    });
  } else registrar('Figura 14: projetos de Maria', 'FALHA', 'NÃO VERIFICADO; primeiro resolva o login de Maria.');

  if (tokenJoao) {
    await avaliar('Projetos e clientes de teste', async () => {
      const clientes = exigirLista(await requisitar('/api/clientes', { token: tokenJoao }), 'Clientes');
      const projetos = [...new Map([...(projetosJoao || []), ...(projetosMaria || [])].map((projeto) => [projeto.id, projeto])).values()];
      const quantidadeProjetos = projetos.filter((projeto) => /smoke|teste/i.test(projeto.titulo)).length;
      const quantidadeClientes = clientes.filter((cliente) => /smoke|teste/i.test(cliente.nome)).length;
      const contagem = `${quantidadeProjetos} projeto(s) de João/Maria e ${quantidadeClientes} cliente(s) global(is) com smoke/teste no nome.`;
      if (!projetosJoao || !projetosMaria) return { situacao: 'ATENÇÃO', orientacao: `${contagem} Contagem parcial; resolva as consultas das duas contas.` };
      if (quantidadeProjetos + quantidadeClientes > 10) return { situacao: 'ATENÇÃO', orientacao: `${contagem} Considere o reset limpo opcional e destrutivo descrito em docs/ted03-prints.md.` };
      return { orientacao: contagem };
    });
  } else registrar('Projetos e clientes de teste', 'ATENÇÃO', 'NÃO VERIFICADO; contagem indisponível sem o login de João.');

  console.log('Item | Situação (OK/ATENÇÃO/FALHA) | O que fazer');
  for (const item of itens) console.log(`${item.item} | ${item.situacao} | ${item.orientacao}`);
  const falhas = itens.filter((item) => item.situacao === 'FALHA').length;
  console.log(`\nResumo: ${itens.filter((item) => item.situacao === 'OK').length} OK; ${itens.filter((item) => item.situacao === 'ATENÇÃO').length} ATENÇÃO; ${falhas} FALHA.`);
  process.exitCode = falhas ? 1 : 0;
}

principal().catch(() => {
  console.error('Item | Situação (OK/ATENÇÃO/FALHA) | O que fazer');
  console.error('Verificação | FALHA | Não foi possível concluir a verificação; confira os arquivos locais e suba a API e o banco.');
  process.exitCode = 1;
});
