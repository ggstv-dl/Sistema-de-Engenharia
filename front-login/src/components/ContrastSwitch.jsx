import { useHighContrast } from "../hooks/useHighContrast";

// Interruptor de alto contraste usado dentro do app (a tela de login tem o próprio).
export default function ContrastSwitch() {
  const [enabled, toggle] = useHighContrast();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      className="contrast-switch"
      onClick={toggle}
    >
      <span>Alto contraste</span>
      <span className="switch-track" aria-hidden="true">
        <span className="switch-knob" />
      </span>
    </button>
  );
}
