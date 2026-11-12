import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  listarOrcamentos,
  salvarOrcamento,
  enviarWhatsapp,
  buscarSinapi,
  itemTotal,
  totais,
  moeda,
  STATUS_ORC,
} from "../services/orcamentosService";
import { listarProjetos } from "../services/projetosService";
import { converterValor } from "../services/orcamentoMapeamento";
import { IconPlus, IconClose, IconSearch, IconTrash, IconCheck, IconDownload } from "../components/icons";
import "../styles/projetos.css";
import "../styles/diario.css";
import "../styles/orcamentos.css";

const PASSOS = ["Dados", "Itens (SINAPI)", "Prévia", "Enviar"];
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const ROTULO_STATUS = Object.fromEntries(STATUS_ORC.map((s) => [s.valor, s.rotulo]));

const doisDigitos = (n) => String(n).padStart(2, "0");

// Data de hoje no fuso do computador (toISOString usaria UTC e viraria o dia à noite).
function hojeLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
}

function formatarData(iso) {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
}

const soDigitos = (s) => (s || "").replace(/\D/g, "");

// Máscara simples de telefone brasileiro: (89) 99999-0000
function mascaraTelefone(valor) {
  const d = soDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const escapar = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// ---- Prévia (documento do orçamento) ----

function Previa({ orc }) {
  const t = totais(orc);
  return (
    <article className="previa" aria-label="Prévia do orçamento">
      <header className="previa-topo">
        <div>
          <h3>ORÇAMENTO {orc.numero || "(novo)"}</h3>
          <p>Emitido em {formatarData(orc.criadoEm || hojeLocal())}</p>
        </div>
        <p className="previa-validade">Válido até {formatarData(orc.validade)}</p>
      </header>

      <dl className="previa-dados">
        <div>
          <dt>Cliente</dt>
          <dd>{orc.cliente || "—"}</dd>
        </div>
        <div>
          <dt>Obra / Projeto</dt>
          <dd>{orc.projeto || "—"}</dd>
        </div>
      </dl>

      <div className="table-wrap">
        <table className="tabela previa-tabela">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Un.</th>
              <th className="num">Qtd</th>
              <th className="num">Preço unit.</th>
              <th className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            {orc.itens.map((i) => (
              <tr key={i.codigo}>
                <td>{i.codigo}</td>
                <td>{i.descricao}</td>
                <td>{i.unidade}</td>
                <td className="num">{i.qtd}</td>
                <td className="num">{moeda(i.preco)}</td>
                <td className="num">{moeda(itemTotal(i))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="totais">
        <div>
          <dt>Subtotal</dt>
          <dd>{moeda(t.subtotal)}</dd>
        </div>
        <div>
          <dt>BDI ({Number(orc.bdi) || 0}%)</dt>
          <dd>{moeda(t.bdi)}</dd>
        </div>
        <div className="totais-final">
          <dt>Total</dt>
          <dd>{moeda(t.total)}</dd>
        </div>
      </dl>

      {orc.observacoes && (
        <p className="previa-obs">
          <strong>Observações:</strong> {orc.observacoes}
        </p>
      )}
    </article>
  );
}

// Abre uma janela só com o orçamento e chama a impressão (lá dá para "Salvar como PDF").
function baixarPdf(orc) {
  const t = totais(orc);
  const linhas = orc.itens
    .map(
      (i) => `<tr><td>${escapar(i.codigo)}</td><td>${escapar(i.descricao)}</td><td>${escapar(i.unidade)}</td>
      <td class="n">${escapar(i.qtd)}</td><td class="n">${moeda(i.preco)}</td><td class="n">${moeda(itemTotal(i))}</td></tr>`
    )
    .join("");
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Orçamento ${escapar(orc.numero || "")}</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:32px;font-size:14px}
h1{font-size:22px;margin:0 0 4px} .sub{color:#555;margin:0 0 20px}
.dados{display:flex;gap:40px;margin-bottom:20px} .dados span{display:block;color:#555;font-size:12px}
table{width:100%;border-collapse:collapse;margin-bottom:16px}
th,td{border:1px solid #bbb;padding:6px 8px;text-align:left} th{background:#eee}
.n{text-align:right;white-space:nowrap}
.tot{margin-left:auto;width:260px} .tot div{display:flex;justify-content:space-between;padding:3px 0}
.tot .f{border-top:2px solid #111;font-weight:bold;font-size:16px;margin-top:4px;padding-top:6px}
</style></head><body>
<h1>ORÇAMENTO ${escapar(orc.numero || "")}</h1>
<p class="sub">Emitido em ${formatarData(orc.criadoEm || hojeLocal())} · Válido até ${formatarData(orc.validade)}</p>
<div class="dados"><div><span>Cliente</span>${escapar(orc.cliente)}</div><div><span>Obra / Projeto</span>${escapar(orc.projeto)}</div></div>
<table><thead><tr><th>Código</th><th>Descrição</th><th>Un.</th><th class="n">Qtd</th><th class="n">Preço unit.</th><th class="n">Total</th></tr></thead><tbody>${linhas}</tbody></table>
<div class="tot"><div><span>Subtotal</span><span>${moeda(t.subtotal)}</span></div>
<div><span>BDI (${Number(orc.bdi) || 0}%)</span><span>${moeda(t.bdi)}</span></div>
<div class="f"><span>Total</span><span>${moeda(t.total)}</span></div></div>
${orc.observacoes ? `<p><strong>Observações:</strong> ${escapar(orc.observacoes)}</p>` : ""}
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) return false; // bloqueador de pop-up
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
  return true;
}

// ---- Janela com os 4 passos ----

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

function novoVazio() {
  return {
    projetoId: "",
    projeto: "",
    cliente: "",
    telefone: "",
    validade: "",
    observacoes: "",
    bdi: 20,
    itens: [],
  };
}

function OrcamentoModal({ inicial, projetos, onClose, onMudou }) {
  const ref = useRef(null);
  const [passo, setPasso] = useState(inicial ? 2 : 0);
  const [form, setForm] = useState(() => (inicial ? { ...inicial } : novoVazio()));
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [aviso, setAviso] = useState("");

  // busca SINAPI
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState("");

  const [mensagem, setMensagem] = useState("");
  const mensagemEditada = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  useEffect(() => {
    if (passo !== 1) return undefined;
    let ativo = true;
    setBuscando(true);
    setErroBusca("");
    const t = setTimeout(() => {
      buscarSinapi(busca)
        .then((r) => ativo && setResultados(r))
        .catch((e) => ativo && setErroBusca(e.message || "Não foi possível consultar a SINAPI."))
        .finally(() => ativo && setBuscando(false));
    }, 300);
    return () => {
      ativo = false;
      clearTimeout(t);
    };
  }, [busca, passo]);

  const t = useMemo(() => totais(form), [form]);

  // texto padrão da mensagem (só enquanto o usuário não editou)
  useEffect(() => {
    if (mensagemEditada.current) return;
    setMensagem(
      `Olá, ${form.cliente || "tudo bem"}! Segue o orçamento ${form.numero || ""} da obra ${form.projeto || ""}, ` +
        `no valor de ${moeda(t.total)}, válido até ${formatarData(form.validade)}.`.replace("  ", " ")
    );
  }, [form.cliente, form.numero, form.projeto, form.validade, t.total]);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  function escolherProjeto(e) {
    const id = e.target.value;
    const p = projetos.find((x) => String(x.id) === id);
    setForm((f) => ({
      ...f,
      projetoId: id,
      projeto: p?.titulo ?? "",
      cliente: f.cliente || p?.cliente || "",
    }));
  }

  function adicionar(c) {
    setForm((f) => {
      const existe = f.itens.find((i) => i.codigo === c.codigo);
      if (existe) {
        return { ...f, itens: f.itens.map((i) => (i.codigo === c.codigo ? { ...i, qtd: Number(i.qtd) + 1 } : i)) };
      }
      return { ...f, itens: [...f.itens, { ...c, qtd: 1 }] };
    });
    setErros((e) => ({ ...e, itens: undefined }));
  }

  const mudarItem = (codigo, campo, valor) =>
    setForm((f) => ({ ...f, itens: f.itens.map((i) => (i.codigo === codigo ? { ...i, [campo]: valor } : i)) }));

  const removerItem = (codigo) => setForm((f) => ({ ...f, itens: f.itens.filter((i) => i.codigo !== codigo) }));

  function validar(p) {
    const e = {};
    if (p === 0) {
      if (!form.projetoId) e.projeto = "Selecione o projeto.";
      if (form.cliente.trim().length < 2) e.cliente = "Informe o nome do cliente.";
      if (!form.validade) e.validade = "Informe até quando o orçamento vale.";
      else if (form.validade < hojeLocal()) e.validade = "A validade não pode ser uma data passada.";
    }
    if (p === 1) {
      if (form.itens.length === 0) e.itens = "Adicione pelo menos um item da consulta SINAPI.";
      else if (form.itens.some((i) => !(Number(i.qtd) > 0) || !(Number(i.preco) >= 0)))
        e.itens = "Confira as quantidades (maiores que zero) e os preços.";
      const bdi = Number(form.bdi);
      if (!(bdi >= 0 && bdi <= 100)) e.bdi = "Use um valor entre 0 e 100.";
    }
    if (p === 3) {
      const d = soDigitos(form.telefone);
      if (d.length < 10 || d.length > 11) e.telefone = "Informe o WhatsApp com DDD.";
      if (mensagem.trim().length < 5) e.mensagem = "Escreva a mensagem.";
    }
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function avancar() {
    if (!validar(passo)) return;
    setPasso((p) => Math.min(p + 1, 3));
  }

  function irPara(i) {
    if (i < passo) setPasso(i);
  }

  async function salvar(silencioso = false) {
    setErroGeral("");
    setOcupado(true);
    try {
      const salvo = await salvarOrcamento({ ...form, bdi: Number(form.bdi) || 0 });
      setForm(salvo);
      onMudou();
      if (!silencioso) setAviso("Rascunho salvo.");
      return salvo;
    } catch (err) {
      setErroGeral(err.message || "Não foi possível salvar o orçamento.");
      return null;
    } finally {
      setOcupado(false);
    }
  }

  async function enviar() {
    if (!validar(3)) return;
    setAviso("");
    const salvo = await salvar(true);
    if (!salvo) return;
    setOcupado(true);
    try {
      await enviarWhatsapp(salvo, mensagem);
      setEnviado(true);
      onMudou();
    } catch (err) {
      setErroGeral(err.message || "Não foi possível enviar pelo WhatsApp.");
    } finally {
      setOcupado(false);
    }
  }

  function pdf() {
    setAviso("");
    if (!baixarPdf(form)) setErroGeral("O navegador bloqueou a nova janela. Libere os pop-ups e tente de novo.");
  }

  return (
    <dialog
      ref={ref}
      className="modal modal-xl"
      aria-labelledby="orc-titulo"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close();
      }}
    >
      <header className="modal-header">
        <h2 id="orc-titulo">{form.id ? `Orçamento ${form.numero}` : "Novo Orçamento"}</h2>
        <button type="button" className="icon-btn" aria-label="Fechar" onClick={() => ref.current.close()}>
          <IconClose size={18} />
        </button>
      </header>

      <ol className="stepper" aria-label="Passos do orçamento">
        {PASSOS.map((nome, i) => (
          <li key={nome} aria-current={i === passo ? "step" : undefined} className={i < passo ? "feito" : ""}>
            <button type="button" onClick={() => irPara(i)} disabled={i >= passo}>
              <span className="passo-num">{i < passo ? <IconCheck size={14} /> : i + 1}</span>
              <span className="passo-nome">{nome}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="modal-body">
        {passo === 0 && (
          <div className="form-grid">
            <Campo id="o-projeto" rotulo="Projeto" erro={erros.projeto} className="span-2">
              <select
                id="o-projeto"
                value={form.projetoId}
                onChange={escolherProjeto}
                aria-invalid={Boolean(erros.projeto)}
              >
                <option value="">
                  {projetos.length === 0 ? "Nenhum projeto cadastrado" : "Selecione o projeto"}
                </option>
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo id="o-cliente" rotulo="Cliente" erro={erros.cliente}>
              <input
                id="o-cliente"
                type="text"
                value={form.cliente}
                onChange={mudar("cliente")}
                aria-invalid={Boolean(erros.cliente)}
              />
            </Campo>
            <Campo id="o-validade" rotulo="Válido até" erro={erros.validade}>
              <input
                id="o-validade"
                type="date"
                min={hojeLocal()}
                value={form.validade}
                onChange={mudar("validade")}
                aria-invalid={Boolean(erros.validade)}
              />
            </Campo>
            <Campo id="o-obs" rotulo="Observações (opcional)" className="span-2">
              <textarea
                id="o-obs"
                placeholder="Condições de pagamento, prazo de execução..."
                value={form.observacoes}
                onChange={mudar("observacoes")}
              />
            </Campo>
          </div>
        )}

        {passo === 1 && (
          <>
            <div className="sinapi">
              <div className="search sinapi-busca">
                <span className="search-icon">
                  <IconSearch size={18} />
                </span>
                <label className="sr-only" htmlFor="o-busca">
                  Buscar na SINAPI
                </label>
                <input
                  id="o-busca"
                  type="search"
                  placeholder="Buscar insumo ou serviço (ex.: cimento, reboco)"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <p className="cell-sub">
                {busca ? "Resultados da consulta" : "Sugestões"} · valores de exemplo, não oficiais
              </p>

              <ul className="sinapi-lista" aria-busy={buscando} aria-label="Resultados da consulta SINAPI">
                {erroBusca && (
                  <li className="sinapi-vazio" role="alert">
                    {erroBusca}
                  </li>
                )}
                {!erroBusca && !buscando && resultados.length === 0 && (
                  <li className="sinapi-vazio">Nenhum item encontrado para essa busca.</li>
                )}
                {!erroBusca &&
                  resultados.map((c) => (
                    <li key={c.codigo}>
                      <div>
                        <strong>{c.descricao}</strong>
                        <span className="cell-sub">
                          {c.codigo} · {moeda(c.preco)} / {c.unidade}
                        </span>
                      </div>
                      <button type="button" className="btn btn-sm" onClick={() => adicionar(c)}>
                        <IconPlus size={14} />
                        Adicionar
                      </button>
                    </li>
                  ))}
              </ul>
            </div>

            <h3 className="reg-label sinapi-titulo">Itens do orçamento ({form.itens.length})</h3>
            {form.itens.length === 0 ? (
              <p className="cell-sub">Nenhum item adicionado ainda.</p>
            ) : (
              <div className="table-wrap">
                <table className="tabela itens-tabela">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Un.</th>
                      <th className="num">Qtd</th>
                      <th className="num">Preço unit. (R$)</th>
                      <th className="num">Total</th>
                      <th>
                        <span className="sr-only">Remover</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.itens.map((i) => (
                      <tr key={i.codigo}>
                        <td>
                          {i.descricao}
                          <span className="cell-sub">{i.codigo}</span>
                        </td>
                        <td>{i.unidade}</td>
                        <td className="num">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            inputMode="decimal"
                            aria-label={`Quantidade de ${i.descricao}`}
                            value={i.qtd}
                            onChange={(e) => mudarItem(i.codigo, "qtd", e.target.value)}
                          />
                        </td>
                        <td className="num">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            aria-label={`Preço unitário de ${i.descricao}`}
                            value={i.preco}
                            onChange={(e) => mudarItem(i.codigo, "preco", e.target.value)}
                          />
                        </td>
                        <td className="num">{moeda(itemTotal(i))}</td>
                        <td>
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label={`Remover ${i.descricao}`}
                            onClick={() => removerItem(i.codigo)}
                          >
                            <IconTrash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {erros.itens && (
              <span className="error" role="alert">
                {erros.itens}
              </span>
            )}

            <div className="resumo-itens">
              <Campo id="o-bdi" rotulo="BDI (%)" erro={erros.bdi}>
                <input
                  id="o-bdi"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  inputMode="decimal"
                  value={form.bdi}
                  onChange={mudar("bdi")}
                  aria-invalid={Boolean(erros.bdi)}
                />
              </Campo>
              <dl className="totais">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{moeda(t.subtotal)}</dd>
                </div>
                <div>
                  <dt>BDI</dt>
                  <dd>{moeda(t.bdi)}</dd>
                </div>
                <div className="totais-final">
                  <dt>Total</dt>
                  <dd>{moeda(t.total)}</dd>
                </div>
              </dl>
            </div>
          </>
        )}

        {passo === 2 && (
          <>
            <Previa orc={form} />
            <div className="previa-acoes">
              <button type="button" className="btn" onClick={pdf}>
                <IconDownload size={18} />
                Baixar PDF
              </button>
              <span className="cell-sub">Abre a janela de impressão: escolha “Salvar como PDF”.</span>
            </div>
          </>
        )}

        {passo === 3 && !enviado && (
          <div className="form-grid">
            <p className="span-2 cell-sub envio-resumo">
              Orçamento <strong>{form.numero || "(novo)"}</strong> · {form.cliente} · <strong>{moeda(t.total)}</strong>
            </p>
            <Campo id="o-tel" rotulo="WhatsApp do cliente" erro={erros.telefone} className="span-2">
              <input
                id="o-tel"
                type="tel"
                inputMode="tel"
                placeholder="(89) 99999-0000"
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: mascaraTelefone(e.target.value) }))}
                aria-invalid={Boolean(erros.telefone)}
              />
            </Campo>
            <Campo id="o-msg" rotulo="Mensagem" erro={erros.mensagem} className="span-2">
              <textarea
                id="o-msg"
                rows={4}
                value={mensagem}
                onChange={(e) => {
                  mensagemEditada.current = true;
                  setMensagem(e.target.value);
                }}
                aria-invalid={Boolean(erros.mensagem)}
              />
            </Campo>
          </div>
        )}

        {passo === 3 && enviado && (
          <div className="card state envio-ok" role="status">
            <span className="envio-check">
              <IconCheck size={28} />
            </span>
            <p>
              Orçamento {form.numero} enviado para <strong>{form.telefone}</strong>.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => ref.current.close()}>
              Concluir
            </button>
          </div>
        )}
      </div>

      {erroGeral && (
        <div className="server-error modal-erro" role="alert">
          {erroGeral}
        </div>
      )}
      {aviso && (
        <p className="modal-erro cell-sub" role="status">
          {aviso}
        </p>
      )}

      {!(passo === 3 && enviado) && (
        <footer className="modal-footer">
          {passo > 0 && (
            <button type="button" className="btn" onClick={() => setPasso(passo - 1)} disabled={ocupado}>
              Voltar
            </button>
          )}
          {passo >= 1 && (
            <button
              type="button"
              className="btn"
              disabled={ocupado || !form.projetoId}
              onClick={() => {
                if (passo === 1 && !validar(1)) return;
                salvar();
              }}
            >
              Salvar rascunho
            </button>
          )}
          {passo < 3 ? (
            <button type="button" className="btn btn-primary" onClick={avancar}>
              Próximo
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={enviar} disabled={ocupado}>
              {ocupado ? "Enviando..." : "Enviar por WhatsApp"}
            </button>
          )}
        </footer>
      )}
    </dialog>
  );
}

function OrcamentoRealModal({ inicial, onClose, onMudou }) {
  const ref = useRef(null);
  const [form, setForm] = useState({ projetoId: "", nome: "", descricao: "", valor: "" });
  const [projetos, setProjetos] = useState([]);
  const [carregandoProjetos, setCarregandoProjetos] = useState(!inicial);
  const [erroProjetos, setErroProjetos] = useState("");
  const [erros, setErros] = useState({});
  const [erroServidor, setErroServidor] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregarProjetos = useCallback(async () => {
    setCarregandoProjetos(true);
    setErroProjetos("");
    try {
      setProjetos(await listarProjetos());
    } catch (err) {
      setErroProjetos(err.message || "Não foi possível carregar os projetos.");
    } finally {
      setCarregandoProjetos(false);
    }
  }, []);

  useEffect(() => {
    if (ref.current && !ref.current.open) ref.current.showModal();
  }, []);

  useEffect(() => {
    if (!inicial) carregarProjetos();
  }, [inicial, carregarProjetos]);

  const mudar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));
  const projeto = projetos.find((item) => String(item.id) === form.projetoId);

  async function enviar(e) {
    e.preventDefault();
    if (salvando || carregandoProjetos || erroProjetos) return;
    setErroServidor("");
    const novos = {};
    if (!projeto) novos.projeto = "Selecione um projeto.";
    if (form.nome.trim().length < 3 || form.nome.trim().length > 150)
      novos.nome = "O nome deve ter entre 3 e 150 caracteres.";
    if (form.descricao.trim().length > 2000)
      novos.descricao = "A descrição deve ter até 2000 caracteres.";
    try {
      converterValor(form.valor);
    } catch (err) {
      novos.valor = err.message;
    }
    setErros(novos);
    if (Object.keys(novos).length) return;

    setSalvando(true);
    try {
      await salvarOrcamento(form);
      onMudou();
      onClose();
    } catch (err) {
      setErroServidor(err.message || "Não foi possível salvar o orçamento.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="orc-real-titulo"
      onClose={onClose}
      onCancel={(e) => {
        if (salvando) e.preventDefault();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !salvando) ref.current.close();
      }}
    >
      <header className="modal-header">
        <h2 id="orc-real-titulo">{inicial ? inicial.nome : "Novo Orçamento"}</h2>
        <button type="button" className="icon-btn" aria-label="Fechar" disabled={salvando} onClick={() => ref.current.close()}>
          <IconClose size={18} />
        </button>
      </header>

      {inicial ? (
        <>
          <div className="modal-body">
            <dl className="previa-dados">
              <div><dt>Projeto</dt><dd>{inicial.projeto}</dd></div>
              <div><dt>Cliente</dt><dd>{inicial.cliente}</dd></div>
              <div><dt>Criado em</dt><dd>{inicial.criadoEm}</dd></div>
              <div><dt>Valor</dt><dd>{moeda(inicial.valor)}</dd></div>
            </dl>
            {inicial.descricao && <p className="reg-text">{inicial.descricao}</p>}
          </div>
          <footer className="modal-footer">
            <button type="button" className="btn" onClick={() => ref.current.close()}>Fechar</button>
          </footer>
        </>
      ) : (
        <form onSubmit={enviar} noValidate>
          <div className="modal-body form-grid">
            <Campo id="o-projeto" rotulo="Projeto" erro={erros.projeto} className="span-2">
              <select
                id="o-projeto"
                value={form.projetoId}
                onChange={mudar("projetoId")}
                disabled={salvando || carregandoProjetos || Boolean(erroProjetos)}
                aria-busy={carregandoProjetos}
                aria-invalid={Boolean(erros.projeto || erroProjetos)}
              >
                <option value="">{carregandoProjetos ? "Carregando projetos…" : projetos.length ? "Selecione o projeto" : "Nenhum projeto cadastrado"}</option>
                {projetos.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}
              </select>
              {erroProjetos && (
                <>
                  <span className="error" role="alert">{erroProjetos}</span>
                  <button type="button" className="btn" onClick={carregarProjetos} disabled={salvando}>Tentar de novo</button>
                </>
              )}
            </Campo>
            {projeto && <p className="span-2 cell-sub">Cliente: {projeto.cliente}</p>}
            <Campo id="o-nome" rotulo="Nome" erro={erros.nome} className="span-2">
              <input id="o-nome" value={form.nome} maxLength={150} onChange={mudar("nome")} disabled={salvando} aria-invalid={Boolean(erros.nome)} />
            </Campo>
            <Campo id="o-descricao" rotulo="Descrição (opcional)" erro={erros.descricao} className="span-2">
              <textarea id="o-descricao" value={form.descricao} maxLength={2000} rows={4} onChange={mudar("descricao")} disabled={salvando} aria-invalid={Boolean(erros.descricao)} />
            </Campo>
            <Campo id="o-valor" rotulo="Valor (R$)" erro={erros.valor} className="span-2">
              <input id="o-valor" type="text" inputMode="decimal" placeholder="12.500,50" value={form.valor} onChange={mudar("valor")} disabled={salvando} aria-invalid={Boolean(erros.valor)} />
            </Campo>
          </div>
          {erroServidor && <div className="server-error modal-erro" role="alert">{erroServidor}</div>}
          <footer className="modal-footer">
            <button type="button" className="btn" disabled={salvando} onClick={() => ref.current.close()}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={salvando || carregandoProjetos || Boolean(erroProjetos) || !projetos.length}>
              {salvando ? "Salvando…" : "Salvar orçamento"}
            </button>
          </footer>
        </form>
      )}
    </dialog>
  );
}

// ---- Página ----

export default function Orcamentos() {
  const [lista, setLista] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [aberto, setAberto] = useState(null); // null = fechado, "novo" ou o orçamento

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setLista(await listarOrcamentos());
    } catch (err) {
      setErro(err.message || "Não foi possível carregar os orçamentos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    // A lista de projetos só alimenta o formulário: se falhar, a página continua funcionando.
    if (USE_MOCK) listarProjetos()
      .then(setProjetos)
      .catch(() => setProjetos([]));
  }, [carregar]);

  const filtrados = useMemo(
    () =>
      USE_MOCK ? lista
        .filter((o) => filtro === "todos" || o.status === filtro)
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)) : lista,
    [lista, filtro]
  );

  const totalGeral = useMemo(() => filtrados.reduce((s, o) => s + (USE_MOCK ? totais(o).total : o.valor), 0), [filtrados]);

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Orçamentos</h1>
          <p className="page-subtitle">{USE_MOCK ? "Monte o orçamento com preços SINAPI e envie ao cliente" : "Cadastre e consulte os orçamentos dos seus projetos"}</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={() => setAberto("novo")}>
            <IconPlus size={18} />
            Novo Orçamento
          </button>
        </div>
      </header>

      {USE_MOCK && <div className="toolbar">
        <div className="chips" role="group" aria-label="Filtrar por situação">
          {[{ valor: "todos", rotulo: "Todos" }, ...STATUS_ORC].map((s) => (
            <button
              key={s.valor}
              type="button"
              className="chip"
              aria-pressed={filtro === s.valor}
              onClick={() => setFiltro(s.valor)}
            >
              {s.rotulo}
            </button>
          ))}
        </div>
      </div>}

      {carregando && <div className="skeleton skeleton-card" aria-busy="true" aria-label="Carregando orçamentos" />}

      {!carregando && erro && (
        <div className="card state state-error" role="alert">
          <p>{erro}</p>
          <button type="button" className="btn" onClick={carregar}>
            Tentar de novo
          </button>
        </div>
      )}

      {!carregando && !erro && lista.length === 0 && (
        <div className="card state">
          <p>{USE_MOCK ? "Nenhum orçamento criado." : "Nenhum orçamento ainda."}</p>
          <button type="button" className="btn btn-primary" onClick={() => setAberto("novo")}>
            Criar primeiro orçamento
          </button>
        </div>
      )}

      {!carregando && !erro && lista.length > 0 && filtrados.length === 0 && (
        <div className="card state">
          <p>Nenhum orçamento com essa situação.</p>
          <button type="button" className="btn" onClick={() => setFiltro("todos")}>
            Mostrar todos
          </button>
        </div>
      )}

      {!carregando && !erro && filtrados.length > 0 && (
        <div className="card table-card">
          <div className="table-wrap">
            <table className="tabela">
              <thead>
                <tr>
                  <th>{USE_MOCK ? "Número" : "Nome"}</th>
                  <th>Projeto / Cliente</th>
                  <th>Criado em</th>
                  {USE_MOCK && <th>Validade</th>}
                  {USE_MOCK && <th className="num">Itens</th>}
                  <th className="num">Total</th>
                  {USE_MOCK && <th>Situação</th>}
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>{USE_MOCK ? o.numero : o.nome}</strong>
                    </td>
                    <td className="orc-projeto">
                      {o.projeto}
                      <span className="cell-sub">{o.cliente}</span>
                    </td>
                    <td>{USE_MOCK ? formatarData(o.criadoEm) : o.criadoEm}</td>
                    {USE_MOCK && <td>{formatarData(o.validade)}</td>}
                    {USE_MOCK && <td className="num">{o.itens.length}</td>}
                    <td className="num">
                      <strong>{moeda(USE_MOCK ? totais(o).total : o.valor)}</strong>
                    </td>
                    {USE_MOCK && <td>
                      <span className={`badge badge-orc-${o.status}`}>{ROTULO_STATUS[o.status] ?? o.status}</span>
                    </td>}
                    <td>
                      <button type="button" className="btn btn-sm" onClick={() => setAberto(o)}>
                        Abrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="cell-sub">
              {filtrados.length} {filtrados.length === 1 ? "orçamento" : "orçamentos"}
            </span>
            <strong>Soma: {moeda(totalGeral)}</strong>
          </div>
        </div>
      )}

      {aberto && (
        USE_MOCK ? <OrcamentoModal
          inicial={aberto === "novo" ? null : aberto}
          projetos={projetos}
          onClose={() => setAberto(null)}
          onMudou={carregar}
        /> : <OrcamentoRealModal
          inicial={aberto === "novo" ? null : aberto}
          onClose={() => setAberto(null)}
          onMudou={carregar}
        />
      )}
    </>
  );
}
