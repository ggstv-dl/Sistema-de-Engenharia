import { request } from "./api";
import { getToken } from "./authService";

// Com VITE_USE_MOCK=true usa dados de exemplo (salvos no navegador).
// Com false, chama a API real. AJUSTE os pontos marcados quando o back-end definir o formato.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// (*) rotas ainda não existentes no back-end: caminhos suposições.
const ORCAMENTOS_PATH = "/api/orcamentos";
const SINAPI_PATH = "/api/sinapi"; // GET ?busca=texto
// Esta rota já existe no back-end (README).
const WHATSAPP_PATH = "/api/whatsapp/enviar-orcamento";

const STORAGE_KEY = "se_mock_orcamentos";

export const STATUS_ORC = [
  { valor: "rascunho", rotulo: "Rascunho" },
  { valor: "enviado", rotulo: "Enviado" },
];

// ---- Cálculos (usados pela tela e pelo PDF) ----

export const itemTotal = (i) => (Number(i.qtd) || 0) * (Number(i.preco) || 0);

export function totais(orc) {
  const subtotal = (orc.itens || []).reduce((s, i) => s + itemTotal(i), 0);
  const bdi = subtotal * ((Number(orc.bdi) || 0) / 100);
  return { subtotal, bdi, total: subtotal + bdi };
}

export const moeda = (v) =>
  (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ---- Adaptadores ----

const nomeDe = (v) => (typeof v === "string" ? v : v?.nome ?? v?.titulo ?? "");

function normalizar(o) {
  return {
    id: o.id,
    numero: o.numero ?? `ORC-${String(o.id).slice(-4).padStart(4, "0")}`,
    projetoId: o.projetoId ?? o.obraId ?? o.projeto?.id ?? "",
    projeto: nomeDe(o.projeto) || "(sem projeto)",
    cliente: nomeDe(o.cliente),
    telefone: o.telefone ?? o.whatsapp ?? "",
    validade: String(o.validade ?? "").slice(0, 10),
    observacoes: o.observacoes ?? "",
    bdi: Number.isFinite(Number(o.bdi)) ? Number(o.bdi) : 0, // (*)
    itens: Array.isArray(o.itens) ? o.itens : [],
    status: o.status ?? "rascunho",
    criadoEm: String(o.criadoEm ?? o.createdAt ?? "").slice(0, 10),
  };
}

function montarCorpo(d) {
  return {
    projetoId: d.projetoId,
    cliente: d.cliente,
    telefone: d.telefone,
    validade: d.validade,
    observacoes: d.observacoes,
    bdi: Number(d.bdi) || 0,
    itens: d.itens.map((i) => ({
      codigo: i.codigo,
      descricao: i.descricao,
      unidade: i.unidade,
      qtd: Number(i.qtd),
      preco: Number(i.preco),
    })),
  };
}

// ---- Catálogo de exemplo (modo mock) ----
// ATENÇÃO: códigos e preços abaixo são FICTÍCIOS, só para demonstrar a tela.
// Com o back-end, essa lista vem da consulta real à tabela SINAPI.
const CATALOGO = [
  { codigo: "SIN-0101", descricao: "Cimento Portland CP-II 50 kg", unidade: "saco", preco: 38.5 },
  { codigo: "SIN-0102", descricao: "Areia média lavada", unidade: "m³", preco: 120 },
  { codigo: "SIN-0103", descricao: "Brita nº 1", unidade: "m³", preco: 135 },
  { codigo: "SIN-0104", descricao: "Tijolo cerâmico 8 furos 9x19x19 cm", unidade: "un", preco: 1.15 },
  { codigo: "SIN-0105", descricao: "Aço CA-50 10 mm", unidade: "kg", preco: 9.8 },
  { codigo: "SIN-0106", descricao: "Aço CA-60 5 mm", unidade: "kg", preco: 10.4 },
  { codigo: "SIN-0201", descricao: "Concreto usinado fck 25 MPa", unidade: "m³", preco: 465 },
  { codigo: "SIN-0202", descricao: "Argamassa de assentamento traço 1:4", unidade: "m³", preco: 540 },
  { codigo: "SIN-0203", descricao: "Chapisco em parede, traço 1:3", unidade: "m²", preco: 6.2 },
  { codigo: "SIN-0204", descricao: "Reboco em parede, espessura 2 cm", unidade: "m²", preco: 38 },
  { codigo: "SIN-0301", descricao: "Alvenaria de vedação, tijolo 8 furos", unidade: "m²", preco: 72 },
  { codigo: "SIN-0302", descricao: "Contrapiso em argamassa, espessura 5 cm", unidade: "m²", preco: 48 },
  { codigo: "SIN-0303", descricao: "Piso cerâmico 45x45 cm assentado", unidade: "m²", preco: 89 },
  { codigo: "SIN-0304", descricao: "Revestimento cerâmico de parede 30x40 cm", unidade: "m²", preco: 82 },
  { codigo: "SIN-0401", descricao: "Pintura látex PVA, duas demãos", unidade: "m²", preco: 17.5 },
  { codigo: "SIN-0402", descricao: "Pintura acrílica com selador, duas demãos", unidade: "m²", preco: 26 },
  { codigo: "SIN-0501", descricao: "Telhado em telha cerâmica, com madeiramento", unidade: "m²", preco: 135 },
  { codigo: "SIN-0502", descricao: "Laje pré-moldada treliçada h=12 cm", unidade: "m²", preco: 118 },
  { codigo: "SIN-0601", descricao: "Ponto elétrico (tomada ou interruptor)", unidade: "pt", preco: 95 },
  { codigo: "SIN-0602", descricao: "Cabo de cobre flexível 2,5 mm²", unidade: "m", preco: 3.9 },
  { codigo: "SIN-0603", descricao: "Quadro de distribuição 12 disjuntores", unidade: "un", preco: 285 },
  { codigo: "SIN-0701", descricao: "Tubo PVC esgoto 100 mm", unidade: "m", preco: 24 },
  { codigo: "SIN-0702", descricao: "Ponto hidráulico água fria", unidade: "pt", preco: 110 },
  { codigo: "SIN-0801", descricao: "Escavação manual de vala até 1,5 m", unidade: "m³", preco: 58 },
  { codigo: "SIN-0802", descricao: "Forma de madeira para fundação", unidade: "m²", preco: 64 },
  { codigo: "SIN-0901", descricao: "Servente com encargos", unidade: "h", preco: 17.8 },
  { codigo: "SIN-0902", descricao: "Pedreiro com encargos", unidade: "h", preco: 24.6 },
];

const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const EXEMPLO = [
  {
    id: 9001,
    numero: "ORC-0001",
    projetoId: 3,
    projeto: "Condomínio Porto Belo",
    cliente: "Porto Belo Empreendimentos",
    telefone: "(89) 99999-0001",
    validade: "2026-12-15",
    observacoes: "Valores sujeitos a reajuste após a validade.",
    bdi: 20,
    status: "enviado",
    criadoEm: "2026-10-02",
    itens: [
      { codigo: "SIN-0301", descricao: "Alvenaria de vedação, tijolo 8 furos", unidade: "m²", qtd: 420, preco: 72 },
      { codigo: "SIN-0204", descricao: "Reboco em parede, espessura 2 cm", unidade: "m²", qtd: 840, preco: 38 },
      { codigo: "SIN-0402", descricao: "Pintura acrílica com selador, duas demãos", unidade: "m²", qtd: 840, preco: 26 },
    ],
  },
  {
    id: 9002,
    numero: "ORC-0002",
    projetoId: 5,
    projeto: "Galpão Norte",
    cliente: "Logística Norte",
    telefone: "(89) 99999-0002",
    validade: "2026-11-30",
    observacoes: "",
    bdi: 18,
    status: "rascunho",
    criadoEm: "2026-10-18",
    itens: [
      { codigo: "SIN-0201", descricao: "Concreto usinado fck 25 MPa", unidade: "m³", qtd: 60, preco: 465 },
      { codigo: "SIN-0105", descricao: "Aço CA-50 10 mm", unidade: "kg", qtd: 3200, preco: 9.8 },
    ],
  },
];

function ler() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) return JSON.parse(salvo);
  } catch {
    // sem armazenamento: usa os dados originais
  }
  return EXEMPLO.map((o) => ({ ...o }));
}

function gravar(lista) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    // sem armazenamento: não guarda
  }
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Funções usadas pelas telas ----

export async function listarOrcamentos() {
  if (USE_MOCK) {
    await esperar(500);
    return ler().map(normalizar);
  }
  const resposta = await request(ORCAMENTOS_PATH, { token: getToken() });
  const lista = Array.isArray(resposta) ? resposta : resposta?.orcamentos ?? resposta?.data ?? [];
  return lista.map(normalizar);
}

// Consulta de preços (SINAPI). Devolve [{ codigo, descricao, unidade, preco }]
export async function buscarSinapi(texto) {
  const termo = semAcento(texto.trim());
  if (USE_MOCK) {
    await esperar(250);
    if (!termo) return CATALOGO.slice(0, 8);
    return CATALOGO.filter((c) => semAcento(`${c.codigo} ${c.descricao}`).includes(termo)).slice(0, 20);
  }
  const resposta = await request(`${SINAPI_PATH}?busca=${encodeURIComponent(texto.trim())}`, {
    token: getToken(),
  });
  const lista = Array.isArray(resposta) ? resposta : resposta?.itens ?? resposta?.data ?? [];
  return lista.map((c) => ({
    codigo: c.codigo ?? c.code ?? "",
    descricao: c.descricao ?? c.nome ?? "",
    unidade: c.unidade ?? "un",
    preco: Number(c.preco ?? c.valor ?? 0),
  }));
}

// Cria (sem id) ou edita (com id). Devolve o orçamento salvo.
export async function salvarOrcamento(dados) {
  if (USE_MOCK) {
    await esperar(400);
    const lista = ler();
    let salvo;
    if (dados.id) {
      const i = lista.findIndex((o) => o.id === dados.id);
      salvo = { ...(lista[i] ?? {}), ...dados };
      if (i >= 0) lista[i] = salvo;
      else lista.unshift(salvo);
    } else {
      const seq = lista.length + 1;
      salvo = {
        ...dados,
        id: Date.now(),
        numero: `ORC-${String(seq).padStart(4, "0")}`,
        status: "rascunho",
        criadoEm: new Date().toISOString().slice(0, 10),
      };
      lista.unshift(salvo);
    }
    gravar(lista);
    return normalizar(salvo);
  }
  const corpo = montarCorpo(dados);
  const token = getToken();
  const resp = dados.id
    ? await request(`${ORCAMENTOS_PATH}/${dados.id}`, { method: "PUT", body: corpo, token })
    : await request(ORCAMENTOS_PATH, { method: "POST", body: corpo, token });
  return normalizar({ ...dados, ...(resp?.orcamento ?? resp ?? {}) });
}

// Envia o orçamento pelo WhatsApp (rota já existente no back-end).
export async function enviarWhatsapp(orc, mensagem) {
  if (USE_MOCK) {
    await esperar(700);
    const lista = ler();
    const i = lista.findIndex((o) => o.id === orc.id);
    if (i >= 0) {
      lista[i] = { ...lista[i], status: "enviado" };
      gravar(lista);
    }
    return;
  }
  // (*) corpo assumido: o README não detalha os campos.
  await request(WHATSAPP_PATH, {
    method: "POST",
    token: getToken(),
    body: {
      orcamentoId: orc.id,
      telefone: orc.telefone.replace(/\D/g, ""),
      mensagem,
    },
  });
}
