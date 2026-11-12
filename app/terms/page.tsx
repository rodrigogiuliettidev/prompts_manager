import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Termos de Uso | Prompts Manager" };

export default function TermsPage() {
  return (
    <main className="legal">
      <Link href="/" className="legal-back">
        ← Voltar
      </Link>
      <h1>Termos de Uso</h1>
      <p className="legal-updated">Atualizados em 12 de novembro de 2026</p>

      <h2>O serviço</h2>
      <p>
        O Prompts Manager é um app gratuito para guardar e organizar prompts de IA. Ele é oferecido como está, sem
        garantia de disponibilidade contínua.
      </p>

      <h2>Seu conteúdo</h2>
      <p>
        Os prompts que você salva são seus. Você é responsável pelo que escreve e não deve usar o app para guardar
        senhas, dados sensíveis ou conteúdo ilegal.
      </p>

      <h2>Conta</h2>
      <p>
        O acesso é feito com a sua conta Google. Podemos suspender contas usadas para abuso do serviço. Você pode
        pedir a exclusão da conta a qualquer momento pelo e-mail{" "}
        <a href="mailto:rodrigo.giulietti05@gmail.com">rodrigo.giulietti05@gmail.com</a>.
      </p>

      <h2>Privacidade</h2>
      <p>
        O tratamento dos seus dados está descrito na <Link href="/privacy">Política de Privacidade</Link>.
      </p>
    </main>
  );
}
