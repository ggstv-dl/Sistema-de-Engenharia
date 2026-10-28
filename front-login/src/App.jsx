import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projetos from "./pages/Projetos";
import Diario from "./pages/Diario";
import EmBreve from "./pages/EmBreve";
import { isAuthenticated, logout } from "./services/authService";
import { onNaoAutorizado } from "./services/api";
import "./styles/app.css";

export default function App() {
  const [logged, setLogged] = useState(isAuthenticated());

  useEffect(() => {
    onNaoAutorizado(() => {
      logout();
      setLogged(false);
    });
    return () => onNaoAutorizado(null);
  }, []);

  if (!logged) return <Login onSuccess={() => setLogged(true)} />;

  function handleLogout() {
    logout();
    setLogged(false);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="projetos" element={<Projetos />} />
          <Route path="diario" element={<Diario />} />
          <Route path="orcamentos" element={<EmBreve titulo="Orçamentos" />} />
          <Route path="relatorios" element={<EmBreve titulo="Relatórios" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
