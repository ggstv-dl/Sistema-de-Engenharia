const texto = (valor) => String(valor ?? "").trim();

function normalizarLinhas(linhas, campo) {
  return (Array.isArray(linhas) ? linhas : [])
    .map((item) => ({ [campo]: texto(item[campo]), qtd: Number(item.qtd) }))
    .filter((item) =>
      item[campo].length >= 1 && item[campo].length <= 60 &&
      Number.isInteger(item.qtd) && item.qtd >= 1 && item.qtd <= 1000
    );
}

export function montarCorpoRdo(formulario, caminhosDasFotos = []) {
  const corpo = {
    projetoId: texto(formulario.projetoId ?? formulario.obraId),
    data: texto(formulario.data).slice(0, 10),
    descricao: texto(formulario.descricao ?? formulario.anotacoes ?? formulario.relato),
  };

  for (const campo of ["atividade", "clima", "observacoes"]) {
    const valor = texto(formulario[campo]);
    if (valor) corpo[campo] = valor;
  }

  const maoDeObra = normalizarLinhas(formulario.maoDeObra, "funcao");
  const equipamentos = normalizarLinhas(formulario.equipamentos, "nome");
  if (maoDeObra.length) corpo.maoDeObra = maoDeObra;
  if (equipamentos.length) corpo.equipamentos = equipamentos;
  if (caminhosDasFotos.length) corpo.fotos = [...caminhosDasFotos];
  return corpo;
}

export function resolverUrlArquivo(caminho, urlBaseDaApi) {
  return caminho.startsWith("/uploads/")
    ? `${urlBaseDaApi.replace(/\/+$/, "")}${caminho}`
    : caminho;
}

export function normalizarDiario(itemDaApi, urlBaseDaApi) {
  const criado = itemDaApi.criadoEm ? new Date(itemDaApi.criadoEm) : null;
  return {
    id: itemDaApi.id,
    projetoId: itemDaApi.projetoId ?? itemDaApi.projeto?.id ?? null,
    projeto: typeof itemDaApi.projeto === "string"
      ? itemDaApi.projeto
      : itemDaApi.projeto?.titulo ?? "(sem projeto)",
    atividade: itemDaApi.atividade ?? "",
    data: String(itemDaApi.data ?? "").slice(0, 10),
    hora: criado && !Number.isNaN(criado.getTime())
      ? criado.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : itemDaApi.hora ?? "",
    autor: itemDaApi.engenheiro?.nome ?? itemDaApi.autor ?? "",
    clima: itemDaApi.clima ?? "",
    relato: itemDaApi.descricao ?? itemDaApi.relato ?? "",
    observacoes: itemDaApi.observacoes ?? "",
    maoDeObra: Array.isArray(itemDaApi.maoDeObra) ? itemDaApi.maoDeObra : [],
    equipamentos: Array.isArray(itemDaApi.equipamentos) ? itemDaApi.equipamentos : [],
    fotos: (Array.isArray(itemDaApi.fotos) ? itemDaApi.fotos : [])
      .filter((foto) => typeof foto === "string" && foto)
      .map((foto) => resolverUrlArquivo(foto, urlBaseDaApi)),
  };
}
