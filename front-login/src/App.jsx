import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projetos from "./pages/Projetos";
import Diario from "./pages/Diario";
import Orcamentos from "./pages/Orcamentos";
import Relatorios from "./pages/Relatorios";
import { isAuthenticated, logout } from "./services/authService";
import "./styles/app.css";
import "./styles/tema.css"; // identidade visual: precisa ser o último

export default function App() {
  const [logged, setLogged] = useState(isAuthenticated());

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
          <Route path="orcamentos" element={<Orcamentos />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
