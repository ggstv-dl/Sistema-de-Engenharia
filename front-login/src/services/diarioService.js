import { ApiError, request } from "./api";
import { getToken } from "./authService";
import { montarCorpoRdo, normalizarDiario, resolverUrlArquivo } from "./diarioMapeamento";

// Com VITE_USE_MOCK=true usa dados de exemplo (salvos no navegador, então o que
// você registrar continua depois de recarregar a página).
// Com false, chama a API real.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const URL_BASE_API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const LISTAR_PATH = "/api/diarios";
const SYNC_PATH = "/api/rdo/sync";
const ARQUIVOS_PATH = (projetoId) => `/api/projetos/${projetoId}/arquivos`;

const STORAGE_KEY = "se_mock_diarios";

export const MAX_FOTOS = 10;
export const MAX_FOTO_MB = 10;

export const CLIMAS = [
  { valor: "ensolarado", rotulo: "Ensolarado" },
  { valor: "nublado", rotulo: "Nublado" },
  { valor: "chuvoso", rotulo: "Chuvoso" },
];

// Sugestões para os campos de mão de obra e equipamentos (dá para digitar outro nome).
export const FUNCOES = ["Pedreiros", "Ajudantes", "Eletricistas", "Carpinteiros", "Armadores", "Encanadores", "Pintores"];
export const EQUIPAMENTOS = ["Betoneira", "Vibrador de Imersão", "Retroescavadeira", "Guincho", "Serra Circular", "Andaime"];

export function urlDoArquivo(caminho) {
  return resolverUrlArquivo(caminho, URL_BASE_API);
}

export function validarFoto(arquivo) {
  const erros = [];
  if (!/\.(jpe?g|png)$/i.test(arquivo.name)) {
    erros.push(`"${arquivo.name}": use apenas arquivos .jpg, .jpeg ou .png.`);
  }
  if (arquivo.size > MAX_FOTO_MB * 1024 * 1024) {
    erros.push(`"${arquivo.name}": o tamanho máximo é ${MAX_FOTO_MB} MB.`);
  }
  return erros.join(" ");
}

// ---- Fotos ----

// Reduz a foto (lado maior de 720 px, JPEG) para caber no armazenamento do navegador.
export function reduzirImagem(file, ladoMax = 720, qualidade = 0.7) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, ladoMax / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * escala));
      canvas.height = Math.max(1, Math.round(img.height * escala));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", qualidade));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Não foi possível ler a foto "${file.name}".`));
    };
    img.src = url;
  });
}

// ---- Dados de exemplo ----

// Fotos de exemplo: blocos cinza com um rótulo (como no protótipo).
function fotoExemplo(rotulo, a = "#8a8f98", b = "#5d636d") {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs>` +
    `<rect width='320' height='240' fill='url(#g)'/>` +
    `<text x='160' y='128' font-family='sans-serif' font-size='22' fill='white' text-anchor='middle'>${rotulo}</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

const EXEMPLO = [
  {
    id: 101, projetoId: 1, projeto: "Residencial Flora", atividade: "Concretagem",
    data: "2026-10-22", hora: "14:30", autor: "Eng. Carlos", clima: "ensolarado",
    relato: "Iniciado o processo de concretagem da laje do 4º pavimento. Equipe de 12 operários presente. Sem intercorrências graves. Verificado o nível de umidade do concreto antes da aplicação.",
    observacoes: "Próxima concretagem prevista para a laje da cobertura.",
    maoDeObra: [{ funcao: "Pedreiros", qtd: 8 }, { funcao: "Ajudantes", qtd: 4 }, { funcao: "Eletricistas", qtd: 2 }],
    equipamentos: [{ nome: "Betoneira", qtd: 1 }, { nome: "Vibrador de Imersão", qtd: 2 }],
    fotos: [fotoExemplo("Laje 4º pav."), fotoExemplo("Concretagem"), fotoExemplo("Equipe"), fotoExemplo("Teste de umidade")],
  },
  {
    id: 102, projetoId: 2, projeto: "Edifício Alpha", atividade: "Escavação",
    data: "2026-10-21", hora: "17:00", autor: "Mestre João", clima: "chuvoso",
    relato: "Atividades suspensas no período da tarde devido à chuva intensa. Manhã focada na limpeza do terreno e preparação das estacas.",
    observacoes: "", maoDeObra: [], equipamentos: [], fotos: [],
  },
  {
    id: 103, projetoId: 3, projeto: "Condomínio Porto Belo", atividade: "Alvenaria do bloco B",
    data: "2026-10-20", hora: "16:45", autor: "Eng. Maria", clima: "nublado",
    relato: "Elevação da alvenaria do 2º pavimento do bloco B até a altura de 1,20 m. Conferido o prumo e o nível das fiadas. Material do dia seguinte já separado no canteiro.",
    observacoes: "Falta de 200 blocos para fechar o pavimento: pedido feito ao fornecedor.",
    maoDeObra: [{ funcao: "Pedreiros", qtd: 6 }, { funcao: "Ajudantes", qtd: 3 }],
    equipamentos: [{ nome: "Andaime", qtd: 4 }],
    fotos: [fotoExemplo("Bloco B")],
  },
  {
    id: 104, projetoId: 6, projeto: "Ponte Rio Verde", atividade: "Armação dos pilares",
    data: "2026-10-19", hora: "15:10", autor: "Eng. Ricardo", clima: "ensolarado",
    relato: "Montagem da armação dos pilares P3 e P4 conforme projeto estrutural. Conferência dos espaçadores e das amarrações antes da liberação para a forma.",
    observacoes: "", maoDeObra: [{ funcao: "Armadores", qtd: 5 }, { funcao: "Ajudantes", qtd: 2 }],
    equipamentos: [], fotos: [fotoExemplo("Pilar P3"), fotoExemplo("Pilar P4")],
  },
  {
    id: 105, projetoId: 5, projeto: "Galpão Norte", atividade: "Fundação",
    data: "2026-10-16", hora: "09:20", autor: "Eng. Ricardo", clima: "ensolarado",
    relato: "Escavação das sapatas S1 a S8 concluída. Aguardando a visita do projetista para liberar a concretagem do lastro.",
    observacoes: "", maoDeObra: [{ funcao: "Ajudantes", qtd: 5 }],
    equipamentos: [{ nome: "Retroescavadeira", qtd: 1 }], fotos: [],
  },
  {
    id: 106, projetoId: 10, projeto: "Clínica São Lucas", atividade: "Instalações elétricas",
    data: "2026-10-15", hora: "11:05", autor: "Eng. Carlos", clima: "nublado",
    relato: "Passagem de eletrodutos no térreo e instalação das caixas de embutir. Teste de continuidade nos circuitos da ala norte sem falhas.",
    observacoes: "", maoDeObra: [{ funcao: "Eletricistas", qtd: 4 }],
    equipamentos: [], fotos: [fotoExemplo("Eletrodutos")],
  },
];

function lerExemplo() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) return JSON.parse(salvo);
  } catch {
    // sem armazenamento: usa os dados originais
  }
  return EXEMPLO.map((d) => ({ ...d }));
}

function gravarExemplo(lista) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    throw new Error(
      "O armazenamento do navegador está cheio. Remova algumas fotos e tente de novo."
    );
  }
}

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- Funções usadas pelas telas ----

export async function listarDiarios() {
  if (USE_MOCK) {
    await esperar(500);
    return lerExemplo()
      .map((item) => normalizarDiario(item, URL_BASE_API))
      .sort((a, b) => `${b.data} ${b.hora}`.localeCompare(`${a.data} ${a.hora}`));
  }
  const resposta = await request(LISTAR_PATH, { token: getToken() });
  const lista = Array.isArray(resposta)
    ? resposta
    : resposta?.diarios ?? resposta?.data ?? [];
  return lista.map((item) => normalizarDiario(item, URL_BASE_API));
}

export async function salvarDiario(dados, { fotosEnviadas = new Map(), onProgresso } = {}) {
  const fotos = (dados.fotos ?? []).map((foto) => ({
    id: foto.id ?? foto,
    arquivo: foto.file ?? foto,
  }));
  const errosFotos = fotos.map((foto) => validarFoto(foto.arquivo)).filter(Boolean);
  if (fotos.length > MAX_FOTOS) errosFotos.push(`Selecione no máximo ${MAX_FOTOS} fotos.`);
  if (errosFotos.length) throw new ApiError(errosFotos.join(" "), 400);

  if (USE_MOCK) {
    await esperar(400);
    const imagens = await Promise.all(fotos.map((foto) => reduzirImagem(foto.arquivo)));
    const agora = new Date();
    const registro = {
      id: Date.now(),
      projetoId: dados.projetoId,
      projeto: dados.projeto,
      atividade: dados.atividade,
      data: dados.data,
      hora: agora.toTimeString().slice(0, 5),
      autor: dados.autor,
      clima: dados.clima,
      relato: dados.descricao,
      observacoes: dados.observacoes,
      maoDeObra: dados.maoDeObra,
      equipamentos: dados.equipamentos,
      fotos: imagens,
    };
    gravarExemplo([registro, ...lerExemplo()]);
    return;
  }

  const token = getToken();
  const projetoId = String(dados.projetoId);
  const caminhos = [];

  for (const [indice, foto] of fotos.entries()) {
    const enviada = fotosEnviadas.get(foto.id);
    if (enviada?.projetoId === projetoId) {
      caminhos.push(enviada.caminho);
      continue;
    }
    onProgresso?.(`Enviando foto ${indice + 1} de ${fotos.length}…`);
    const form = new FormData();
    form.append("arquivo", foto.arquivo);
    try {
      const arquivo = await request(ARQUIVOS_PATH(projetoId), { method: "POST", body: form, token });
      if (typeof arquivo?.caminho !== "string" || !arquivo.caminho.startsWith("/uploads/")) {
        throw new ApiError("O servidor não devolveu o caminho da foto.", 502);
      }
      fotosEnviadas.set(foto.id, { projetoId, caminho: arquivo.caminho });
      caminhos.push(arquivo.caminho);
    } catch (err) {
      throw new ApiError(`Falha ao enviar a foto ${foto.arquivo.name}: ${err.message}`, err.status ?? 0);
    }
  }

  onProgresso?.("Salvando registro…");
  return request(SYNC_PATH, { method: "POST", body: montarCorpoRdo(dados, caminhos), token });
}
