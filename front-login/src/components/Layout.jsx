import { NavLink, Outlet } from "react-router-dom";
import ContrastSwitch from "./ContrastSwitch";
import {
  IconDashboard,
  IconFolder,
  IconBook,
  IconReceipt,
  IconLogout,
} from "./icons";
import { getUser } from "../services/authService";
import logoBranca from "../assets/logo-horizontal-branca.png";

const ITEMS = [
  { to: "/", label: "Dashboard", icon: IconDashboard, end: true },
  { to: "/projetos", label: "Projetos", icon: IconFolder },
  { to: "/diario", label: "Diário de Obra", icon: IconBook },
  { to: "/orcamentos", label: "Orçamentos", icon: IconReceipt },
];

function initials(nome) {
  const parts = nome.replace(/^Eng\.\s*/i, "").trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Layout({ onLogout }) {
  const user = getUser();
  const nome = user?.nome || "Usuário";
  const perfil = user?.perfil || "";

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-img" src={logoBranca} alt="Leandro Barros - Engenheiro Civil" />
        </div>

        <nav aria-label="Principal">
          <ul className="nav-list">
            {ITEMS.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className="nav-link">
                  <Icon size={20} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <ContrastSwitch />

          <div className="user">
            <span className="avatar" aria-hidden="true">
              {initials(nome)}
            </span>
            <div>
              <span className="user-name">{nome}</span>
              {perfil && <span className="user-role">{perfil}</span>}
            </div>
          </div>

          <button type="button" className="logout" onClick={onLogout}>
            <IconLogout size={18} />
            Sair
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
