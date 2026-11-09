import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  listarProjetos,
  salvarProjeto,
  STATUS,
  PRIORIDADES,
} from "../services/projetosService";
import { getUser } from "../services/authService";
import { criarCliente, listarClientes } from "../services/clientesService";
import { IconPlus, IconSearch, IconPencil, IconClose } from "../components/icons";
import "../styles/projetos.css";

const POR_PAGINA = 6;
const NOVO_CLIENTE = "__novo_cliente__";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clienteVazio = () => ({ nome: "", email: "", telefone: "" });

const rotuloStatus = Object.fromEntries(STATUS.map((s) => [s.valor, s.rotulo]));
const rotuloPrioridade = Object.fromEntries(
  PRIORIDADES.map((p) => [p.valor, p.rotulo])
);

// Data de hoje no fuso do computador (toISOString usaria UTC e viraria o dia à noite).
function hojeLocal() {
  const d = new Date();
  const dois = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

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
        <span id={`${id}-erro`} className="error" role="alert">
          {erro}
        </span>
      )}
    </div>
  );
}

function ProjetoModal({ projeto, onClose, onSalvo }) {
  const ref = useRef(null);
  const editando = Boolean(projeto?.id);

  const [form, setForm] = useState(() => ({
    titulo: projeto?.titulo ?? "",
    cliente: projeto?.cliente ?? "",
    clienteId: projeto?.clienteId ?? "",
    engenheiro: getUser()?.nome ?? "",
    localizacao: projeto?.localizacao ?? "",
    status: projeto?.status ?? "planejamento",
    prioridade: projeto?.prioridade ?? "media",
    dataInicio: projeto?.dataInicio || hojeLocal(),
  }));
  const [erros, setErros] = useState({});
  const [erroServidor, setErroServidor] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [carregandoClientes, setCarregandoClientes] = useState(!editando);
  const [erroClientes, setErroClientes] = useState("");
  const [novoClienteAberto, setNovoClienteAberto] = useState(false);
  const [formCliente, setFormCliente] = useState(clienteVazio);
  const [errosCliente, setErrosCliente] = useState({});
  const [erroClienteServidor, setErroClienteServidor] = useState("");
  const [salvandoCliente, setSalvandoCliente] = useState(false);
  const ocupado = salvando || salvandoCliente;

  const carregarClientes = useCallback(async () => {
    setCarregandoClientes(true);
    setErroClientes("");
    try {
      setClientes(await listarClientes());
    } catch (err) {
      setErroClientes(err.message || "Não foi possível carregar os clientes.");
    } finally {
      setCarregandoClientes(false);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  useEffect(() => {
    if (!editando) carregarClientes();
  }, [editando, carregarClientes]);

  const mudar = (campo) => (e) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  function selecionarCliente(e) {
    const valor = e.target.value;
    const novo = valor === NOVO_CLIENTE;
    setNovoClienteAberto(novo);
    setFormCliente(clienteVazio());
    setErrosCliente({});
    setErroClienteServidor("");
    setErros((atuais) => ({ ...atuais, cliente: "" }));
    const cliente = clientes.find((item) => String(item.id) === valor);
    setForm((atual) => ({
      ...atual,
      clienteId: novo ? "" : valor,
      cliente: cliente?.nome ?? "",
    }));
  }

  function cancelarNovoCliente() {
    setNovoClienteAberto(false);
    setFormCliente(clienteVazio());
    setErrosCliente({});
    setErroClienteServidor("");
    setForm((atual) => ({ ...atual, clienteId: "", cliente: "" }));
  }

  async function salvarCliente() {
    if (ocupado) return;
    setErroClienteServidor("");
    const dados = {
      nome: formCliente.nome.trim(),
      email: formCliente.email.trim().toLowerCase(),
      telefone: formCliente.telefone.trim(),
    };
    const novos = {};
    if (dados.nome.length < 2 || dados.nome.length > 100)
      novos.nome = "O nome deve ter entre 2 e 100 caracteres.";
    if (dados.email.length > 254 || !EMAIL_REGEX.test(dados.email))
      novos.email = "Informe um endereço de e-mail válido.";
    const digitos = dados.telefone.replace(/\D/g, "");
    if (digitos.length < 10 || digitos.length > 13)
      novos.telefone = "O telefone deve conter de 10 a 13 dígitos.";
    setErrosCliente(novos);
    if (Object.keys(novos).length > 0) return;

    setSalvandoCliente(true);
    try {
      const cliente = await criarCliente(dados);
      setClientes((atuais) => [...atuais, cliente]);
      setForm((atual) => ({ ...atual, clienteId: String(cliente.id), cliente: cliente.nome }));
      setErros((atuais) => ({ ...atuais, cliente: "" }));
      setNovoClienteAberto(false);
      setFormCliente(clienteVazio());
    } catch (err) {
      setErroClienteServidor(
        err.status === 409
          ? "Já existe um cliente com este e-mail."
          : err.message || "Não foi possível salvar o cliente."
      );
    } finally {
      setSalvandoCliente(false);
    }
  }

  async function enviar(e) {
    e.preventDefault();
    if (ocupado || novoClienteAberto || (!editando && (carregandoClientes || erroClientes))) return;
    setErroServidor("");

    const novos = {};
    if (form.titulo.trim().length < 3)
      novos.titulo = "Informe o nome do projeto (mínimo 3 letras).";
    if (!editando && !form.clienteId) novos.cliente = "Selecione um cliente.";
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
      onCancel={(e) => {
        if (ocupado) e.preventDefault();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !ocupado) ref.current.close();
      }}
    >
      <form onSubmit={enviar} noValidate>
        <header className="modal-header">
          <h2 id="modal-titulo">{editando ? "Editar Projeto" : "Novo Projeto"}</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Fechar"
            disabled={ocupado}
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
              disabled={ocupado}
            />
          </Campo>

          <Campo id="cliente" rotulo="Cliente" erro={erros.cliente}>
            {editando ? (
              <input id="cliente" type="text" value={form.cliente} disabled />
            ) : (
              <>
                <select
                  id="cliente"
                  value={novoClienteAberto ? NOVO_CLIENTE : form.clienteId}
                  onChange={selecionarCliente}
                  disabled={ocupado || carregandoClientes || Boolean(erroClientes)}
                  aria-busy={carregandoClientes}
                  aria-invalid={Boolean(erros.cliente || erroClientes)}
                  aria-describedby={erroClientes ? "clientes-erro" : erros.cliente ? "cliente-erro" : undefined}
                >
                  <option value="">{carregandoClientes ? "Carregando clientes…" : "Selecione um cliente"}</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                  ))}
                  <option value={NOVO_CLIENTE}>+ Novo cliente</option>
                </select>
                {erroClientes && (
                  <>
                    <span id="clientes-erro" className="error" role="alert">{erroClientes}</span>
                    <button type="button" className="btn" onClick={carregarClientes} disabled={ocupado}>
                      Tentar de novo
                    </button>
                  </>
                )}
              </>
            )}
          </Campo>

          <Campo id="engenheiro" rotulo="Engenheiro responsável">
            <input
              id="engenheiro"
              type="text"
              value={form.engenheiro}
              disabled
            />
          </Campo>

          {novoClienteAberto && (
            <div
              className="span-2 form-grid"
              role="group"
              aria-labelledby="novo-cliente-titulo"
              aria-busy={salvandoCliente}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.tagName === "INPUT") e.preventDefault();
              }}
            >
              <h3 id="novo-cliente-titulo" className="span-2">Novo cliente</h3>
              <Campo id="cliente-nome" rotulo="Nome" erro={errosCliente.nome} className="span-2">
                <input
                  id="cliente-nome"
                  value={formCliente.nome}
                  onChange={(e) => setFormCliente((atual) => ({ ...atual, nome: e.target.value }))}
                  aria-invalid={Boolean(errosCliente.nome)}
                  aria-describedby={errosCliente.nome ? "cliente-nome-erro" : undefined}
                  disabled={ocupado}
                />
              </Campo>
              <Campo id="cliente-email" rotulo="E-mail" erro={errosCliente.email}>
                <input
                  id="cliente-email"
                  type="email"
                  value={formCliente.email}
                  onChange={(e) => setFormCliente((atual) => ({ ...atual, email: e.target.value }))}
                  aria-invalid={Boolean(errosCliente.email)}
                  aria-describedby={errosCliente.email ? "cliente-email-erro" : undefined}
                  disabled={ocupado}
                />
              </Campo>
              <Campo id="cliente-telefone" rotulo="Telefone" erro={errosCliente.telefone}>
                <input
                  id="cliente-telefone"
                  type="tel"
                  value={formCliente.telefone}
                  onChange={(e) => setFormCliente((atual) => ({ ...atual, telefone: e.target.value }))}
                  aria-invalid={Boolean(errosCliente.telefone)}
                  aria-describedby={errosCliente.telefone ? "cliente-telefone-erro" : undefined}
                  disabled={ocupado}
                />
              </Campo>
              {erroClienteServidor && (
                <div className="server-error span-2" role="alert">{erroClienteServidor}</div>
              )}
              <div className="page-actions span-2">
                <button type="button" className="btn btn-primary" onClick={salvarCliente} disabled={ocupado}>
                  {salvandoCliente ? "Salvando…" : "Salvar cliente"}
                </button>
                <button type="button" className="btn" onClick={cancelarNovoCliente} disabled={ocupado}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <Campo id="localizacao" rotulo="Localização" className="span-2">
            <input
              id="localizacao"
              type="text"
              placeholder="Cidade, UF"
              value={form.localizacao}
              onChange={mudar("localizacao")}
              disabled={ocupado}
            />
          </Campo>

          <Campo id="status" rotulo="Status">
            <select
              id="status"
              value={form.status}
              onChange={mudar("status")}
              disabled={ocupado}
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
              disabled={ocupado}
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
              disabled={ocupado}
            />
          </Campo>
        </div>

        {erroServidor && (
          <div className="server-error modal-erro" role="alert">
            {erroServidor}
          </div>
        )}

        <footer className="modal-footer">
          <button type="button" className="btn" onClick={() => ref.current.close()} disabled={ocupado}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={ocupado || novoClienteAberto || (!editando && (carregandoClientes || Boolean(erroClientes)))}
          >
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
                        {[p.cliente, p.localizacao].filter(Boolean).join(" • ") || "—"}
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
