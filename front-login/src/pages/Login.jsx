import { useState } from "react";
import { login, registrar } from "../services/authService";
import { useHighContrast } from "../hooks/useHighContrast";
import logoAzul from "../assets/logo-principal-azul.png";
import "../styles/login.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ mode, nome, email, senha, confirmar }) {
  const errors = {};
  if (mode === "criar" && nome.trim().length < 3)
    errors.nome = "Informe seu nome completo.";
  if (!email.trim()) errors.email = "Informe seu e-mail.";
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = "E-mail inválido.";
  if (!senha) errors.senha = "Informe sua senha.";
  else if (mode === "criar" && senha.length < 8)
    errors.senha = "A senha deve ter ao menos 8 caracteres.";
  else if (mode !== "criar" && senha.length < 6)
    errors.senha = "A senha deve ter ao menos 6 caracteres.";
  if (mode === "criar" && senha && confirmar !== senha)
    errors.confirmar = "As senhas não são iguais.";
  return errors;
}

function Field({ id, label, error, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <span id={`${id}-error`} className="error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default function Login({ onSuccess }) {
  const [mode, setMode] = useState("entrar"); // "entrar" | "criar"
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [highContrast, toggleContrast] = useHighContrast();

  const isCreate = mode === "criar";

  function changeMode(next) {
    if (loading) return;
    setMode(next);
    setErrors({});
    setServerError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const found = validate({ mode, nome, email, senha, confirmar });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      const data = isCreate
        ? await registrar(nome.trim(), email.trim(), senha)
        : await login(email.trim(), senha);
      onSuccess?.(data);
    } catch (err) {
      if (err.status === 401) setServerError("E-mail ou senha incorretos.");
      else if (err.status === 409)
        setServerError("Este e-mail já está cadastrado.");
      else setServerError(err.message || "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  }

  const describe = (key) => (errors[key] ? `${key}-error` : undefined);

  return (
    <main className="login-page">
      <button
        type="button"
        role="switch"
        aria-checked={highContrast}
        className="contrast-switch"
        onClick={toggleContrast}
      >
        <span>Alto contraste</span>
        <span className="switch-track" aria-hidden="true">
          <span className="switch-knob" />
        </span>
      </button>

      <section className="login-card" aria-labelledby="login-title">
        <div className="logo">
          <img className="logo-img" src={logoAzul} alt="Leandro Barros - Engenheiro Civil" />
        </div>

        <div className="tabs" role="tablist" aria-label="Acesso">
          <button
            type="button"
            role="tab"
            className="tab"
            aria-selected={!isCreate}
            onClick={() => changeMode("entrar")}
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            className="tab"
            aria-selected={isCreate}
            onClick={() => changeMode("criar")}
          >
            Criar conta
          </button>
        </div>

        <h1 id="login-title">{isCreate ? "Criar conta" : "Entrar"}</h1>
        <p className="subtitle">
          {isCreate
            ? "Cadastre-se para usar o sistema de gestão de obras"
            : "Acesse o sistema de gestão de obras"}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {isCreate && (
            <Field id="nome" label="Nome completo" error={errors.nome}>
              <input
                id="nome"
                type="text"
                placeholder="Seu nome"
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                aria-invalid={Boolean(errors.nome)}
                aria-describedby={describe("nome")}
                disabled={loading}
              />
            </Field>
          )}

          <Field id="email" label="E-mail" error={errors.email}>
            <input
              id="email"
              type="email"
              placeholder="voce@exemplo.com"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describe("email")}
              disabled={loading}
            />
          </Field>

          <Field id="senha" label="Senha" error={errors.senha}>
            <div className="password-wrap">
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                placeholder={isCreate ? "Mínimo de 8 caracteres" : "Sua senha"}
                autoComplete={isCreate ? "new-password" : "current-password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                aria-invalid={Boolean(errors.senha)}
                aria-describedby={describe("senha")}
                disabled={loading}
              />
              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </Field>

          {isCreate && (
            <Field
              id="confirmar"
              label="Confirmar senha"
              error={errors.confirmar}
            >
              <input
                id="confirmar"
                type={showPassword ? "text" : "password"}
                placeholder="Repita a senha"
                autoComplete="new-password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                aria-invalid={Boolean(errors.confirmar)}
                aria-describedby={describe("confirmar")}
                disabled={loading}
              />
            </Field>
          )}

          {serverError && (
            <div className="server-error" role="alert">
              {serverError}
            </div>
          )}

          <button type="submit" className="submit" disabled={loading}>
            {loading
              ? isCreate
                ? "Criando conta..."
                : "Entrando..."
              : isCreate
              ? "Criar conta"
              : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
