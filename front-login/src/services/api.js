// Cliente HTTP único do front. Nenhuma tela chama fetch direto:
// isso facilita reaproveitar no React Native depois.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
let callbackNaoAutorizado = null;

export function onNaoAutorizado(callback) {
  callbackNaoAutorizado = callback;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// body pode ser um objeto (vai como JSON) ou um FormData (envio de arquivos).
export async function request(path, { method = "GET", body, token } = {}) {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  // Com FormData o navegador define o Content-Type sozinho (com o "boundary").
  const headers = isForm ? {} : { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua internet.",
      0
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // resposta sem corpo JSON
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      callbackNaoAutorizado?.();
    }
    // O back-end do grupo responde com "mensagem"; aceitamos também "message" e "error".
    const message =
      data?.mensagem ||
      data?.message ||
      data?.error ||
      "Algo deu errado. Tente novamente.";
    throw new ApiError(message, response.status);
  }

  return data;
}

// Baixa um arquivo (PDF, CSV...) e devolve um Blob. Usado pelos relatórios.
export async function requestBlob(path, { token } = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { headers });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor. Verifique sua internet.", 0);
  }
  if (!response.ok) throw new ApiError("Não foi possível baixar o arquivo.", response.status);
  return response.blob();
}
