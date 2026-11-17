const fs = require('node:fs/promises');
const path = require('node:path');
const {
  raiz, clientesPrevistos, projetosPrevistos, diariosPrevistos, orcamentosPrevistos, nomePdf,
  obterConfiguracao, motivoRede, criarRequisicao, exigirLista, unico, conferirVersoes, rotasOrcamentoExistem, mensagemSegura,
} = require('./validacao-preparar');
const { nomes: fotos, pasta: pastaFotos, validarPng } = require('./validacao-fotos');

const itens = [];
const orientacaoSnapshot = 'sobra de ensaio: restaure o snapshot (ver docs/validacao/ambiente.md)';

function registrar(item, situacao, orientacao) {
  itens.push({ item, situacao, orientacao: mensagemSegura({ message: orientacao }) });
}

async function avaliar(item, executar) {
  try {
    const resultado = await executar();
    registrar(item, resultado?.situacao || 'OK', resultado?.orientacao || 'Conferido.');
  } catch (erro) {
    registrar(item, 'FALHA', erro.message);
  }
}

function conferirContagem(item, quantidade, prevista) {
  if (quantidade < prevista) registrar(item, 'FALHA', quantidade + '/' + prevista + '; execute npm run validacao:preparar.');
  else if (quantidade > prevista) registrar(item, 'ATENÇÃO', quantidade + '/' + prevista + '; ' + orientacaoSnapshot + '.');
  else registrar(item, 'OK', quantidade + '/' + prevista + '.');
}

async function lerAmbienteFront() {
  const valores = {};
  for (const nome of ['.env', '.env.local', '.env.development', '.env.development.local']) {
    let conteudo;
    try { conteudo = await fs.readFile(path.join(raiz, 'front-login', nome), 'utf8'); }
    catch (erro) { if (erro.code === 'ENOENT') continue; throw new Error('Não foi possível ler a configuração local do front.'); }
    for (const linha of conteudo.split(/\r?\n/)) {
      const campo = /^\s*(?:export\s+)?(VITE_USE_MOCK|VITE_API_URL)\s*=\s*(.*?)\s*$/.exec(linha);
      if (!campo) continue;
      const valor = campo[2];
      valores[campo[1]] = /^(['"])/.test(valor) ? valor.slice(1, valor.lastIndexOf(valor[0])) : valor.replace(/\s+#.*$/, '').trim();
    }
  }
  for (const chave of ['VITE_USE_MOCK', 'VITE_API_URL']) if (process.env[chave] !== undefined) valores[chave] = process.env[chave];
  return valores;
}

async function verificarArquivosLocais(configuracao) {
  await avaliar('Front em http://localhost:5173', async () => {
    let resposta;
    try { resposta = await fetch('http://localhost:5173', { signal: AbortSignal.timeout(5000) }); }
    catch (erro) { return { situacao: 'ATENÇÃO', orientacao: 'NÃO VERIFICADO (' + motivoRede(erro) + '); inicie npm run dev em front-login/.' }; }
    await resposta.body?.cancel();
    return { situacao: resposta.ok ? 'OK' : 'ATENÇÃO', orientacao: resposta.ok ? 'Frontend acessível.' : 'HTTP ' + resposta.status + '; confira o Vite.' };
  });
  await avaliar('Front: dados reais', async () => {
    const ambiente = await lerAmbienteFront();
    if (ambiente.VITE_USE_MOCK !== 'false') return { situacao: 'ATENÇÃO', orientacao: 'A sessão usaria dados simulados; configure VITE_USE_MOCK=false no ambiente do front e reinicie o Vite.' };
    if (configuracao && (ambiente.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '') !== configuracao.urlBase) {
      return { situacao: 'ATENÇÃO', orientacao: 'VITE_API_URL difere de SMOKE_BASE_URL; alinhe os endereços e reinicie o Vite.' };
    }
    return { orientacao: 'VITE_USE_MOCK=false; configuração conferida sem expor valores sensíveis.' };
  });
  await avaliar('Fotos de exemplo', async () => {
    for (const nome of fotos) validarPng(await fs.readFile(path.join(pastaFotos, nome)));
    return { orientacao: '3 PNGs de 800x600 presentes, menores que 400 KB e com CRC válido.' };
  });
  for (const nome of ['roteiro-sessao.md', 'questionario.md', 'ensaio.md']) {
    await avaliar('Documento: ' + nome, async () => {
      await fs.access(path.join(raiz, 'docs', 'validacao', nome)).catch(() => { throw new Error('Documento ausente: docs/validacao/' + nome + '; confira o kit antes da sessão.'); });
      return { orientacao: 'Documento disponível.' };
    });
  }
}

async function verificarDados(configuracao, requisitar, autenticacao) {
  const listar = async (rota, origem) => exigirLista((await requisitar('GET', rota, { autenticacao })).dados, origem);
  const resultados = await Promise.allSettled([
    listar('/api/clientes', 'Clientes'), listar('/api/projetos', 'Projetos'), listar('/api/diarios', 'Diários'),
  ]);
  const listas = resultados.map((resultado, indice) => {
    if (resultado.status === 'fulfilled') return resultado.value;
    registrar(['Clientes', 'Projetos', 'Diários'][indice], 'FALHA', resultado.reason.message);
    return null;
  });
  const [clientes, projetos, diarios] = listas;
  if (clientes) {
    const exemplos = clientes.filter((cliente) => clientesPrevistos.some((previsto) => previsto.email === cliente.email));
    conferirContagem('Clientes fictícios da sessão', exemplos.length, 2);
    if (clientes.length > 2) registrar('Clientes globais', 'ATENÇÃO', clientes.length + ' globais, ' + exemplos.length + ' do conjunto; ' + orientacaoSnapshot + '. Como clientes são compartilhados, os extras também podem ser do seed; o snapshot preserva esses registros.');
    else registrar('Clientes globais', 'OK', clientes.length + ' registros visíveis.');
    await avaliar('Contato e identidade dos clientes', async () => {
      if (!configuracao.telefone) return { situacao: 'ATENÇÃO', orientacao: 'Defina VALIDACAO_TELEFONE para conferir o contato do facilitador sem exibi-lo.' };
      if (!/^\d{10,13}$/.test(configuracao.telefone)) throw new Error('VALIDACAO_TELEFONE deve conter de 10 a 13 dígitos do facilitador.');
      for (const previsto of clientesPrevistos) {
        const cliente = unico(clientes, 'email', previsto.email, 'Cliente');
        if (!cliente || cliente.nome !== previsto.nome || String(cliente.telefone).replace(/\D/g, '') !== configuracao.telefone) {
          throw new Error('Cliente ausente ou divergente do exemplo/contato informado; confira a preparação sem enviar mensagens.');
        }
      }
      return { orientacao: 'Exemplos e contato conferidos; número não exibido.' };
    });
  }
  let primeiroProjeto;
  if (projetos) {
    conferirContagem('Projetos do convidado', projetos.length, 3);
    await avaliar('Projetos e situação inicial', async () => {
      for (const previsto of projetosPrevistos) {
        const projeto = unico(projetos, 'titulo', previsto.titulo, 'Projeto');
        if (!projeto) throw new Error('Projeto previsto ausente; execute npm run validacao:preparar.');
        if (projeto.titulo === projetosPrevistos[0].titulo) primeiroProjeto = projeto;
        if (projeto.localizacao !== 'Balsas - MA' || !projeto.dataInicio || Number.isNaN(Date.parse(projeto.dataInicio)) || new Date(projeto.dataInicio) >= new Date()) {
          throw new Error('Projeto sem localização prevista ou sem data de início válida no passado.');
        }
        if (projeto.status !== previsto.status || projeto.prioridade !== previsto.prioridade) return { situacao: 'ATENÇÃO', orientacao: 'Situação ou prioridade alterada; ' + orientacaoSnapshot + '.' };
        if (!projeto.cliente || projeto.cliente.email !== clientesPrevistos[previsto.cliente].email) throw new Error('Projeto está vinculado a cliente diferente do previsto.');
      }
      return { orientacao: 'Três títulos conferidos; primeiro projeto em planejamento, com datas passadas e clientes previstos.' };
    });
  }
  if (diarios) {
    conferirContagem('Diários do convidado', diarios.length, 6);
    await avaliar('Atividades de reserva', async () => {
      if (diarios.length >= 200) return { situacao: 'ATENÇÃO', orientacao: 'Consulta atingiu o limite de 200; contagem pode estar truncada. ' + orientacaoSnapshot + '.' };
      for (const previsto of diariosPrevistos) {
        const encontrados = diarios.filter((diario) => diario.atividade === previsto.atividade && diario.projetoId === projetos?.find((p) => p.titulo === projetosPrevistos[previsto.projeto].titulo)?.id);
        if (encontrados.length !== 1) throw new Error('Diário de reserva ausente ou duplicado; confira o conjunto previsto.');
        const data = new Date(encontrados[0].data);
        const fimHoje = new Date();
        fimHoje.setHours(23, 59, 59, 999);
        if (Number.isNaN(data.getTime()) || data > fimHoje) throw new Error('Diário sem data válida ou com data futura.');
      }
      return { orientacao: 'Seis atividades previstas conferidas, sem data futura.' };
    });
  }
  if (primeiroProjeto) {
    await avaliar('PDF: versões 1 e 2', async () => {
      const arquivos = await listar('/api/projetos/' + encodeURIComponent(primeiroProjeto.id) + '/arquivos', 'Arquivos');
      const versoes = conferirVersoes(arquivos);
      if (versoes.length !== 2) throw new Error('PDF de reserva incompleto; execute npm run validacao:preparar.');
      if (arquivos.length > 2) return { situacao: 'ATENÇÃO', orientacao: 'PDF com versões 1 e 2; há outros arquivos no projeto. ' + orientacaoSnapshot + '.' };
      return { orientacao: nomePdf + ' com exatamente as versões 1 e 2.' };
    });
  } else registrar('PDF: versões 1 e 2', 'FALHA', 'Projeto principal não confirmado; confira a preparação antes da sessão.');
  await avaliar('Orçamentos', async () => {
    if (!await rotasOrcamentoExistem()) return { situacao: 'ATENÇÃO', orientacao: 'Rotas de orçamento ausentes no código; dados pulados e tarefas T4/T5 indisponíveis.' };
    const orcamentos = await listar('/api/orcamentos', 'Orçamentos');
    if (orcamentos.length < 2) throw new Error('Menos de 2 orçamentos; execute npm run validacao:preparar.');
    for (const previsto of orcamentosPrevistos) {
      const encontrado = unico(orcamentos, 'nome', previsto.nome, 'Orçamento');
      if (!encontrado || encontrado.valor !== previsto.valor || encontrado.projetoId !== projetos?.find((p) => p.titulo === projetosPrevistos[previsto.projeto].titulo)?.id) {
        throw new Error('Orçamento de reserva ausente ou com valor/projeto divergente.');
      }
    }
    return orcamentos.length > 2 ? { situacao: 'ATENÇÃO', orientacao: orcamentos.length + '/2; ' + orientacaoSnapshot + '.' } : { orientacao: '2/2; nomes, valores e projetos conferidos.' };
  });
}

function imprimir() {
  console.log('Item | Situação (OK / ATENÇÃO / FALHA) | O que fazer');
  for (const item of itens) console.log(item.item + ' | ' + item.situacao + ' | ' + item.orientacao);
  const contagem = (situacao) => itens.filter((item) => item.situacao === situacao).length;
  console.log('\nResumo: ' + contagem('OK') + ' OK; ' + contagem('ATENÇÃO') + ' ATENÇÃO; ' + contagem('FALHA') + ' FALHA.');
  process.exitCode = contagem('FALHA') ? 1 : 0;
}

async function principal() {
  let configuracao;
  try { configuracao = obterConfiguracao({ exigirTelefone: false, exigirSenha: false }); }
  catch (erro) { registrar('Configuração', 'FALHA', erro.message); }
  if (configuracao) {
    const requisitar = criarRequisicao(configuracao);
    let online = false;
    await avaliar('API e banco', async () => {
      let saude;
      try { saude = (await requisitar('GET', '/api/health')).dados; }
      catch (erro) { throw new Error(erro.message.includes('suba o banco e a API') ? erro.message : erro.message + ' Dica: suba o banco e a API.'); }
      if (saude.api !== 'online' || saude.banco !== 'conectado') throw new Error('API ou banco indisponível; suba o banco e a API.');
      online = true;
      return { orientacao: 'API online e banco conectado.' };
    });
    let autenticacao;
    if (!configuracao.senha) registrar('Login do convidado', 'ATENÇÃO', 'Defina VALIDACAO_SENHA e, se necessário, VALIDACAO_EMAIL no ambiente; a credencial não será exibida.');
    else if (!online) registrar('Login do convidado', 'ATENÇÃO', 'NÃO VERIFICADO: primeiro suba o banco e a API.');
    else await avaliar('Login do convidado', async () => {
      const { dados } = await requisitar('POST', '/api/auth/login', { corpo: { email: configuracao.email, senha: configuracao.senha } });
      if (typeof dados.token !== 'string' || !dados.token || dados.usuario?.nome !== 'Engenheiro(a) Convidado(a)') throw new Error('Conta de convidado não confirmada; confira a preparação e as variáveis de acesso.');
      autenticacao = dados.token;
      return { orientacao: 'Conta de convidado autenticada; sessão não exibida.' };
    });
    if (autenticacao) await verificarDados(configuracao, requisitar, autenticacao);
    else for (const item of ['Clientes', 'Projetos', 'Diários', 'PDF: versões 1 e 2', 'Orçamentos']) registrar(item, 'ATENÇÃO', 'NÃO VERIFICADO: consulta depende da conta de convidado autenticada.');
  }
  await verificarArquivosLocais(configuracao);
  imprimir();
}

if (require.main === module) principal().catch((erro) => {
  registrar('Verificação', 'FALHA', mensagemSegura(erro));
  imprimir();
});
