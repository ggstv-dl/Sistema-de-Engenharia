import { request } from "./api";
import { getToken } from "./authService";

// Com VITE_USE_MOCK=true usa os dados de exemplo abaixo.
// Com false, chama a rota real. AJUSTE aqui quando o back-end definir o formato.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const DASHBOARD_PATH = "/api/dashboard";

// Formato que a tela espera. Campos marcados (*) ainda não existem no back-end.
const MOCK = {
  obrasAtivas: { valor: 12, detalhe: "↑ 2 este mês" },
  diariosPendentes: { valor: 5, detalhe: "Aguardando revisão" }, // (*)
  custoTotal: { valor: 1200000, detalhe: "↓ 5% vs previsto" }, // (*)
  eficiencia: { valor: 94 }, // (*)
  progressoObras: [
    { nome: "Residencial Flora", progresso: 65 }, // (*) progresso
    { nome: "Edifício Alpha", progresso: 10 },
    { nome: "Cond. Porto Belo", progresso: 45 },
    { nome: "Reforma Central Park", progresso: 100 },
    { nome: "Galpão Norte", progresso: 30 },
    { nome: "Ponte Rio Verde", progresso: 80 },
  ],
  atividades: [
    {
      tipo: "diario",
      texto: "Diário de Obra - Residencial Flora finalizado",
      quando: "há 2 horas",
      autor: "Eng. Carlos",
    },
    {
      tipo: "orcamento",
      texto: "Novo orçamento aprovado (Cond. Alpha)",
      quando: "há 5 horas",
      autor: "Financeiro",
    },
    {
      tipo: "usuario",
      texto: "Mestre de Obras adicionado ao sistema",
      quando: "há 1 dia",
      autor: "Adm",
    },
    {
      tipo: "atraso",
      texto: "Atraso reportado no Projeto Porto Belo",
      quando: "há 2 dias",
      autor: "Eng. Maria",
    },
  ],
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDashboard() {
  if (USE_MOCK) {
    await wait(600);
    return MOCK;
  }
  return request(DASHBOARD_PATH, { token: getToken() });
}
