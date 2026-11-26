const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');

function lerAmbienteFront(raizProjeto, ambiente) {
  const valores = {};
  for (const nome of ['.env', '.env.local', '.env.development', '.env.development.local']) {
    const arquivo = path.join(raizProjeto, 'front-login', nome);
    if (!fs.existsSync(arquivo)) continue;
    for (const linha of fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
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
    if (ambiente[chave] !== undefined) valores[chave] = ambiente[chave];
  }
  return valores;
}

function temExecutavel(nome, caminho = process.env.PATH || '') {
  const extensoes = process.platform === 'win32' ? ['', '.exe', '.cmd', '.bat'] : [''];
  return caminho.split(path.delimiter).filter(Boolean).some((pasta) =>
    extensoes.some((extensao) => {
      try {
        const arquivo = path.join(pasta, nome + extensao);
        fs.accessSync(arquivo, fs.constants.X_OK);
        return fs.statSync(arquivo).isFile();
      } catch {
        return false;
      }
    })
  );
}

function rotaOrcamentosExiste(raizProjeto) {
  try {
    const indice = fs.readFileSync(path.join(raizProjeto, 'src/routes/index.js'), 'utf8');
    const rotas = fs.readFileSync(path.join(raizProjeto, 'src/routes/orcamentos.js'), 'utf8');
    return /router\.use\(\s*['"]\/api\/orcamentos['"]/.test(indice) &&
      /geral\.get\(\s*['"]\/['"]/.test(rotas);
  } catch {
    return false;
  }
}

function motivoRede(erro) {
  if (erro.name === 'TimeoutError' || erro.name === 'AbortError') return 'TEMPO_ESGOTADO';
  const codigo = erro.cause?.code;
  return ['EPERM', 'ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'ECONNRESET'].includes(codigo)
    ? codigo : 'REDE_INDISPONIVEL';
}

async function verificar({ fetchImpl = fetch, ambiente = process.env, raizProjeto = raiz } = {}) {
  const itens = [];
  const registrar = (item, situacao, orientacao) => itens.push({ item, situacao, orientacao });
  let base;
  try {
    const endereco = new URL(ambiente.SMOKE_BASE_URL || 'http://localhost:3000');
    if (!['http:', 'https:'].includes(endereco.protocol) || endereco.username ||
      endereco.password || endereco.search || endereco.hash) throw new Error();
    base = endereco.href.replace(/\/+$/, '');
  } catch {
    registrar('Endereço da API', 'FALHA', 'Configure SMOKE_BASE_URL como HTTP/HTTPS, sem credenciais, query ou fragmento.');
  }

  async function requisitar(rota, { sessao, corpo } = {}) {
    const headers = {};
    if (sessao) headers.Authorization = 'Bearer ' + sessao;
    if (corpo !== undefined) headers['Content-Type'] = 'application/json';
    let resposta;
    try {
      resposta = await fetchImpl(base + rota, {
        method: corpo === undefined ? 'GET' : 'POST',
        headers,
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
        signal: AbortSignal.timeout(6000),
      });
    } catch (erro) {
      throw new Error('NÃO VERIFICADO: conexão indisponível (' + motivoRede(erro) + ').');
    }
    if (!resposta.ok) throw new Error('NÃO VERIFICADO: HTTP ' + resposta.status + '.');
    try {
      return await resposta.json();
    } catch {
      throw new Error('NÃO VERIFICADO: resposta JSON inválida.');
    }
  }

  let apiOnline = false;
  if (base) {
    try {
      const dados = await requisitar('/api/health');
      if (dados.api !== 'online' || dados.banco !== 'conectado') {
        throw new Error('NÃO VERIFICADO: health não confirmou API online e banco conectado.');
      }
      apiOnline = true;
      registrar('GET /api/health', 'OK', 'API online e banco conectado.');
    } catch (erro) {
      registrar('GET /api/health', 'FALHA', erro.message + ' suba o banco e a API e confira a configuração.');
    }
  }

  let sessao;
  if (!ambiente.VALIDACAO_EMAIL || !ambiente.VALIDACAO_SENHA) {
    registrar('Login de demonstração', 'ATENÇÃO', 'Defina VALIDACAO_EMAIL e VALIDACAO_SENHA no terminal, sem expor os valores.');
  } else if (!apiOnline) {
    registrar('Login de demonstração', 'ATENÇÃO', 'NÃO VERIFICADO: depende da API; suba o banco e a API.');
  } else {
    try {
      const dados = await requisitar('/api/auth/login', {
        corpo: { email: ambiente.VALIDACAO_EMAIL, senha: ambiente.VALIDACAO_SENHA },
      });
      if (typeof dados.token !== 'string' || !dados.token) {
        throw new Error('NÃO VERIFICADO: autenticação sem sessão válida.');
      }
      sessao = dados.token;
      registrar('Login de demonstração', 'OK', 'Autenticação confirmada; credenciais e sessão não exibidas.');
    } catch (erro) {
      registrar('Login de demonstração', 'FALHA', erro.message + ' Confira as variáveis da conta fictícia.');
    }
  }

  if (sessao) {
    try {
      const dados = await requisitar('/api/dashboard', { sessao });
      const indicadores = [dados.obrasAtivas?.valor, dados.diariosPendentes?.valor, dados.custoTotal?.valor];
      if (!indicadores.every((valor) => typeof valor === 'number' && Number.isFinite(valor)) ||
        !Array.isArray(dados.atividades)) {
        throw new Error('NÃO VERIFICADO: formato do painel diferente dos indicadores implementados.');
      }
      const vazio = indicadores.every((valor) => valor === 0) && !dados.atividades.length;
      registrar('Painel: GET /api/dashboard', vazio ? 'ATENÇÃO' : 'OK',
        vazio ? 'Painel sem registros; prepare dados fictícios antes da filmagem.' :
          'Indicadores recebidos; eficiência e progresso calculados continuam fora do vídeo.');
    } catch (erro) {
      registrar('Painel: GET /api/dashboard', 'FALHA', erro.message + ' Confira a API.');
    }
  } else {
    registrar('Painel: GET /api/dashboard', 'ATENÇÃO', 'NÃO VERIFICADO: autenticação necessária.');
  }

  const listas = [
    ['Projetos', '/api/projetos'],
    ['Diários', '/api/diarios'],
  ];
  const temOrcamentos = rotaOrcamentosExiste(raizProjeto);
  if (temOrcamentos) listas.push(['Orçamentos', '/api/orcamentos']);
  for (const [nome, rota] of listas) {
    if (!sessao) {
      registrar(nome, 'ATENÇÃO', 'NÃO VERIFICADO: autenticação necessária para consultar ' + rota + '.');
      continue;
    }
    try {
      const dados = await requisitar(rota, { sessao });
      if (!Array.isArray(dados)) throw new Error('NÃO VERIFICADO: resposta não é uma lista.');
      registrar(nome, dados.length ? 'OK' : 'FALHA', dados.length ?
        'Encontrados: ' + dados.length + '; confira manualmente se todos os dados visíveis são fictícios.' :
        'Nenhum registro encontrado; prepare ao menos um exemplo pela tela antes de filmar.');
    } catch (erro) {
      registrar(nome, 'FALHA', erro.message + ' Confira a rota e a conta de demonstração.');
    }
  }
  if (!temOrcamentos) {
    registrar('Orçamentos', 'ATENÇÃO', 'Rota não identificada no código; mantenha a cena fora do vídeo se não estiver implementada.');
  }

  try {
    const resposta = await fetchImpl('http://localhost:5173', { signal: AbortSignal.timeout(6000) });
    registrar('Front: http://localhost:5173', resposta.ok ? 'OK' : 'FALHA',
      resposta.ok ? 'Servidor respondeu; confira as telas no navegador.' : 'HTTP ' + resposta.status + '; inicie o front.');
  } catch (erro) {
    registrar('Front: http://localhost:5173', 'FALHA',
      'NÃO VERIFICADO: conexão indisponível (' + motivoRede(erro) + '); inicie o front na porta 5173.');
  }

  try {
    const configuracao = lerAmbienteFront(raizProjeto, ambiente);
    registrar('Modo do front', configuracao.VITE_USE_MOCK === 'false' ? 'OK' : 'ATENÇÃO',
      configuracao.VITE_USE_MOCK === 'false' ? 'VITE_USE_MOCK=false na configuração efetiva lida.' :
        'Defina VITE_USE_MOCK=false em front-login/.env.local ou .env e reinicie o Vite.');
    if (configuracao.VITE_API_URL && base) {
      registrar('API configurada no front', configuracao.VITE_API_URL.replace(/\/+$/, '') === base ? 'OK' : 'ATENÇÃO',
        configuracao.VITE_API_URL.replace(/\/+$/, '') === base ? 'Endereço coerente com a API consultada.' :
          'Confira VITE_API_URL e SMOKE_BASE_URL; os endereços divergem.');
    }
  } catch {
    registrar('Modo do front', 'ATENÇÃO', 'Não foi possível ler a configuração; confira .env.local e .env sem projetá-los.');
  }

  for (const nome of ['narracao.md', 'legendas.srt']) {
    let presente = false;
    try { presente = fs.statSync(path.join(raizProjeto, 'docs/video', nome)).size > 0; } catch {}
    registrar('Arquivo ' + nome, presente ? 'OK' : 'FALHA',
      presente ? 'Arquivo encontrado e não vazio.' :
        nome === 'legendas.srt' ? 'Execute npm run video:legendas após revisar a narração.' : 'Prepare docs/video/narracao.md.');
  }

  for (const programa of ['ffmpeg', 'ffprobe']) {
    const presente = temExecutavel(programa, ambiente.PATH || '');
    registrar(programa + ' no PATH', presente ? 'OK' : 'ATENÇÃO',
      presente ? 'Executável disponível; verificação informativa.' :
        'Executável não encontrado; disponibilize-o no computador de gravação se usar exportação ou conferência por terminal.');
  }
  return itens;
}

async function principal() {
  const itens = await verificar();
  console.log('Item | Situação (OK / ATENÇÃO / FALHA) | O que fazer');
  for (const item of itens) console.log(item.item + ' | ' + item.situacao + ' | ' + item.orientacao);
  const contar = (situacao) => itens.filter((item) => item.situacao === situacao).length;
  console.log('Resumo: ' + contar('OK') + ' OK; ' + contar('ATENÇÃO') + ' ATENÇÃO; ' + contar('FALHA') + ' FALHA.');
  if (contar('FALHA')) process.exitCode = 1;
}

if (require.main === module) {
  principal().catch(() => {
    console.error('FALHA: não foi possível concluir a verificação; confira os arquivos e a configuração, sem expor dados de acesso.');
    process.exitCode = 1;
  });
}

module.exports = { lerAmbienteFront, temExecutavel, rotaOrcamentosExiste, motivoRede, verificar };
