"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@atlas/ui";
import { ApiError } from "@/services/api-client";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/features/auth/auth-context";

/**
 * Login form. On success it stores the session (via the auth context) and sends
 * the user to their dashboard. A single, user-safe message on failure — the API
 * never reveals whether the email exists (blueprint/16, mirrored here).
 */
export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const session = await authService.login({ email, password });
      signIn(session);
      router.replace("/dashboard");
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.problem.detail
          : "Não foi possível entrar agora. Tente novamente.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate className="flex flex-col gap-5">
      {formError ? (
        <p
          role="alert"
          className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text"
        >
          {formError}
        </p>
      ) : null}

      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        requiredField
      />
      <Input
        label="Senha"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        requiredField
      />

      <Button type="submit" fullWidth isLoading={isSubmitting} loadingText="Entrando">
        Entrar
      </Button>
    </form>
  );
}
