import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Política de Privacidade | Prompts Manager" };

export default function PrivacyPage() {
  return (
    <main className="legal">
      <Link href="/" className="legal-back">
        ← Voltar
      </Link>
      <h1>Política de Privacidade</h1>
      <p className="legal-updated">Atualizada em 12 de novembro de 2026</p>

      <h2>Quais dados coletamos</h2>
      <p>
        Ao entrar com o Google, recebemos apenas seu nome, e-mail e foto de perfil. Também guardamos os prompts que
        você cria (título e conteúdo) e dados técnicos da sessão, como endereço IP e navegador, usados para manter
        você conectado com segurança.
      </p>

      <h2>Como usamos</h2>
      <p>
        Os dados servem só para identificar sua conta e mostrar os seus prompts em qualquer dispositivo. Não vendemos,
        não compartilhamos com terceiros e não usamos para publicidade.
      </p>

      <h2>Onde ficam armazenados</h2>
      <p>
        Os dados ficam em um banco de dados PostgreSQL hospedado pela Neon, e a aplicação roda na Vercel. Cada
        usuário só tem acesso aos próprios prompts.
      </p>

      <h2>Exclusão</h2>
      <p>
        Você pode excluir qualquer prompt a qualquer momento no app. Para apagar sua conta e todos os dados, envie um
        e-mail para <a href="mailto:rodrigo.giulietti05@gmail.com">rodrigo.giulietti05@gmail.com</a>.
      </p>
    </main>
  );
}
