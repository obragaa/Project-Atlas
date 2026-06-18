"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { type WorkoutSummaryView } from "@atlas/contracts";
import { Button, Card, CardDescription, CardHeader, CardTitle, Input, Skeleton } from "@atlas/ui";
import { ApiError } from "@/services/api-client";
import { authService } from "@/services/auth.service";
import { workoutsService } from "@/services/workouts.service";

/**
 * Workouts board (the `features` layer — blueprint/11). Lists the user's
 * workouts and lets them create, complete, duplicate, and delete — all through
 * the typed service against the shared contract.
 *
 * Session note: persistent client sessions are not wired yet (a follow-up).
 * This screen authenticates inline to obtain an access token, kept in memory
 * for the session; it is never written to storage here. The board degrades
 * gracefully: an expired token surfaces a user-safe message and a re-auth.
 */
export function WorkoutsBoard() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  if (!accessToken) {
    return <SignIn onSignedIn={setAccessToken} />;
  }
  return <Board accessToken={accessToken} onSignOut={() => setAccessToken(null)} />;
}

function SignIn({ onSignedIn }: { onSignedIn: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const session = await authService.login({ email, password });
      onSignedIn(session.tokens.accessToken);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.problem.detail
          : "Não foi possível entrar agora. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card padding="lg" className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Seus treinos</CardTitle>
        <CardDescription>Entre para ver e gerenciar seus treinos.</CardDescription>
      </CardHeader>
      <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-5">
        {error ? (
          <p
            role="alert"
            className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text"
          >
            {error}
          </p>
        ) : null}
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          requiredField
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          requiredField
        />
        <Button type="submit" fullWidth isLoading={busy} loadingText="Entrando">
          Entrar
        </Button>
      </form>
    </Card>
  );
}

function Board({ accessToken, onSignOut }: { accessToken: string; onSignOut: () => void }) {
  const [workouts, setWorkouts] = useState<WorkoutSummaryView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handle = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.problem.status === 401) {
        onSignOut();
        return;
      }
      setError(err instanceof ApiError ? err.problem.detail : "Algo deu errado. Tente novamente.");
    },
    [onSignOut],
  );

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const page = await workoutsService.list(accessToken);
      setWorkouts([...page.items]);
    } catch (err) {
      handle(err);
    }
  }, [accessToken, handle]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newName.trim()) {
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await workoutsService.create(accessToken, { name: newName.trim() });
      setNewName("");
      await refresh();
    } catch (err) {
      handle(err);
    } finally {
      setCreating(false);
    }
  }

  async function act(id: string, fn: () => Promise<unknown>) {
    setPendingId(id);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (err) {
      handle(err);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Treinos</h1>
          <p className="text-sm text-text-secondary">Crie, conclua e organize seus treinos.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onSignOut}>
          Sair
        </Button>
      </header>

      <Card padding="md">
        <form onSubmit={(e) => void onCreate(e)} className="flex items-end gap-3">
          <Input
            label="Novo treino"
            placeholder="Ex.: Push Day"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" isLoading={creating} loadingText="Criando">
            Adicionar
          </Button>
        </form>
      </Card>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text"
        >
          {error}
        </p>
      ) : null}

      {workouts === null ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : workouts.length === 0 ? (
        <Card padding="lg">
          <CardDescription>
            Você ainda não tem treinos. Crie o primeiro acima para começar.
          </CardDescription>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {workouts.map((w) => (
            <li key={w.id}>
              <Card padding="md" className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-text-primary">{w.name}</p>
                    <p className="text-xs text-text-tertiary">
                      {w.itemCount} {w.itemCount === 1 ? "exercício" : "exercícios"} ·{" "}
                      <StatusBadge status={w.status} />
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={pendingId === w.id}
                    disabled={w.status === "completed"}
                    onClick={() =>
                      void act(w.id, () => workoutsService.complete(accessToken, w.id))
                    }
                  >
                    Concluir
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    isLoading={pendingId === w.id}
                    onClick={() =>
                      void act(w.id, () => workoutsService.duplicate(accessToken, w.id))
                    }
                  >
                    Duplicar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    isLoading={pendingId === w.id}
                    onClick={() => void act(w.id, () => workoutsService.remove(accessToken, w.id))}
                  >
                    Excluir
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: WorkoutSummaryView["status"] }) {
  const label = status === "completed" ? "Concluído" : status === "active" ? "Ativo" : "Rascunho";
  return <span className="text-text-secondary">{label}</span>;
}
