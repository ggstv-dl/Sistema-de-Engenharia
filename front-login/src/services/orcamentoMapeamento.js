export function converterValor(texto) {
  const entrada = typeof texto === "number" ? String(texto) : typeof texto === "string" ? texto.trim() : "";
  let normalizado;

  if (/^\d+(?:[.,]\d{1,2})?$/.test(entrada)) {
    normalizado = entrada.replace(",", ".");
  } else if (/^\d{1,3}(?:\.\d{3})+,\d{1,2}$/.test(entrada)) {
    normalizado = entrada.replace(/\./g, "").replace(",", ".");
  } else {
    throw new Error("Informe um valor válido, com no máximo duas casas decimais.");
  }

  const valor = Number(normalizado);
  if (!Number.isFinite(valor) || valor <= 0 || valor > 999999999.99) {
    throw new Error("O valor deve ser maior que zero e no máximo 999999999,99.");
  }
  return valor;
}

export function montarCorpoOrcamento({ nome, descricao, valor }) {
  if (typeof nome !== "string" || nome.trim().length < 3 || nome.trim().length > 150) {
    throw new Error("O nome deve ter entre 3 e 150 caracteres.");
  }
  if (descricao !== undefined && (typeof descricao !== "string" || descricao.trim().length > 2000)) {
    throw new Error("A descrição deve ser um texto de até 2000 caracteres.");
  }

  return {
    nome: nome.trim(),
    ...(descricao?.trim() ? { descricao: descricao.trim() } : {}),
    valor: converterValor(valor),
  };
}

export function normalizarOrcamento(itemDaApi) {
  const data = itemDaApi.dataCriacao ? new Date(itemDaApi.dataCriacao) : null;
  return {
    id: itemDaApi.id,
    projetoId: itemDaApi.projetoId ?? itemDaApi.projeto?.id ?? "",
    nome: itemDaApi.nome,
    descricao: itemDaApi.descricao ?? "",
    valor: itemDaApi.valor,
    projeto: itemDaApi.projeto?.titulo ?? "",
    cliente: itemDaApi.projeto?.cliente?.nome ?? "",
    telefone: itemDaApi.projeto?.cliente?.telefone ?? "",
    criadoEm: data && !Number.isNaN(data.getTime()) ? data.toLocaleDateString("pt-BR") : "",
  };
}
