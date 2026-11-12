"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { createPrompt, deletePrompt, importPrompts, type PromptDto, updatePrompt } from "@/app/actions";
import { authClient } from "@/lib/auth-client";

const LEGACY_KEY = "prompts_storage";
const LEGACY_DISMISSED_KEY = "prompts_storage_imported";

type LegacyPrompt = { title: string; content: string };

const htmlToText = (html: string) => {
  const element = document.createElement("div");
  element.innerHTML = html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(div|p)>/gi, "\n");
  return (element.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
};

const readLegacyPrompts = (): LegacyPrompt[] => {
  try {
    if (localStorage.getItem(LEGACY_DISMISSED_KEY)) return [];
    const parsed: unknown = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        title: htmlToText(String(item?.title ?? "")),
        content: htmlToText(String(item?.content ?? "")),
      }))
      .filter((item) => item.title && item.content);
  } catch {
    return [];
  }
};

type Props = {
  initialPrompts: PromptDto[];
  user: { name: string; image: string | null };
};

export default function PromptsApp({ initialPrompts, user }: Props) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [legacyPrompts, setLegacyPrompts] = useState<LegacyPrompt[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLegacyPrompts(readLegacyPrompts());
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const filteredPrompts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return prompts;
    return prompts.filter((prompt) => prompt.title.toLowerCase().includes(term));
  }, [prompts, search]);

  const isDirty = useMemo(() => {
    const selected = prompts.find((prompt) => prompt.id === selectedId);
    if (!selected) return Boolean(title.trim() || content.trim());
    return selected.title !== title || selected.content !== content;
  }, [prompts, selectedId, title, content]);

  const confirmDiscard = () => !isDirty || window.confirm("Descartar as alterações não salvas?");

  const handleNew = () => {
    if (!confirmDiscard()) return;
    setSelectedId(null);
    setTitle("");
    setContent("");
    setIsSidebarOpen(false);
  };

  const handleSelect = (prompt: PromptDto) => {
    if (prompt.id === selectedId || !confirmDiscard()) return;
    setSelectedId(prompt.id);
    setTitle(prompt.title);
    setContent(prompt.content);
    setIsSidebarOpen(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      const input = { title, content };
      const result = selectedId ? await updatePrompt(selectedId, input) : await createPrompt(input);
      if (!result.ok) {
        setFeedback({ type: "error", text: result.error });
        return;
      }
      setPrompts((current) => [result.data, ...current.filter((prompt) => prompt.id !== result.data.id)]);
      setSelectedId(result.data.id);
      setTitle(result.data.title);
      setContent(result.data.content);
      setFeedback({ type: "success", text: "Prompt salvo." });
    });
  };

  const handleDelete = (prompt: PromptDto) => {
    if (!window.confirm(`Excluir "${prompt.title}"?`)) return;
    startTransition(async () => {
      const result = await deletePrompt(prompt.id);
      if (!result.ok) {
        setFeedback({ type: "error", text: result.error });
        return;
      }
      setPrompts((current) => current.filter((item) => item.id !== prompt.id));
      if (prompt.id === selectedId) {
        setSelectedId(null);
        setTitle("");
        setContent("");
      }
    });
  };

  const handleCopy = async () => {
    if (!content.trim()) {
      setFeedback({ type: "error", text: "Nada para copiar." });
      return;
    }
    try {
      await navigator.clipboard.writeText(content);
      setFeedback({ type: "success", text: "Conteúdo copiado." });
    } catch {
      setFeedback({ type: "error", text: "Não foi possível copiar." });
    }
  };

  const dismissLegacy = () => {
    localStorage.setItem(LEGACY_DISMISSED_KEY, "1");
    setLegacyPrompts([]);
  };

  const handleImport = () => {
    startTransition(async () => {
      const result = await importPrompts(legacyPrompts);
      if (!result.ok) {
        setFeedback({ type: "error", text: result.error });
        return;
      }
      setPrompts(result.data);
      dismissLegacy();
      setFeedback({ type: "success", text: "Prompts importados para a sua conta." });
    });
  };

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <div className="app">
      <aside className={`sidebar${isSidebarOpen ? " open" : ""}`}>
        <header className="sidebar-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Prompts" className="logo" />
          <button className="btn-icon close-toggle" onClick={() => setIsSidebarOpen(false)} aria-label="Fechar menu">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/collapse.svg" alt="" className="icon" />
          </button>
        </header>

        <div className="search">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/search.svg" alt="" className="icon search-icon" />
          <input
            type="search"
            placeholder="Buscar por título"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button className="btn btn-primary btn-full" onClick={handleNew}>
          Novo prompt
        </button>

        {legacyPrompts.length > 0 && (
          <div className="import-banner">
            <p>
              Encontramos {legacyPrompts.length} {legacyPrompts.length === 1 ? "prompt salvo" : "prompts salvos"} neste
              navegador.
            </p>
            <div className="import-actions">
              <button className="btn btn-primary btn-small" onClick={handleImport} disabled={isPending}>
                Importar
              </button>
              <button className="btn btn-outline btn-small" onClick={dismissLegacy} disabled={isPending}>
                Ignorar
              </button>
            </div>
          </div>
        )}

        <ul className="prompt-list">
          {filteredPrompts.length === 0 && (
            <li className="empty-state">{search ? "Nenhum prompt encontrado." : "Nenhum prompt salvo ainda."}</li>
          )}
          {filteredPrompts.map((prompt) => (
            <li key={prompt.id} className={`prompt-item${prompt.id === selectedId ? " active" : ""}`}>
              <button className="prompt-item-content" onClick={() => handleSelect(prompt)}>
                <span className="prompt-item-title">{prompt.title}</span>
                <span className="prompt-item-description">{prompt.content}</span>
              </button>
              <button
                className="btn-icon"
                onClick={() => handleDelete(prompt)}
                aria-label={`Excluir ${prompt.title}`}
                disabled={isPending}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/remove.svg" alt="" className="icon" />
              </button>
            </li>
          ))}
        </ul>

        <footer className="user">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="avatar" referrerPolicy="no-referrer" />
          ) : (
            <span className="avatar avatar-fallback">{user.name.charAt(0).toUpperCase()}</span>
          )}
          <span className="user-name">{user.name}</span>
          <button className="btn-link" onClick={handleLogout}>
            Sair
          </button>
        </footer>
      </aside>

      {isSidebarOpen && <div className="backdrop" onClick={() => setIsSidebarOpen(false)} />}

      <main className="main">
        <header className="main-header">
          <button className="btn-icon open-toggle" onClick={() => setIsSidebarOpen(true)} aria-label="Abrir menu">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/open.svg" alt="" className="icon" />
          </button>
          <div className="actions">
            <button className="btn btn-outline" onClick={handleCopy}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/copy.svg" alt="" className="icon" />
              Copiar
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={isPending}>
              {isPending ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </header>

        <section className="editor">
          <input
            className="prompt-title"
            placeholder="Título do prompt"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
          />
          <textarea
            className="prompt-content"
            placeholder="Conteúdo do prompt ..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </section>

        {feedback && <div className={`toast toast-${feedback.type}`}>{feedback.text}</div>}
      </main>
    </div>
  );
}
