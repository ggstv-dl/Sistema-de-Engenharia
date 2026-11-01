import { request, requestBlob } from "./api";
import { getToken } from "./authService";
import { listarProjetos } from "./projetosService";
import { listarOrcamentos, totais } from "./orcamentosService";
import { listarDiarios } from "./diarioService";

// Com VITE_USE_MOCK=true os relatórios são gerados aqui no navegador (CSV) a partir
// dos dados de exemplo. Com false, chama a API real. AJUSTE os pontos (*) quando o back-end definir.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// (*) rotas ainda não existentes no back-end: caminhos são suposições.
const RELATORIOS_PATH = "/api/relatorios";
const DOWNLOAD_PATH = (id) => `/api/relatorios/${id}/download`;

const STORAGE_KEY = "se_mock_relatorios";

export const TIPOS = [
  { valor: "projetos", rotulo: "Andamento dos projetos" },
  { valor: "diarios", rotulo: "Diário de obra consolidado" },
  { valor: "orcamentos", rotulo: "Orçamentos emitidos" },
];
export const ROTULO_TIPO = Object.fromEntries(TIPOS.map((t) => [t.valor, t.rotulo]));

// ---- Adaptador ----

function normalizar(r) {
  return {
    id: r.id,
    tipo: r.tipo ?? "projetos",
    titulo: r.titulo ?? r.nome ?? ROTULO_TIPO[r.tipo] ?? "Relatório",
    projeto: r.projeto?.nome ?? r.projeto ?? "Todos os projetos",
    de: String(r.de ?? r.periodoInicio ?? "").slice(0, 10),
    ate: String(r.ate ?? r.periodoFim ?? "").slice(0, 10),
    criadoEm: String(r.criadoEm ?? r.createdAt ?? "").slice(0, 10),
    formato: r.formato ?? "csv",
    conteudo: r.conteudo, // só no modo mock
  };
}

// ---- CSV (modo mock) ----

const celula = (v) => {
  const s = String(v ?? "");
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
// ";" e BOM para o Excel brasileiro abrir com acentos e colunas certas
const csv = (cabecalho, linhas) =>
  "﻿" + [cabecalho, ...linhas].map((l) => l.map(celula).join(";")).join("\r\n");

const dentro = (data, de, ate) => (!de || data >= de) && (!ate || data <= ate);

async function montarCsv({ tipo, projeto, de, ate }) {
  const todos = projeto === "todos";
  if (tipo === "projetos") {
    const ps = await listarProjetos();
    return csv(
      ["Projeto", "Cliente", "Engenheiro", "Localização", "Situação", "Prioridade", "Progresso (%)", "Início"],
      ps
        .filter((p) => (todos || p.titulo === projeto) && dentro(p.dataInicio, de, ate))
        .map((p) => [p.titulo, p.cliente, p.engenheiro, p.localizacao, p.status, p.prioridade, p.progresso ?? "", p.dataInicio])
    );
  }
  if (tipo === "diarios") {
    const ds = await listarDiarios();
    return csv(
      ["Data", "Projeto", "Atividade", "Clima", "Registrado por", "Relato", "Fotos"],
      ds
        .filter((d) => (todos || d.projeto === projeto) && dentro(d.data, de, ate))
        .sort((a, b) => a.data.localeCompare(b.data))
        .map((d) => [d.data, d.projeto, d.atividade, d.clima, d.autor, d.relato, d.fotos.length])
    );
  }
  const os = await listarOrcamentos();
  return csv(
    ["Número", "Projeto", "Cliente", "Criado em", "Validade", "Itens", "Total (R$)", "Situação"],
    os
      .filter((o) => (todos || o.projeto === projeto) && dentro(o.criadoEm, de, ate))
      .map((o) => [o.numero, o.projeto, o.cliente, o.criadoEm, o.validade, o.itens.length, totais(o).total.toFixed(2).replace(".", ","), o.status])
  );
}

function ler() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) return JSON.parse(salvo);
  } catch {
    // sem armazenamento
  }
  return [];
}

function gravar(lista) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    throw new Error("Não foi possível guardar o relatório (armazenamento do navegador cheio).");
  }
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Funções usadas pelas telas ----

export async function listarRelatorios() {
  if (USE_MOCK) {
    await esperar(400);
    return ler().map(normalizar);
  }
  const resposta = await request(RELATORIOS_PATH, { token: getToken() });
  const lista = Array.isArray(resposta) ? resposta : resposta?.relatorios ?? resposta?.data ?? [];
  return lista.map(normalizar);
}

// dados: { tipo, projeto ("todos" ou o nome), de, ate }
export async function gerarRelatorio(dados) {
  if (USE_MOCK) {
    await esperar(600);
    const conteudo = await montarCsv(dados);
    const lista = ler();
    lista.unshift({
      id: Date.now(),
      tipo: dados.tipo,
      titulo: ROTULO_TIPO[dados.tipo],
      projeto: dados.projeto === "todos" ? "Todos os projetos" : dados.projeto,
      de: dados.de,
      ate: dados.ate,
      criadoEm: new Date().toISOString().slice(0, 10),
      formato: "csv",
      conteudo,
    });
    gravar(lista);
    return;
  }
  // (*) corpo assumido
  await request(RELATORIOS_PATH, {
    method: "POST",
    token: getToken(),
    body: { tipo: dados.tipo, projeto: dados.projeto === "todos" ? null : dados.projeto, de: dados.de || null, ate: dados.ate || null },
  });
}

function salvarArquivo(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function baixarRelatorio(r) {
  const nome = `${r.tipo}-${r.criadoEm || "relatorio"}.${r.formato}`;
  if (USE_MOCK) {
    salvarArquivo(new Blob([r.conteudo ?? ""], { type: "text/csv;charset=utf-8" }), nome);
    return;
  }
  salvarArquivo(await requestBlob(DOWNLOAD_PATH(r.id), { token: getToken() }), nome);
}

export async function excluirRelatorio(id) {
  if (USE_MOCK) {
    gravar(ler().filter((r) => r.id !== id));
    return;
  }
  await request(`${RELATORIOS_PATH}/${id}`, { method: "DELETE", token: getToken() });
}
