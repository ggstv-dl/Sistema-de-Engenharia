const assert = require('node:assert/strict');

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';

/** Valida o fluxo HTTP com os dados locais criados pelo seed. */
async function main() {
  const request = (path, options = {}) => fetch(`${baseUrl}${path}`, {
    ...options,
    signal: AbortSignal.timeout(10000),
  });

  const health = await request('/api/health');
  assert.equal(health.status, 200, 'Banco e API devem estar saudáveis');

  const anonymous = await request('/api/dashboard');
  assert.equal(anonymous.status, 401, 'Dashboard deve exigir autenticação');

  const invalid = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'joao@engineer.com', senha: 'incorreta' }),
  });
  assert.equal(invalid.status, 401, 'Senha incorreta deve ser rejeitada');

  const login = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'joao@engineer.com', senha: '123456' }),
  });
  assert.equal(login.status, 200, 'Login do seed deve responder 200');
  const { token, usuario } = await login.json();
  assert.ok(token, 'Login deve fornecer token');
  assert.equal(usuario.email, 'joao@engineer.com');
  assert.equal(usuario.senha, undefined, 'Login não deve expor a senha');

  const dashboard = await request('/api/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(dashboard.status, 200, 'Dashboard autenticado deve responder 200');
  const data = await dashboard.json();
  assert.ok(data.obrasAtivas.valor >= 1, 'Deve carregar a obra ativa do seed');
  assert.ok(data.atividades.length >= 2, 'Deve carregar os diários do seed');
  console.log('Smoke OK: health, proteção do dashboard, senha inválida, login e dashboard com dados.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
