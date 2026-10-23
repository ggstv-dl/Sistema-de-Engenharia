import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  listarDiarios,
  salvarDiario,
  CLIMAS,
  FUNCOES,
  EQUIPAMENTOS,
  MAX_FOTOS,
  MAX_FOTO_MB,
} from "../services/diarioService";
import { listarProjetos } from "../services/projetosService";
import { getUser } from "../services/authService";
import {
  IconPlus,
  IconClose,
  IconSun,
  IconCloud,
  IconRain,
  IconCamera,
  IconTrash,
} from "../components/icons";
import "../styles/projetos.css";
import "../styles/diario.css";

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const POR_LOTE = 4;

const ICONE_CLIMA = { ensolarado: IconSun, nublado: IconCloud, chuvoso: IconRain };
const ROTULO_CLIMA = Object.fromEntries(CLIMAS.map((c) => [c.valor, c.rotulo]));

const doisDigitos = (n) => String(n).padStart(2, "0");

// Data de hoje no fuso do computador (toISOString usaria UTC e viraria o dia à noite).
function hojeLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
}

function partesData(iso) {
  const [, mes, dia] = (iso || "").split("-");
  return { mes: MESES[Number(mes) - 1] ?? "", dia: dia ?? "" };
}

function formatarData(iso) {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
}

function Clima({ valor }) {
  if (!valor) return null;
  const Icone = ICONE_CLIMA[valor];
  return (
    <span className="weather">
      {Icone && <Icone size={16} />}
      {ROTULO_CLIMA[valor] ?? valor}
    </span>
  );
}

function ListaQtd({ titulo, itens, campo }) {
  if (!itens || itens.length === 0) return null;
  return (
    <section>
      <h3 className="reg-label">{titulo}</h3>
      <ul className="qtd-list">
        {itens.map((item, i) => (
          <li key={i}>
            <span>{item[campo]}</span>
            <strong>{doisDigitos(item.qtd)}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CardRegistro({ registro: r, onVer }) {
  const { mes, dia } = partesData(r.data);
  const temLateral = r.maoDeObra.length > 0 || r.equipamentos.length > 0;
  const visiveis = r.fotos.slice(0, 2);
  const restantes = r.fotos.length - visiveis.length;

  return (
    <article className="card reg">
      <header className="reg-head">
        <time className="date-box" dateTime={r.data} aria-label={formatarData(r.data)}>
          <span>{mes}</span>
          <strong>{dia}</strong>
        </time>

        <div className="reg-title">
          <h2>
            {r.projeto}
            {r.atividade ? ` - ${r.atividade}` : ""}
          </h2>
          <p className="cell-sub">
            Registrado por <strong>{r.autor || "—"}</strong>
            {r.hora ? ` • ${r.hora}` : ""}
          </p>
        </div>

        <div className="reg-side">
          <Clima valor={r.clima} />
          <button type="button" className="btn btn-sm" onClick={() => onVer(r)}>
            Ver detalhes
          </button>
        </div>
      </header>

      <div className={`reg-body${temLateral ? "" : " sem-lateral"}`}>
        <div>
          <h3 className="reg-label">Relato das atividades</h3>
          <p className="reg-text">{r.relato}</p>

          {r.fotos.length > 0 && (
            <div className="thumbs">
              {visiveis.map((src, i) => (
                <img key={i} className="thumb" src={src} alt={`Foto ${i + 1} do registro`} />
              ))}
              {restantes > 0 && (
                <button
                  type="button"
                  className="thumb thumb-more"
                  onClick={() => onVer(r)}
                  aria-label={`Ver mais ${restantes} fotos`}
                >
                  +{restantes} fotos
                </button>
              )}
            </div>
          )}
        </div>

        {temLateral && (
          <aside>
            <ListaQtd titulo="Mão de obra" itens={r.maoDeObra} campo="funcao" />
            <ListaQtd titulo="Equipamentos" itens={r.equipamentos} campo="nome" />
          </aside>
        )}
      </div>
    </article>
  );
}

function DetalheModal({ registro: r, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal modal-lg"
      aria-labelledby="detalhe-titulo"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close();
      }}
    >
      <header className="modal-header">
        <h2 id="detalhe-titulo">
          {r.projeto}
          {r.atividade ? ` - ${r.atividade}` : ""}
        </h2>
        <button type="button" className="icon-btn" aria-label="Fechar" onClick={() => ref.current.close()}>
          <IconClose size={18} />
        </button>
      </header>

      <div className="modal-body detalhe">
        <p className="cell-sub detalhe-meta">
          {formatarData(r.data)}
          {r.hora ? ` às ${r.hora}` : ""} • Registrado por <strong>{r.autor || "—"}</strong>
        </p>
        <Clima valor={r.clima} />

        <h3 className="reg-label">Relato das atividades</h3>
        <p className="reg-text">{r.relato}</p>

        {r.observacoes && (
          <>
            <h3 className="reg-label">Observações</h3>
            <p className="reg-text">{r.observacoes}</p>
          </>
        )}

        <div className="detalhe-listas">
          <ListaQtd titulo="Mão de obra" itens={r.maoDeObra} campo="funcao" />
          <ListaQtd titulo="Equipamentos" itens={r.equipamentos} campo="nome" />
        </div>

        {r.fotos.length > 0 && (
          <>
            <h3 className="reg-label">Fotos ({r.fotos.length})</h3>
            <div className="fotos-detalhe">
              {r.fotos.map((src, i) => (
                <img key={i} src={src} alt={`Foto ${i + 1} do registro`} />
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="modal-footer">
        <button type="button" className="btn" onClick={() => ref.current.close()}>
          Fechar
        </button>
      </footer>
    </dialog>
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

// Linhas "nome + quantidade" (mão de obra e equipamentos)
function EditorLinhas({ legenda, linhas, setLinhas, campo, sugestoes, placeholder, erro }) {
  const listaId = `sug-${campo}`;

  const mudar = (i, chave, valor) =>
    setLinhas((ls) => ls.map((l, k) => (k === i ? { ...l, [chave]: valor } : l)));

  return (
    <div className="field span-2">
      <span className="label-like">{legenda}</span>
      <datalist id={listaId}>
        {sugestoes.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <div className="linhas">
        {linhas.map((l, i) => (
          <div key={i} className="linha">
            <input
              type="text"
              list={listaId}
              placeholder={placeholder}
              aria-label={`${legenda}: nome (linha ${i + 1})`}
              value={l[campo]}
              onChange={(e) => mudar(i, campo, e.target.value)}
            />
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              placeholder="Qtd"
              aria-label={`${legenda}: quantidade (linha ${i + 1})`}
              value={l.qtd}
              onChange={(e) => mudar(i, "qtd", e.target.value)}
            />
            <button
              type="button"
              className="icon-btn"
              aria-label={`Remover linha ${i + 1} de ${legenda.toLowerCase()}`}
              onClick={() =>
                setLinhas((ls) =>
                  ls.length > 1 ? ls.filter((_, k) => k !== i) : [{ [campo]: "", qtd: "" }]
                )
              }
            >
              <IconTrash size={18} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-sm btn-add"
        onClick={() => setLinhas((ls) => [...ls, { [campo]: "", qtd: "" }])}
      >
        <IconPlus size={16} />
        Adicionar linha
      </button>

      {erro && (
        <span className="error" role="alert">
          {erro}
        </span>
      )}
    </div>
  );
}

function DiarioModal({ projetos, onClose, onSalvo }) {
  const ref = useRef(null);
  const fotosRef = useRef([]);

  const [form, setForm] = useState({
    projetoId: "",
    atividade: "",
    data: hojeLocal(),
    clima: "ensolarado",
    relato: "",
    observacoes: "",
  });
  const [mao, setMao] = useState([{ funcao: "", qtd: "" }]);
  const [equip, setEquip] = useState([{ nome: "", qtd: "" }]);
  const [fotos, setFotos] = useState([]); // { id, file, preview }
  const [erros, setErros] = useState({});
  const [erroServidor, setErroServidor] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  // Libera as prévias das fotos ao fechar a janela.
  useEffect(() => {
    fotosRef.current = fotos;
  }, [fotos]);
  useEffect(
    () => () => fotosRef.current.forEach((f) => URL.revokeObjectURL(f.preview)),
    []
  );

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  function adicionarFotos(e) {
    const escolhidas = Array.from(e.target.files || []);
    e.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (escolhidas.length === 0) return;

    const aviso = [];
    const aceitas = [];
    for (const file of escolhidas) {
      if (!file.type.startsWith("image/")) {
        aviso.push(`"${file.name}" não é uma imagem.`);
      } else if (file.size > MAX_FOTO_MB * 1024 * 1024) {
        aviso.push(`"${file.name}" passa de ${MAX_FOTO_MB} MB.`);
      } else {
        aceitas.push(file);
      }
    }

    const vagas = MAX_FOTOS - fotos.length;
    if (aceitas.length > vagas) aviso.push(`Máximo de ${MAX_FOTOS} fotos por registro.`);

    const novas = aceitas.slice(0, Math.max(0, vagas)).map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setFotos((atual) => [...atual, ...novas]);
    setErros((er) => ({ ...er, fotos: aviso.join(" ") }));
  }

  function removerFoto(id) {
    setFotos((atual) => {
      const alvo = atual.find((f) => f.id === id);
      if (alvo) URL.revokeObjectURL(alvo.preview);
      return atual.filter((f) => f.id !== id);
    });
    setErros((er) => ({ ...er, fotos: "" }));
  }

  // Valida as linhas preenchidas (nome + quantidade inteira maior que zero)
  function lerLinhas(linhas, campo) {
    const itens = [];
    let invalida = false;
    for (const l of linhas) {
      const nome = l[campo].trim();
      const texto = String(l.qtd).trim();
      if (!nome && !texto) continue;
      const qtd = Number(texto);
      if (!nome || !Number.isInteger(qtd) || qtd < 1) {
        invalida = true;
        continue;
      }
      itens.push({ [campo]: nome, qtd });
    }
    return { itens, invalida };
  }

  async function enviar(e) {
    e.preventDefault();
    setErroServidor("");

    const projeto = projetos.find((p) => String(p.id) === form.projetoId);
    const m = lerLinhas(mao, "funcao");
    const eq = lerLinhas(equip, "nome");

    const novos = {};
    if (!projeto) novos.projeto = "Selecione o projeto.";
    if (form.atividade.trim().length < 3)
      novos.atividade = "Informe a atividade do dia (mínimo 3 letras).";
    if (!form.data) novos.data = "Informe a data.";
    else if (form.data > hojeLocal()) novos.data = "A data não pode ser no futuro.";
    if (form.relato.trim().length < 10)
      novos.relato = "Descreva o relato das atividades (mínimo 10 letras).";
    if (m.invalida)
      novos.mao = "Preencha o nome e a quantidade (número maior que zero) em cada linha.";
    if (eq.invalida)
      novos.equip = "Preencha o nome e a quantidade (número maior que zero) em cada linha.";
    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    setSalvando(true);
    try {
      await salvarDiario({
        projetoId: projeto.id,
        projeto: projeto.titulo,
        atividade: form.atividade.trim(),
        data: form.data,
        clima: form.clima,
        relato: form.relato.trim(),
        observacoes: form.observacoes.trim(),
        maoDeObra: m.itens,
        equipamentos: eq.itens,
        autor: getUser()?.nome ?? "",
        fotos: fotos.map((f) => f.file),
      });
      onSalvo();
    } catch (err) {
      setErroServidor(err.message || "Não foi possível salvar o registro.");
    } finally {
      setSalvando(false);
    }
  }

  const semProjetos = projetos.length === 0;

  return (
    <dialog
      ref={ref}
      className="modal modal-lg"
      aria-labelledby="novo-titulo"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close();
      }}
    >
      <form onSubmit={enviar} noValidate>
        <header className="modal-header">
          <h2 id="novo-titulo">Novo Registro</h2>
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={() => ref.current.close()}>
            <IconClose size={18} />
          </button>
        </header>

        <div className="modal-body form-grid">
          <Campo id="projeto" rotulo="Projeto" erro={erros.projeto} className="span-2">
            <select
              id="projeto"
              value={form.projetoId}
              onChange={mudar("projetoId")}
              aria-invalid={Boolean(erros.projeto)}
              disabled={salvando || semProjetos}
            >
              <option value="">
                {semProjetos ? "Nenhum projeto cadastrado" : "Selecione o projeto"}
              </option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                </option>
              ))}
            </select>
          </Campo>

          <Campo id="atividade" rotulo="Atividade do dia" erro={erros.atividade} className="span-2">
            <input
              id="atividade"
              type="text"
              placeholder="Ex.: Concretagem da laje"
              value={form.atividade}
              onChange={mudar("atividade")}
              aria-invalid={Boolean(erros.atividade)}
              disabled={salvando}
            />
          </Campo>

          <Campo id="data" rotulo="Data" erro={erros.data}>
            <input
              id="data"
              type="date"
              max={hojeLocal()}
              value={form.data}
              onChange={mudar("data")}
              aria-invalid={Boolean(erros.data)}
              disabled={salvando}
            />
          </Campo>

          <Campo id="clima" rotulo="Clima">
            <select id="clima" value={form.clima} onChange={mudar("clima")} disabled={salvando}>
              {CLIMAS.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.rotulo}
                </option>
              ))}
            </select>
          </Campo>

          <Campo id="relato" rotulo="Relato das atividades" erro={erros.relato} className="span-2">
            <textarea
              id="relato"
              rows={4}
              placeholder="O que foi feito hoje no canteiro?"
              value={form.relato}
              onChange={mudar("relato")}
              aria-invalid={Boolean(erros.relato)}
              disabled={salvando}
            />
          </Campo>

          <Campo id="observacoes" rotulo="Observações (opcional)" className="span-2">
            <textarea
              id="observacoes"
              rows={2}
              placeholder="Pendências, ocorrências, pedidos de material..."
              value={form.observacoes}
              onChange={mudar("observacoes")}
              disabled={salvando}
            />
          </Campo>

          <EditorLinhas
            legenda="Mão de obra"
            linhas={mao}
            setLinhas={setMao}
            campo="funcao"
            sugestoes={FUNCOES}
            placeholder="Função (ex.: Pedreiros)"
            erro={erros.mao}
          />

          <EditorLinhas
            legenda="Equipamentos"
            linhas={equip}
            setLinhas={setEquip}
            campo="nome"
            sugestoes={EQUIPAMENTOS}
            placeholder="Equipamento (ex.: Betoneira)"
            erro={erros.equip}
          />

          <div className="field span-2">
            <span className="label-like">
              Fotos ({fotos.length}/{MAX_FOTOS})
            </span>

            {fotos.length > 0 && (
              <div className="fotos-grid">
                {fotos.map((f, i) => (
                  <div key={f.id} className="foto-item">
                    <img src={f.preview} alt={`Prévia da foto ${i + 1}`} />
                    <button
                      type="button"
                      className="foto-remove"
                      aria-label={`Remover foto ${i + 1}`}
                      onClick={() => removerFoto(f.id)}
                      disabled={salvando}
                    >
                      <IconClose size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="btn btn-sm btn-add file-btn">
              <IconCamera size={16} />
              Adicionar fotos
              <input
                id="fotos"
                className="sr-only"
                type="file"
                accept="image/*"
                multiple
                onChange={adicionarFotos}
                disabled={salvando || fotos.length >= MAX_FOTOS}
              />
            </label>

            {erros.fotos && (
              <span className="error" role="alert">
                {erros.fotos}
              </span>
            )}
          </div>
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
          <button type="submit" className="btn btn-primary" disabled={salvando || semProjetos}>
            {salvando ? "Salvando..." : "Salvar registro"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

export default function Diario() {
  const [registros, setRegistros] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [filtro, setFiltro] = useState("todos");
  const [qtd, setQtd] = useState(POR_LOTE);

  const [novo, setNovo] = useState(false);
  const [vendo, setVendo] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setRegistros(await listarDiarios());
    } catch (err) {
      setErro(err.message || "Não foi possível carregar os registros.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    // A lista de projetos só alimenta o formulário: se falhar, a página continua funcionando.
    listarProjetos()
      .then(setProjetos)
      .catch(() => setProjetos([]));
  }, [carregar]);

  const nomesProjetos = useMemo(
    () => [...new Set(registros.map((r) => r.projeto))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [registros]
  );

  const filtrados = useMemo(
    () =>
      registros
        .filter((r) => filtro === "todos" || r.projeto === filtro)
        .sort((a, b) => `${b.data} ${b.hora}`.localeCompare(`${a.data} ${a.hora}`)),
    [registros, filtro]
  );

  const visiveis = filtrados.slice(0, qtd);

  function aoSalvar() {
    setNovo(false);
    carregar();
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Diário de Obra</h1>
          <p className="page-subtitle">Registros diários das atividades de campo</p>
        </div>
        <div className="page-actions">
          <label className="sr-only" htmlFor="filtro-projeto">
            Filtrar por projeto
          </label>
          <select
            id="filtro-projeto"
            className="select select-wide"
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setQtd(POR_LOTE);
            }}
          >
            <option value="todos">Todos os Projetos</option>
            {nomesProjetos.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-primary" onClick={() => setNovo(true)}>
            <IconPlus size={18} />
            Novo Registro
          </button>
        </div>
      </header>

      {carregando && (
        <div className="diario-list" aria-busy="true" aria-label="Carregando registros">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
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

      {!carregando && !erro && registros.length === 0 && (
        <div className="card state">
          <p>Nenhum diário de obra cadastrado.</p>
          <button type="button" className="btn btn-primary" onClick={() => setNovo(true)}>
            Registrar primeiro diário
          </button>
        </div>
      )}

      {!carregando && !erro && registros.length > 0 && filtrados.length === 0 && (
        <div className="card state">
          <p>Nenhum diário de obra cadastrado para este projeto.</p>
          <button type="button" className="btn" onClick={() => setFiltro("todos")}>
            Mostrar todos os projetos
          </button>
        </div>
      )}

      {!carregando && !erro && filtrados.length > 0 && (
        <div className="diario-list">
          {visiveis.map((r) => (
            <CardRegistro key={r.id} registro={r} onVer={setVendo} />
          ))}

          <div className="diario-rodape">
            <span className="cell-sub">
              Mostrando {visiveis.length} de {filtrados.length} registros
            </span>
            {filtrados.length > visiveis.length && (
              <button type="button" className="btn" onClick={() => setQtd((q) => q + POR_LOTE)}>
                Carregar Registros Anteriores
              </button>
            )}
          </div>
        </div>
      )}

      {novo && <DiarioModal projetos={projetos} onClose={() => setNovo(false)} onSalvo={aoSalvar} />}
      {vendo && <DetalheModal registro={vendo} onClose={() => setVendo(null)} />}
    </>
  );
}
