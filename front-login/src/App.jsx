import { useState } from "react";
import Login from "./pages/Login";
import { isAuthenticated, logout } from "./services/authService";

export default function App() {
  const [logged, setLogged] = useState(isAuthenticated());

  if (!logged) return <Login onSuccess={() => setLogged(true)} />;

  // Placeholder até a tela de Dashboard existir
  return (
    <main style={{ padding: 24 }}>
      <h1>Login realizado ✔</h1>
      <p>Aqui entrará o Dashboard.</p>
      <button
        onClick={() => {
          logout();
          setLogged(false);
        }}
      >
        Sair
      </button>
    </main>
  );
}
