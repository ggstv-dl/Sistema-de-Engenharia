// Deixa dados de teste no banco e arquivos no diretório de upload; não faz limpeza.
const assert = require('node:assert/strict');

const baseUrl = (process.env.SMOKE_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const resultado = { ok: 0, falhas: 0 };

async function passo(nome, executar) {
  try {
    await executar();
    resultado.ok++;
    console.log(`OK ${nome}`);
  } catch (erro) {
    resultado.falhas++;
    console.log(`FALHOU ${nome}: ${String(erro.message).replace(/\s+/g, ' ')}`);
  }
}

async function requisitar(metodo, rota, { token, corpo, status = 200 } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const formulario = corpo instanceof FormData;
  if (corpo !== undefined && !formulario) headers['Content-Type'] = 'application/json';

  const resposta = await fetch(`${baseUrl}${rota}`, {
    method: metodo,
    headers,
    body: corpo === undefined ? undefined : formulario ? corpo : JSON.stringify(corpo),
    signal: AbortSignal.timeout(10000),
  });

  assert.equal(resposta.status, status, `${metodo} ${rota}: esperado HTTP ${status}, recebido ${resposta.status}`);
  const dados = await resposta.json();
  if (status >= 400) {
    assert.deepEqual(Object.keys(dados), ['message'], 'Erro deve usar somente { message }');
    assert.equal(typeof dados.message, 'string');
    assert.ok(dados.message);
  }
  return dados;
}

function criarPdf() {
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objetos.forEach((objeto, indice) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${indice + 1} 0 obj\n${objeto}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Blob([pdf], { type: 'application/pdf' });
}

function formularioArquivo(nome = 'smoke.pdf', arquivo = criarPdf()) {
  const formulario = new FormData();
  formulario.append('arquivo', arquivo, nome);
  return formulario;
}

function resumir() {
  console.log(`Resumo: ${resultado.ok} OK, ${resultado.falhas} FALHOU (${resultado.ok + resultado.falhas} passos).`);
  if (resultado.falhas) process.exitCode = 1;
}

async function main() {
  const execucao = `${Date.now()}-${process.pid}`;
  let joao, maria, cliente, projeto, diario, arquivo1, arquivo2, projetoMaria;
  const tokenJoao = () => { assert.ok(joao?.token, 'Login do João necessário'); return joao.token; };
  const tokenMaria = () => { assert.ok(maria?.token, 'Login da Maria necessário'); return maria.token; };
  const projetoId = () => { assert.ok(projeto?.id, 'Projeto de teste necessário'); return projeto.id; };
  const corpoDiario = () => ({
    projetoId: projetoId(), data: new Date().toISOString(),
    descricao: `Atividades do smoke ${execucao}`,
    maoDeObra: [{ funcao: 'Pedreiro', qtd: 2 }], fotos: [],
  });

  await passo('health: API e banco online', async () => {
    const dados = await requisitar('GET', '/api/health');
    assert.deepEqual(dados, { api: 'online', banco: 'conectado' });
  });

  await passo('login do João', async () => {
    joao = await requisitar('POST', '/api/auth/login', { corpo: { email: 'joao@engineer.com', senha: '123456' } });
    assert.equal(typeof joao.token, 'string');
    assert.ok(joao.token);
    assert.equal(joao.usuario.email, 'joao@engineer.com');
    assert.ok(!Object.hasOwn(joao.usuario, 'senha'), 'Login não deve expor senha');
  });

  await passo('login da Maria', async () => {
    maria = await requisitar('POST', '/api/auth/login', { corpo: { email: 'maria@engineer.com', senha: '123456' } });
    assert.equal(typeof maria.token, 'string');
    assert.ok(maria.token);
    assert.equal(maria.usuario.email, 'maria@engineer.com');
    assert.ok(!Object.hasOwn(maria.usuario, 'senha'), 'Login não deve expor senha');
  });

  await passo('senha incorreta: 401', async () => {
    await requisitar('POST', '/api/auth/login', { corpo: { email: 'joao@engineer.com', senha: 'incorreta' }, status: 401 });
  });

  await passo('dashboard autenticado com dados do seed', async () => {
    const dados = await requisitar('GET', '/api/dashboard', { token: tokenJoao() });
    assert.ok(dados.obrasAtivas.valor >= 1, 'Deve carregar a obra ativa do seed');
    assert.ok(dados.atividades.length >= 2, 'Deve carregar os diários do seed');
  });

  await passo('criar cliente', async () => {
    cliente = await requisitar('POST', '/api/clientes', { token: tokenJoao(), status: 201,
      corpo: { nome: `Cliente smoke ${execucao}`, email: `smoke.${execucao}@example.com`, telefone: '(11) 99999-1234' } });
    assert.ok(cliente.id);
  });

  await passo('listar e encontrar cliente', async () => {
    const dados = await requisitar('GET', '/api/clientes', { token: tokenJoao() });
    assert.ok(dados.some(item => item.id === cliente.id));
  });

  await passo('criar projeto do João', async () => {
    projeto = await requisitar('POST', '/api/projetos', { token: tokenJoao(), status: 201,
      corpo: { titulo: `Projeto smoke ${execucao}`, status: 'planejamento', prioridade: 'media', clienteId: cliente.id } });
    assert.equal(projeto.cliente.id, cliente.id);
    assert.equal(projeto.engenheiro.id, joao.usuario.id);
  });

  await passo('listar e encontrar projeto', async () => {
    const dados = await requisitar('GET', '/api/projetos', { token: tokenJoao() });
    assert.ok(dados.some(item => item.id === projetoId()));
  });

  await passo('editar status do projeto', async () => {
    const dados = await requisitar('PUT', `/api/projetos/${projetoId()}`, { token: tokenJoao(), corpo: { status: 'em_andamento' } });
    assert.equal(dados.status, 'em_andamento');
  });

  await passo('criar diário de obra', async () => {
    diario = await requisitar('POST', '/api/rdo/sync', { token: tokenJoao(), corpo: corpoDiario(), status: 201 });
    assert.equal(diario.projeto.id, projetoId());
    assert.equal(diario.engenheiro.id, joao.usuario.id);
  });

  await passo('listar e encontrar diário', async () => {
    const dados = await requisitar('GET', '/api/diarios', { token: tokenJoao() });
    assert.ok(dados.some(item => item.id === diario.id));
  });

  await passo('upload PDF versão 1', async () => {
    arquivo1 = await requisitar('POST', `/api/projetos/${projetoId()}/arquivos`, { token: tokenJoao(), corpo: formularioArquivo(), status: 201 });
    assert.equal(arquivo1.versao, 1);
    assert.equal(arquivo1.nome, 'smoke.pdf');
    assert.match(arquivo1.caminho, /^\/uploads\/[0-9a-f-]+\.pdf$/);
  });

  await passo('upload do mesmo nome: versão 2', async () => {
    arquivo2 = await requisitar('POST', `/api/projetos/${projetoId()}/arquivos`, { token: tokenJoao(), corpo: formularioArquivo(), status: 201 });
    assert.equal(arquivo2.versao, 2);
    assert.notEqual(arquivo2.caminho, arquivo1.caminho);
  });

  await passo('listar arquivos e preservar as duas versões', async () => {
    const dados = await requisitar('GET', `/api/projetos/${projetoId()}/arquivos`, { token: tokenJoao() });
    assert.ok(dados.some(item => item.id === arquivo1.id));
    assert.ok(dados.some(item => item.id === arquivo2.id));
    assert.deepEqual(dados.filter(item => item.nome === 'smoke.pdf').map(item => item.versao), [2, 1]);
  });

  await passo('Maria não lista o projeto do João', async () => {
    const dados = await requisitar('GET', '/api/projetos', { token: tokenMaria() });
    assert.ok(!dados.some(item => item.id === projetoId()));
    projetoMaria = dados[0];
    assert.ok(projetoMaria, 'Maria precisa ter um projeto do seed');
  });

  await passo('Maria não lista o diário do João', async () => {
    const dados = await requisitar('GET', '/api/diarios', { token: tokenMaria() });
    assert.ok(!dados.some(item => item.id === diario.id));
  });

  await passo('filtro de diários da Maria pelo projeto do João: []', async () => {
    const dados = await requisitar('GET', `/api/diarios?projetoId=${projetoId()}`, { token: tokenMaria() });
    assert.deepEqual(dados, []);
  });

  await passo('lista de arquivos da Maria não inclui os do João', async () => {
    const dados = await requisitar('GET', `/api/projetos/${projetoMaria.id}/arquivos`, { token: tokenMaria() });
    assert.ok(!dados.some(item => item.id === arquivo1.id || item.id === arquivo2.id));
  });

  await passo('Maria não acessa arquivos do projeto do João: 404', async () => {
    await requisitar('GET', `/api/projetos/${projetoId()}/arquivos`, { token: tokenMaria(), status: 404 });
  });

  await passo('Maria não altera projeto do João: 404', async () => {
    await requisitar('PUT', `/api/projetos/${projetoId()}`, { token: tokenMaria(), corpo: { status: 'concluido' }, status: 404 });
  });

  await passo('Maria não sincroniza diário no projeto do João: 404', async () => {
    await requisitar('POST', '/api/rdo/sync', { token: tokenMaria(), corpo: corpoDiario(), status: 404 });
  });

  await passo('Maria não envia arquivo ao projeto do João: 404', async () => {
    await requisitar('POST', `/api/projetos/${projetoId()}/arquivos`, { token: tokenMaria(), corpo: formularioArquivo(), status: 404 });
  });

  const protegidas = [
    ['GET', '/api/clientes'], ['POST', '/api/clientes', {}],
    ['GET', '/api/projetos'], ['POST', '/api/projetos', {}],
    ['PUT', () => `/api/projetos/${projetoId()}`, {}],
    ['POST', '/api/rdo/sync', {}], ['GET', '/api/diarios'],
    ['GET', () => `/api/projetos/${projetoId()}/arquivos`],
    ['POST', () => `/api/projetos/${projetoId()}/arquivos`, {}],
    ['GET', '/api/dashboard'],
  ];
  for (const [metodo, rota, corpo] of protegidas) {
    const nome = typeof rota === 'string' ? rota : '/api/projetos/:id' + (metodo === 'PUT' ? '' : '/arquivos');
    await passo(`sem token: ${metodo} ${nome} -> 401`, async () => {
      await requisitar(metodo, typeof rota === 'function' ? rota() : rota, { corpo, status: 401 });
    });
  }

  await passo('data futura no RDO: 400', async () => {
    const dados = await requisitar('POST', '/api/rdo/sync', { token: tokenJoao(),
      corpo: { ...corpoDiario(), data: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() }, status: 400 });
    assert.equal(dados.message, 'A data do diário não pode ser futura.');
  });

  await passo('status inválido no projeto: 400', async () => {
    await requisitar('POST', '/api/projetos', { token: tokenJoao(),
      corpo: { titulo: 'Projeto inválido', status: 'invalido', prioridade: 'media', clienteId: cliente.id }, status: 400 });
  });

  await passo('extensão de upload não permitida: 400', async () => {
    const dados = await requisitar('POST', `/api/projetos/${projetoId()}/arquivos`, { token: tokenJoao(),
      corpo: formularioArquivo('smoke.exe', new Blob(['teste'])), status: 400 });
    assert.equal(dados.message, 'Tipo de arquivo não permitido. Aceitos: pdf, dwg, rvt, jpg, jpeg, png.');
  });

  resumir();
}

main().catch((erro) => {
  resultado.falhas++;
  console.log(`FALHOU execução: ${String(erro.message).replace(/\s+/g, ' ')}`);
  resumir();
});
