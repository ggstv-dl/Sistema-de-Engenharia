import { useEffect, useState } from "react";

const KEY = "se_high_contrast";

// Liga/desliga o modo de alto contraste (uso sob sol) e lembra a escolha.
export function useHighContrast() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.contrast = enabled ? "high" : "normal";
    try {
      localStorage.setItem(KEY, enabled ? "1" : "0");
    } catch {
      // armazenamento indisponível: segue sem lembrar
    }
  }, [enabled]);

  return [enabled, () => setEnabled((v) => !v)];
}
