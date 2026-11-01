import { useCallback, useEffect, useState } from "react";
import {
  listarRelatorios,
  gerarRelatorio,
  baixarRelatorio,
  excluirRelatorio,
  TIPOS,
  ROTULO_TIPO,
} from "../services/relatoriosService";
import { listarProjetos } from "../services/projetosService";
import { IconDownload, IconTrash, IconPie } from "../components/icons";
import "../styles/projetos.css";
import "../styles/diario.css";
import "../styles/relatorios.css";

function formatarData(iso) {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
}

function periodo(r) {
  if (!r.de && !r.ate) return "Todo o período";
  if (r.de && r.ate) return `${formatarData(r.de)} a ${formatarData(r.ate)}`;
  return r.de ? `A partir de ${formatarData(r.de)}` : `Até ${formatarData(r.ate)}`;
}

export default function Relatorios() {
  const [lista, setLista] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({ tipo: "projetos", projeto: "todos", de: "", ate: "" });
  const [erroForm, setErroForm] = useState("");
  const [gerando, setGerando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [baixando, setBaixando] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setLista(await listarRelatorios());
    } catch (err) {
      setErro(err.message || "Não foi possível carregar os relatórios.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    // Só alimenta o filtro de projeto: se falhar, a página continua funcionando.
    listarProjetos()
      .then(setProjetos)
      .catch(() => setProjetos([]));
  }, [carregar]);

  const mudar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErroForm("");
  };

  async function gerar(e) {
    e.preventDefault();
    setAviso("");
    if (form.de && form.ate && form.de > form.ate) {
      setErroForm("A data inicial não pode ser depois da data final.");
      return;
    }
    setGerando(true);
    setErroForm("");
    try {
      await gerarRelatorio(form);
      setAviso("Relatório gerado. Ele já aparece na lista abaixo.");
      await carregar();
    } catch (err) {
      setErroForm(err.message || "Não foi possível gerar o relatório.");
    } finally {
      setGerando(false);
    }
  }

  async function baixar(r) {
    setAviso("");
    setBaixando(r.id);
    try {
      await baixarRelatorio(r);
    } catch (err) {
      setErro(err.message || "Não foi possível baixar o relatório.");
    } finally {
      setBaixando(null);
    }
  }

  async function excluir(r) {
    if (!window.confirm(`Excluir o relatório "${r.titulo}" de ${formatarData(r.criadoEm)}?`)) return;
    setAviso("");
    try {
      await excluirRelatorio(r.id);
      await carregar();
    } catch (err) {
      setErro(err.message || "Não foi possível excluir o relatório.");
    }
  }

  const nomes = [...new Set(projetos.map((p) => p.titulo))].sort((a, b) => a.localeCompare(b, "pt-BR"));

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Relatórios</h1>
          <p className="page-subtitle">Gere e baixe relatórios dos projetos, diários e orçamentos</p>
        </div>
      </header>

      <form className="card rel-form" onSubmit={gerar} noValidate>
        <h2 className="rel-titulo">Gerar novo relatório</h2>
        <div className="rel-campos">
          <div className="field">
            <label htmlFor="r-tipo">Tipo de relatório</label>
            <select id="r-tipo" value={form.tipo} onChange={mudar("tipo")} disabled={gerando}>
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.rotulo}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="r-projeto">Projeto</label>
            <select id="r-projeto" value={form.projeto} onChange={mudar("projeto")} disabled={gerando}>
              <option value="todos">Todos os projetos</option>
              {nomes.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="r-de">De</label>
            <input id="r-de" type="date" value={form.de} onChange={mudar("de")} disabled={gerando} />
          </div>
          <div className="field">
            <label htmlFor="r-ate">Até</label>
            <input
              id="r-ate"
              type="date"
              value={form.ate}
              onChange={mudar("ate")}
              disabled={gerando}
              aria-invalid={Boolean(erroForm)}
            />
          </div>
        </div>

        {erroForm && (
          <div className="server-error" role="alert">
            {erroForm}
          </div>
        )}
        <div className="rel-acoes">
          <button type="submit" className="btn btn-primary" disabled={gerando}>
            <IconPie size={18} />
            {gerando ? "Gerando..." : "Gerar relatório"}
          </button>
          <span className="cell-sub">Deixe as datas em branco para incluir todo o período.</span>
        </div>
        {aviso && (
          <p className="cell-sub rel-aviso" role="status">
            {aviso}
          </p>
        )}
      </form>

      <h2 className="rel-subtitulo">Relatórios gerados</h2>

      {carregando && <div className="skeleton skeleton-card" aria-busy="true" aria-label="Carregando relatórios" />}

      {!carregando && erro && (
        <div className="card state state-error" role="alert">
          <p>{erro}</p>
          <button type="button" className="btn" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      )}

      {!carregando && !erro && lista.length === 0 && (
        <div className="card state">
          <p>Nenhum relatório gerado ainda. Escolha o tipo acima e clique em “Gerar relatório”.</p>
        </div>
      )}

      {!carregando && !erro && lista.length > 0 && (
        <div className="card table-card">
          <div className="table-wrap">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Relatório</th>
                  <th>Projeto</th>
                  <th>Período</th>
                  <th>Gerado em</th>
                  <th>Formato</th>
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lista.map((r) => (
                  <tr key={r.id}>
                    <td className="orc-projeto">
                      <strong>{ROTULO_TIPO[r.tipo] ?? r.titulo}</strong>
                    </td>
                    <td className="orc-projeto">{r.projeto}</td>
                    <td className="orc-projeto">{periodo(r)}</td>
                    <td>{formatarData(r.criadoEm)}</td>
                    <td>{r.formato.toUpperCase()}</td>
                    <td>
                      <div className="rel-linha-acoes">
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => baixar(r)}
                        disabled={baixando === r.id}
                        aria-label={`Baixar ${r.titulo} de ${formatarData(r.criadoEm)}`}
                      >
                        <IconDownload size={16} />
                        Baixar
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => excluir(r)}
                        aria-label={`Excluir ${r.titulo} de ${formatarData(r.criadoEm)}`}
                      >
                        <IconTrash size={18} />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
