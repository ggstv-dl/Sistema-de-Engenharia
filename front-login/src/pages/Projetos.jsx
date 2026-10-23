import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  listarProjetos,
  salvarProjeto,
  STATUS,
  PRIORIDADES,
} from "../services/projetosService";
import { getUser } from "../services/authService";
import { IconPlus, IconSearch, IconPencil, IconClose } from "../components/icons";
import "../styles/projetos.css";

const POR_PAGINA = 6;

const rotuloStatus = Object.fromEntries(STATUS.map((s) => [s.valor, s.rotulo]));
const rotuloPrioridade = Object.fromEntries(
  PRIORIDADES.map((p) => [p.valor, p.rotulo])
);

function formatarData(iso) {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
}

function Progresso({ valor, nome }) {
  if (valor == null) return <span className="cell-sub">—</span>;
  return (
    <div className="prog">
      <div
        className="meter"
        role="progressbar"
        aria-label={`Progresso de ${nome}`}
        aria-valuenow={valor}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${valor}%` }} />
      </div>
      <span className="prog-num">{valor}%</span>
    </div>
  );
}

function Campo({ id, rotulo, erro, className = "", children }) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{rotulo}</label>
      {children}
      {erro && (
        <span className="error" role="alert">
          {erro}
        </span>
      )}
    </div>
  );
}

function ProjetoModal({ projeto, onClose, onSalvo }) {
  const ref = useRef(null);
  const editando = Boolean(projeto);

  const [form, setForm] = useState(() => ({
    titulo: projeto?.titulo ?? "",
    cliente: projeto?.cliente ?? "",
    engenheiro: projeto?.engenheiro ?? getUser()?.nome ?? "",
    localizacao: projeto?.localizacao ?? "",
    status: projeto?.status ?? "planejamento",
    prioridade: projeto?.prioridade ?? "media",
    dataInicio: projeto?.dataInicio || new Date().toISOString().slice(0, 10),
  }));
  const [erros, setErros] = useState({});
  const [erroServidor, setErroServidor] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  const mudar = (campo) => (e) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    setErroServidor("");

    const novos = {};
    if (form.titulo.trim().length < 3)
      novos.titulo = "Informe o nome do projeto (mínimo 3 letras).";
    if (!form.cliente.trim()) novos.cliente = "Informe o cliente.";
    if (!form.engenheiro.trim())
      novos.engenheiro = "Informe o engenheiro responsável.";
    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    setSalvando(true);
    try {
      await salvarProjeto({
        ...form,
        titulo: form.titulo.trim(),
        cliente: form.cliente.trim(),
        engenheiro: form.engenheiro.trim(),
        localizacao: form.localizacao.trim(),
        id: projeto?.id,
      });
      onSalvo();
    } catch (err) {
      setErroServidor(err.message || "Não foi possível salvar o projeto.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-titulo"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close();
      }}
    >
      <form onSubmit={enviar} noValidate>
        <header className="modal-header">
          <h2 id="modal-titulo">{editando ? "Editar Projeto" : "Novo Projeto"}</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Fechar"
            onClick={() => ref.current.close()}
          >
            <IconClose size={18} />
          </button>
        </header>

        <div className="modal-body form-grid">
          <Campo id="titulo" rotulo="Nome do projeto" erro={erros.titulo} className="span-2">
            <input
              id="titulo"
              type="text"
              value={form.titulo}
              onChange={mudar("titulo")}
              aria-invalid={Boolean(erros.titulo)}
              disabled={salvando}
            />
          </Campo>

          <Campo id="cliente" rotulo="Cliente" erro={erros.cliente}>
            <input
              id="cliente"
              type="text"
              value={form.cliente}
              onChange={mudar("cliente")}
              aria-invalid={Boolean(erros.cliente)}
              disabled={salvando}
            />
          </Campo>

          <Campo id="engenheiro" rotulo="Engenheiro responsável" erro={erros.engenheiro}>
            <input
              id="engenheiro"
              type="text"
              value={form.engenheiro}
              onChange={mudar("engenheiro")}
              aria-invalid={Boolean(erros.engenheiro)}
              disabled={salvando}
            />
          </Campo>

          <Campo id="localizacao" rotulo="Localização" className="span-2">
            <input
              id="localizacao"
              type="text"
              placeholder="Cidade, UF"
              value={form.localizacao}
              onChange={mudar("localizacao")}
              disabled={salvando}
            />
          </Campo>

          <Campo id="status" rotulo="Status">
            <select
              id="status"
              value={form.status}
              onChange={mudar("status")}
              disabled={salvando}
            >
              {STATUS.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.rotulo}
                </option>
              ))}
            </select>
          </Campo>

          <Campo id="prioridade" rotulo="Prioridade">
            <select
              id="prioridade"
              value={form.prioridade}
              onChange={mudar("prioridade")}
              disabled={salvando}
            >
              {PRIORIDADES.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.rotulo}
                </option>
              ))}
            </select>
          </Campo>

          <Campo id="dataInicio" rotulo="Data de início">
            <input
              id="dataInicio"
              type="date"
              value={form.dataInicio}
              onChange={mudar("dataInicio")}
              disabled={salvando}
            />
          </Campo>
        </div>

        {erroServidor && (
          <div className="server-error modal-erro" role="alert">
            {erroServidor}
          </div>
        )}

        <footer className="modal-footer">
          <button type="button" className="btn" onClick={() => ref.current.close()}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

export default function Projetos() {
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [prioridade, setPrioridade] = useState("todas");
  const [engenheiro, setEngenheiro] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const [modal, setModal] = useState(null); // null | { projeto } (projeto vazio = novo)

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setProjetos(await listarProjetos());
    } catch (err) {
      setErro(err.message || "Não foi possível carregar os projetos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const engenheiros = useMemo(
    () =>
      [...new Set(projetos.map((p) => p.engenheiro).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b, "pt-BR")
      ),
    [projetos]
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return projetos.filter(
      (p) =>
        (status === "todos" || p.status === status) &&
        (prioridade === "todas" || p.prioridade === prioridade) &&
        (engenheiro === "todos" || p.engenheiro === engenheiro) &&
        (!termo ||
          [p.titulo, p.cliente, p.engenheiro, p.localizacao]
            .join(" ")
            .toLowerCase()
            .includes(termo))
    );
  }, [projetos, busca, status, prioridade, engenheiro]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice(
    (paginaAtual - 1) * POR_PAGINA,
    paginaAtual * POR_PAGINA
  );

  const temFiltro =
    busca.trim() !== "" ||
    status !== "todos" ||
    prioridade !== "todas" ||
    engenheiro !== "todos";

  function limparFiltros() {
    setBusca("");
    setStatus("todos");
    setPrioridade("todas");
    setEngenheiro("todos");
    setPagina(1);
  }

  function aoSalvar() {
    setModal(null);
    carregar();
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Projetos</h1>
          <p className="page-subtitle">Gerencie todas as obras em andamento</p>
        </div>
        <div className="page-actions">
          <div className="search">
            <label htmlFor="busca" className="sr-only">
              Buscar projetos
            </label>
            <span className="search-icon">
              <IconSearch size={18} />
            </span>
            <input
              id="busca"
              type="search"
              placeholder="Buscar projetos"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setModal({ projeto: null })}
          >
            <IconPlus size={18} />
            Novo Projeto
          </button>
        </div>
      </header>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filtrar por status">
          {[{ valor: "todos", rotulo: "Todos" }, ...STATUS].map((s) => (
            <button
              key={s.valor}
              type="button"
              className="chip"
              aria-pressed={status === s.valor}
              onClick={() => {
                setStatus(s.valor);
                setPagina(1);
              }}
            >
              {s.rotulo}
            </button>
          ))}
        </div>

        <div className="selects">
          <label className="select-label">
            <span>Prioridade</span>
            <select
              className="select"
              value={prioridade}
              onChange={(e) => {
                setPrioridade(e.target.value);
                setPagina(1);
              }}
            >
              <option value="todas">Todas</option>
              {PRIORIDADES.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="select-label">
            <span>Engenheiro</span>
            <select
              className="select"
              value={engenheiro}
              onChange={(e) => {
                setEngenheiro(e.target.value);
                setPagina(1);
              }}
            >
              <option value="todos">Todos</option>
              {engenheiros.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {carregando && (
        <div className="card" aria-busy="true" aria-label="Carregando projetos">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-row" />
          ))}
        </div>
      )}

      {!carregando && erro && (
        <div className="card state state-error" role="alert">
          <p>{erro}</p>
          <button type="button" className="btn" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      )}

      {!carregando && !erro && projetos.length === 0 && (
        <div className="card state">
          <p>Nenhum projeto cadastrado.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setModal({ projeto: null })}
          >
            Criar primeiro projeto
          </button>
        </div>
      )}

      {!carregando && !erro && projetos.length > 0 && filtrados.length === 0 && (
        <div className="card state">
          <p>Nenhum projeto encontrado com os filtros aplicados.</p>
          {temFiltro && (
            <button type="button" className="btn" onClick={limparFiltros}>
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {!carregando && !erro && filtrados.length > 0 && (
        <section className="card table-card">
          <div className="table-wrap">
            <table className="tabela">
              <caption className="sr-only">Lista de projetos</caption>
              <thead>
                <tr>
                  <th scope="col">Nome do Projeto</th>
                  <th scope="col">Engenheiro</th>
                  <th scope="col">Status</th>
                  <th scope="col">Prioridade</th>
                  <th scope="col">Progresso</th>
                  <th scope="col">Data Início</th>
                  <th scope="col">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.titulo}</strong>
                      <span className="cell-sub">
                        {[p.cliente, p.localizacao].filter(Boolean).join(" • ")}
                      </span>
                    </td>
                    <td>{p.engenheiro || "—"}</td>
                    <td>
                      <span className={`badge badge-${p.status}`}>
                        {rotuloStatus[p.status] ?? p.status}
                      </span>
                    </td>
                    <td>
                      <span className={`prio prio-${p.prioridade}`}>
                        {rotuloPrioridade[p.prioridade] ?? p.prioridade}
                      </span>
                    </td>
                    <td>
                      <Progresso valor={p.progresso} nome={p.titulo} />
                    </td>
                    <td>{formatarData(p.dataInicio)}</td>
                    <td>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`Editar ${p.titulo}`}
                        onClick={() => setModal({ projeto: p })}
                      >
                        <IconPencil size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span className="cell-sub">
              Mostrando {visiveis.length} de {filtrados.length} projetos
            </span>
            <div className="pager">
              <button
                type="button"
                className="btn"
                disabled={paginaAtual <= 1}
                onClick={() => setPagina(paginaAtual - 1)}
              >
                Anterior
              </button>
              <span className="pager-info">
                {paginaAtual} / {totalPaginas}
              </span>
              <button
                type="button"
                className="btn"
                disabled={paginaAtual >= totalPaginas}
                onClick={() => setPagina(paginaAtual + 1)}
              >
                Próximo
              </button>
            </div>
          </div>
        </section>
      )}

      {modal && (
        <ProjetoModal
          projeto={modal.projeto}
          onClose={() => setModal(null)}
          onSalvo={aoSalvar}
        />
      )}
    </>
  );
}
