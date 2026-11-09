import { request } from "./api";
import { getToken } from "./authService";
import { listarClientes } from "./clientesService";

// Com VITE_USE_MOCK=true usa dados de exemplo (salvos no navegador, então
// o que você criar/editar continua depois de recarregar a página).
// Com false, chama a API real.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const PROJETOS_PATH = "/api/projetos";
const STORAGE_KEY = "se_mock_projetos";

export const STATUS = [
  { valor: "planejamento", rotulo: "Em Planejamento" },
  { valor: "em_andamento", rotulo: "Em Andamento" },
  { valor: "concluido", rotulo: "Concluído" },
  { valor: "cancelado", rotulo: "Cancelado" },
];

// (*) valores de prioridade assumidos: o blueprint só cita "Prioridade".
export const PRIORIDADES = [
  { valor: "baixa", rotulo: "Baixa" },
  { valor: "media", rotulo: "Média" },
  { valor: "alta", rotulo: "Alta" },
];

// ---- Adaptadores: traduzem o que a API devolve/recebe ----

const nomeDe = (v) => (typeof v === "string" ? v : v?.nome ?? "");

// Resposta da API -> formato que a tela usa
function normalizar(p) {
  return {
    id: p.id,
    titulo: p.titulo ?? p.nome ?? "(sem título)",
    cliente: nomeDe(p.cliente),
    clienteId: p.cliente?.id ?? p.clienteId ?? null,
    engenheiro: nomeDe(p.engenheiro),
    localizacao: p.localizacao ?? "",
    status: p.status ?? "planejamento",
    prioridade: p.prioridade ?? "media",
    progresso: Number.isFinite(p.progresso) ? p.progresso : null, // (*)
    dataInicio: String(p.dataInicio ?? p.criadoEm ?? "").slice(0, 10),
  };
}

function montarCorpo(d) {
  return {
    titulo: d.titulo,
    ...(d.descricao !== undefined ? { descricao: d.descricao } : {}),
    status: d.status,
    prioridade: d.prioridade,
    localizacao: d.localizacao || null,
    dataInicio: d.dataInicio || null,
  };
}

// ---- Dados de exemplo ----

const EXEMPLO = [
  { id: 1, titulo: "Residencial Flora", cliente: "Construtora Flora", engenheiro: "Eng. Carlos", localizacao: "São Paulo, SP", status: "em_andamento", prioridade: "alta", progresso: 65, dataInicio: "2026-01-12" },
  { id: 2, titulo: "Edifício Alpha", cliente: "Grupo Alpha", engenheiro: "Eng. Maria", localizacao: "Curitiba, PR", status: "planejamento", prioridade: "media", progresso: 10, dataInicio: "2026-03-05" },
  { id: 3, titulo: "Condomínio Porto Belo", cliente: "Porto Belo Empreendimentos", engenheiro: "Eng. Maria", localizacao: "Itajaí, SC", status: "em_andamento", prioridade: "alta", progresso: 45, dataInicio: "2025-11-22" },
  { id: 4, titulo: "Reforma Central Park", cliente: "Central Park Administradora", engenheiro: "Eng. Carlos", localizacao: "São Paulo, SP", status: "concluido", prioridade: "baixa", progresso: 100, dataInicio: "2025-10-10" },
  { id: 5, titulo: "Galpão Norte", cliente: "Logística Norte", engenheiro: "Eng. Ricardo", localizacao: "Balsas, MA", status: "em_andamento", prioridade: "media", progresso: 30, dataInicio: "2026-02-02" },
  { id: 6, titulo: "Ponte Rio Verde", cliente: "Prefeitura de Rio Verde", engenheiro: "Eng. Ricardo", localizacao: "Rio Verde, GO", status: "em_andamento", prioridade: "alta", progresso: 80, dataInicio: "2025-12-01" },
  { id: 7, titulo: "Shopping Aurora", cliente: "Aurora Shopping S.A.", engenheiro: "Eng. Carlos", localizacao: "Goiânia, GO", status: "planejamento", prioridade: "alta", progresso: 5, dataInicio: "2026-04-15" },
  { id: 8, titulo: "Escola Municipal Vila Nova", cliente: "Prefeitura de Balsas", engenheiro: "Eng. Maria", localizacao: "Balsas, MA", status: "concluido", prioridade: "media", progresso: 100, dataInicio: "2025-08-18" },
  { id: 9, titulo: "Residencial Bela Vista", cliente: "Bela Vista Incorporadora", engenheiro: "Eng. Ricardo", localizacao: "Teresina, PI", status: "cancelado", prioridade: "baixa", progresso: 20, dataInicio: "2025-09-09" },
  { id: 10, titulo: "Clínica São Lucas", cliente: "Clínica São Lucas", engenheiro: "Eng. Carlos", localizacao: "Imperatriz, MA", status: "em_andamento", prioridade: "media", progresso: 55, dataInicio: "2026-01-26" },
  { id: 11, titulo: "Armazém Cerrado", cliente: "Agro Cerrado", engenheiro: "Eng. Ricardo", localizacao: "Uruçuí, PI", status: "planejamento", prioridade: "baixa", progresso: 0, dataInicio: "2026-05-04" },
  { id: 12, titulo: "Centro Esportivo Municipal", cliente: "Prefeitura de Balsas", engenheiro: "Eng. Maria", localizacao: "Balsas, MA", status: "em_andamento", prioridade: "media", progresso: 70, dataInicio: "2025-10-30" },
];

function lerExemplo() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) return JSON.parse(salvo);
  } catch {
    // sem armazenamento: usa os dados originais
  }
  return EXEMPLO.map((p) => ({ ...p }));
}

function gravarExemplo(lista) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    // sem armazenamento: não guarda
  }
}

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- Funções usadas pelas telas ----

export async function listarProjetos() {
  if (USE_MOCK) {
    await esperar(500);
    return lerExemplo().map(normalizar);
  }
  const resposta = await request(PROJETOS_PATH, { token: getToken() });
  const lista = Array.isArray(resposta)
    ? resposta
    : resposta?.projetos ?? resposta?.data ?? [];
  return lista.map(normalizar);
}

// Cria (sem id) ou edita (com id)
export async function salvarProjeto(dados) {
  if (USE_MOCK) {
    await esperar(400);
    const lista = lerExemplo();
    const projeto = { ...dados };
    if (dados.clienteId) {
      const clientes = await listarClientes();
      const cliente = clientes.find((item) => String(item.id) === String(dados.clienteId));
      if (cliente) projeto.cliente = cliente.nome;
    }
    if (dados.id) {
      const i = lista.findIndex((p) => p.id === dados.id);
      if (i >= 0) lista[i] = { ...lista[i], ...projeto };
    } else {
      lista.unshift({ ...projeto, id: Date.now(), progresso: 0 });
    }
    gravarExemplo(lista);
    return;
  }

  const corpo = montarCorpo(dados);
  const token = getToken();
  if (dados.id) {
    await request(`${PROJETOS_PATH}/${dados.id}`, { method: "PUT", body: corpo, token });
  } else {
    if (!dados.clienteId) {
      throw new Error("Selecione um cliente para criar o projeto.");
    }
    await request(PROJETOS_PATH, { method: "POST", body: { ...corpo, clienteId: dados.clienteId }, token });
  }
}
