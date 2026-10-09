import { request } from "./api";

const TOKEN_KEY = "se_token";
const USER_KEY = "se_user";

// MODO DE TESTE: com VITE_USE_MOCK=true o login funciona sem back-end.
// Quando as rotas reais existirem, coloque VITE_USE_MOCK=false no .env.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ATENÇÃO: ajuste estes pontos quando conferir as rotas reais do back-end.
const LOGIN_PATH = "/api/auth/login";
const REGISTER_PATH = "/api/auth/registro";
const buildLoginBody = (email, senha) => ({ email, senha });
const buildRegisterBody = (nome, email, senha) => ({ nome, email, senha });
const extractToken = (data) => data?.token; // onde vem o token na resposta
const extractUser = (data) => data?.usuario ?? null; // dados do usuário, se vierem

function mockSession(email, nome = "Eng. Ricardo") {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          token: "mock-token",
          usuario: { nome, perfil: "Administrador", email },
        }),
      600
    );
  });
}

function saveSession(data) {
  const token = extractToken(data);
  if (!token) throw new Error("Resposta sem token.");

  localStorage.setItem(TOKEN_KEY, token);
  const user = extractUser(data);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  return data;
}

export async function login(email, senha) {
  const data = USE_MOCK
    ? await mockSession(email)
    : await request(LOGIN_PATH, {
        method: "POST",
        body: buildLoginBody(email, senha),
      });
  return saveSession(data);
}

// Cria a conta e já deixa o usuário logado.
export async function registrar(nome, email, senha) {
  if (USE_MOCK) return saveSession(await mockSession(email, nome));

  await request(REGISTER_PATH, {
    method: "POST",
    body: buildRegisterBody(nome, email, senha),
  });
  return login(email, senha);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}
