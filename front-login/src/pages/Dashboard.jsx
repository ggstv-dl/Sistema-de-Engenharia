import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../services/dashboardService";
import {
  IconDownload,
  IconPlus,
  IconBolt,
  IconCheck,
  IconFile,
  IconUserPlus,
  IconAlert,
  IconBars,
} from "../components/icons";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

const doisDigitos = (n) => String(n).padStart(2, "0");

const ICONES = {
  diario: IconCheck,
  orcamento: IconFile,
  usuario: IconUserPlus,
  atraso: IconAlert,
};

function StatCard({ titulo, valor, detalhe, icone: Icone, children }) {
  return (
    <article className="card stat">
      <div className="stat-top">
        <span className="stat-title">{titulo}</span>
        {Icone && (
          <span className="stat-icon">
            <Icone size={18} />
          </span>
        )}
      </div>
      <strong className="stat-value">{valor}</strong>
      {detalhe && <span className="stat-detail">{detalhe}</span>}
      {children}
    </article>
  );
}

function ProgressChart({ obras }) {
  return (
    <ul className="bars" aria-label="Progresso por obra">
      {obras.map((obra) => (
        <li
          key={obra.nome}
          className="bar"
          aria-label={`${obra.nome}: ${obra.progresso}%`}
        >
          <span className="bar-value">{obra.progresso}%</span>
          <span className="bar-track">
            <span
              className="bar-fill"
              style={{ height: `${obra.progresso}%` }}
            />
          </span>
          <span className="bar-label">{obra.nome}</span>
        </li>
      ))}
    </ul>
  );
}

function ActivityList({ atividades }) {
  return (
    <ul className="activities">
      {atividades.map((a, i) => {
        const Icone = ICONES[a.tipo] || IconBars;
        return (
          <li key={i} className="activity">
            <span className="activity-icon">
              <Icone size={16} />
            </span>
            <div>
              <p>{a.texto}</p>
              <small>
                {a.quando} • {a.autor}
              </small>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando painel">
      <div className="stats">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton skeleton-stat" />
        ))}
      </div>
      <div className="panels">
        <div className="skeleton skeleton-panel" />
        <div className="skeleton skeleton-panel" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setDados(await getDashboard());
    } catch (err) {
      setErro(err.message || "Não foi possível carregar o painel.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Bem-vindo ao sistema de gestão de obras</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn" onClick={() => window.print()}>
            <IconDownload size={18} />
            Exportar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/projetos")}
          >
            <IconPlus size={18} />
            Novo Projeto
          </button>
        </div>
      </header>

      {carregando && <DashboardSkeleton />}

      {!carregando && erro && (
        <div className="card state state-error" role="alert">
          <p>{erro}</p>
          <button type="button" className="btn" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      )}

      {!carregando && !erro && dados && (
        <>
          <section className="stats" aria-label="Resumo">
            <StatCard
              titulo="Obras Ativas"
              valor={doisDigitos(dados.obrasAtivas.valor)}
              detalhe={dados.obrasAtivas.detalhe}
            />
            <StatCard
              titulo="Diários Pendentes"
              valor={doisDigitos(dados.diariosPendentes.valor)}
              detalhe={dados.diariosPendentes.detalhe}
            />
            <StatCard
              titulo="Custo Total (MTD)"
              valor={moeda.format(dados.custoTotal.valor)}
              detalhe={dados.custoTotal.detalhe}
            />
            <StatCard
              titulo="Eficiência"
              valor={`${dados.eficiencia.valor}%`}
              icone={IconBolt}
            >
              <div
                className="meter"
                role="progressbar"
                aria-label="Eficiência"
                aria-valuenow={dados.eficiencia.valor}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${dados.eficiencia.valor}%` }} />
              </div>
            </StatCard>
          </section>

          <div className="panels">
            <section className="card" aria-labelledby="titulo-progresso">
              <h2 id="titulo-progresso" className="panel-title">
                Progresso das Obras
              </h2>
              {dados.progressoObras.length > 0 ? (
                <ProgressChart obras={dados.progressoObras} />
              ) : (
                <div className="state">
                  <p>Nenhum projeto cadastrado.</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate("/projetos")}
                  >
                    Criar primeiro projeto
                  </button>
                </div>
              )}
            </section>

            <section className="card" aria-labelledby="titulo-atividades">
              <h2 id="titulo-atividades" className="panel-title">
                Atividades Recentes
              </h2>
              {dados.atividades.length > 0 ? (
                <ActivityList atividades={dados.atividades} />
              ) : (
                <p className="page-subtitle">Nenhuma atividade ainda.</p>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
