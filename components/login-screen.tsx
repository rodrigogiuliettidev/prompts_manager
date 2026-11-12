"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    const { error: signInError } = await authClient.signIn.social({ provider: "google", callbackURL: "/" });
    if (signInError) {
      setError("Não foi possível entrar com o Google. Tente de novo.");
      setIsLoading(false);
    }
  };

  return (
    <main className="login">
      <div className="login-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Prompts" className="login-logo" />
        <h1 className="login-title">Seus prompts, em qualquer lugar</h1>
        <p className="login-text">
          Guarde, organize e copie seus prompts de IA. Entre com o Google para salvar tudo na sua conta e acessar
          de qualquer dispositivo.
        </p>
        <button className="btn btn-google btn-full" onClick={handleLogin} disabled={isLoading}>
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.4 12 2.4 6.8 2.4 2.6 6.6 2.6 12s4.2 9.6 9.4 9.6c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z" />
          </svg>
          {isLoading ? "Abrindo o Google…" : "Entrar com Google"}
        </button>
        {error && <p className="login-error">{error}</p>}
        <p className="login-note">
          Já usava o app antes? Depois de entrar, você pode importar os prompts salvos neste navegador.
        </p>
        <p className="login-legal">
          Ao entrar, você concorda com os <a href="/terms">Termos de Uso</a> e a{" "}
          <a href="/privacy">Política de Privacidade</a>.
        </p>
      </div>
    </main>
  );
}
