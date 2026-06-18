"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { Button, Card, CardDescription, CardHeader, CardTitle, Input } from "@atlas/ui";
import { ApiError } from "@/services/api-client";
import { authService } from "@/services/auth.service";

interface SessionGateProps {
  title: string;
  description: string;
  /** Rendered once an access token is obtained; receives the token + a sign-out. */
  children: (accessToken: string, signOut: () => void) => ReactNode;
}

/**
 * Inline session gate (the `features` layer — blueprint/11). Until persistent
 * client sessions are wired (a follow-up), screens that call the API obtain an
 * access token here and keep it in memory for the session — never in storage.
 */
export function SessionGate({ title, description, children }: SessionGateProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  if (accessToken) {
    return <>{children(accessToken, () => setAccessToken(null))}</>;
  }
  return <SignIn title={title} description={description} onSignedIn={setAccessToken} />;
}

function SignIn({
  title,
  description,
  onSignedIn,
}: {
  title: string;
  description: string;
  onSignedIn: (token: string) => void;
}) {
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
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
