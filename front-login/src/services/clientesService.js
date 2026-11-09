import { ApiError, request } from "./api";
import { getToken } from "./authService";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const CLIENTES_PATH = "/api/clientes";
const STORAGE_KEY = "se_mock_clientes";

const EXEMPLO = [
  { id: 1, nome: "Construtora Flora", email: "contato@flora.example.com", telefone: "11999991111" },
  { id: 2, nome: "Grupo Alpha", email: "contato@alpha.example.com", telefone: "41999992222" },
  { id: 3, nome: "Porto Belo Empreendimentos", email: "contato@portobelo.example.com", telefone: "47999993333" },
];

function normalizar({ id, nome, email, telefone }) {
  return { id, nome, email, telefone };
}

function lerExemplo() {
  try {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(salvo)) return salvo;
  } catch {
    // sem dados válidos no armazenamento: usa a lista inicial
  }
  return EXEMPLO.map(normalizar);
}

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function listarClientes() {
  if (USE_MOCK) {
    await esperar(400);
    return lerExemplo().map(normalizar);
  }
  const resposta = await request(CLIENTES_PATH, { token: getToken() });
  const lista = Array.isArray(resposta) ? resposta : resposta?.clientes ?? [];
  return lista.map(normalizar);
}

export async function criarCliente({ nome, email, telefone }) {
  const dados = {
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: telefone.trim(),
  };
  if (USE_MOCK) {
    await esperar(400);
    const lista = lerExemplo();
    if (lista.some((cliente) => cliente.email.toLowerCase() === dados.email)) {
      throw new ApiError("Já existe um cliente com este e-mail.", 409);
    }
    const cliente = { ...dados, id: Math.max(0, ...lista.map((item) => item.id)) + 1 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...lista, cliente]));
    return normalizar(cliente);
  }
  const resposta = await request(CLIENTES_PATH, {
    method: "POST",
    body: dados,
    token: getToken(),
  });
  return normalizar(resposta);
}
