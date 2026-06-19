"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { type AiAction, type AiChatMessage } from "@atlas/contracts";
import { Button, Card, Input, cn } from "@atlas/ui";
import { ApiError } from "@/services/api-client";
import { aiService } from "@/services/ai.service";

interface TranscriptItem {
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly actions?: readonly AiAction[];
}

const SUGGESTIONS = [
  "Monta um treino de peito pra mim",
  "Monta um treino de pernas",
  "Como faço agachamento corretamente?",
  "Quero um treino de costas e bíceps",
];

/**
 * Atlas AI chat (the `features` layer — blueprint/10, 11). A conversation with
 * the AI that can take grounded actions (e.g. build a real workout). The
 * transcript is short-term memory passed back each turn (doc 22).
 */
export function AtlasChat() {
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, busy]);

  async function send(message: string) {
    const text = message.trim();
    if (!text || busy) return;
    setError(null);
    setInput("");

    const history: AiChatMessage[] = transcript.map((t) => ({
      role: t.role,
      content: t.content,
    }));
    setTranscript((prev) => [...prev, { role: "user", content: text }]);
    setBusy(true);

    try {
      const response = await aiService.chat({ history, message: text });
      setTranscript((prev) => [
        ...prev,
        { role: "assistant", content: response.reply, actions: response.actions },
      ]);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.problem.detail : "O Atlas AI está indisponível agora.",
      );
      // Roll back the optimistic user message? Keep it — the user can retry.
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  const empty = transcript.length === 0;

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-2xl flex-col gap-4">
      <header className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-on-accent">
          <SparkIcon />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Atlas AI</h1>
          <p className="text-sm text-text-secondary">Seu parceiro de treino inteligente.</p>
        </div>
      </header>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-border-subtle bg-surface-base/40 p-4">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <span
              className="grid h-16 w-16 place-items-center rounded-2xl bg-accent-subtle text-accent"
              style={{ animation: "atlas-pulse-glow 4s ease-in-out infinite" }}
            >
              <SparkIcon large />
            </span>
            <div>
              <p className="text-lg font-medium text-text-primary">
                Como posso ajudar no seu treino?
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Posso montar treinos com exercícios reais, explicar execução e tirar dúvidas.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-xl border border-border-subtle bg-surface-raised px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:border-border hover:text-text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {transcript.map((item, i) => (
              <li
                key={i}
                className={cn("flex", item.role === "user" ? "justify-end" : "justify-start")}
              >
                <div className="max-w-[85%]">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm",
                      item.role === "user"
                        ? "bg-accent text-on-accent"
                        : "bg-surface-raised text-text-primary",
                    )}
                  >
                    <p className="whitespace-pre-wrap">{item.content}</p>
                  </div>
                  {item.actions && item.actions.length > 0 ? (
                    <div className="mt-2 flex flex-col gap-2">
                      {item.actions.map((action, j) => (
                        <ActionCard key={j} action={action} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
            {busy ? (
              <li className="flex justify-start">
                <div className="rounded-2xl bg-surface-raised px-4 py-3">
                  <TypingDots />
                </div>
              </li>
            ) : null}
          </ul>
        )}
        <div ref={endRef} />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text"
        >
          {error}
        </p>
      ) : null}

      {/* Composer */}
      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <Input
          label="Mensagem"
          className="flex-1 [&_label]:sr-only"
          placeholder="Peça um treino ou tire uma dúvida…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
        />
        <Button type="submit" isLoading={busy} disabled={!input.trim()}>
          Enviar
        </Button>
      </form>
    </div>
  );
}

function ActionCard({ action }: { action: AiAction }) {
  return (
    <Link href={action.href}>
      <Card
        interactive
        padding="md"
        className="flex items-center gap-3 border-accent/40 bg-accent-subtle"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-on-accent">
          <DumbbellIcon />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">Treino criado</p>
          <p className="truncate font-medium text-text-primary">{action.label}</p>
        </div>
        <span className="ml-auto text-sm font-medium text-accent">Abrir →</span>
      </Card>
    </Link>
  );
}

function TypingDots() {
  return (
    <span className="flex gap-1" aria-label="Atlas está digitando">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 rounded-full bg-text-tertiary"
          style={{
            animation: "atlas-pulse-glow 1.2s ease-in-out infinite",
            animationDelay: `${delay}ms`,
          }}
        />
      ))}
    </span>
  );
}

function SparkIcon({ large }: { large?: boolean }) {
  const s = large ? 28 : 22;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4z" />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6.5 6.5 17.5 17.5M3 7v10M7 4v16M17 4v16M21 7v10" />
    </svg>
  );
}
