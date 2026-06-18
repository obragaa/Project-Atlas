"use client";

import { type FormEvent, useState } from "react";
import { Button, Input } from "@atlas/ui";
import { ApiError } from "@/services/api-client";
import { authService } from "@/services/auth.service";
import { type ValidationIssue } from "@atlas/contracts";

interface FormState {
  displayName: string;
  email: string;
  password: string;
}

const EMPTY: FormState = { displayName: "", email: "", password: "" };

/**
 * Register form — every required state is present (blueprint/02 "Estados
 * obrigatórios", 05): idle, loading, field-level errors, and a top-level error.
 * Field errors come from the API's RFC 7807 `issues`, mapped back to inputs.
 */
export function RegisterForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (key: keyof FormState) => (event: { target: { value: string } }) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      await authService.register(form);
      setDone(true);
    } catch (error) {
      if (error instanceof ApiError) {
        applyApiError(error.problem.issues, error.problem.detail);
      } else {
        setFormError("Não foi possível concluir o cadastro agora. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function applyApiError(issues: readonly ValidationIssue[] | undefined, detail: string) {
    if (issues && issues.length > 0) {
      setFieldErrors(Object.fromEntries(issues.map((i) => [i.field, i.message])));
      return;
    }
    setFormError(detail);
  }

  if (done) {
    return (
      <p role="status" className="text-text-secondary">
        Sua jornada começou. Bem-vindo ao Atlas.
      </p>
    );
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
        label="Nome"
        autoComplete="name"
        value={form.displayName}
        onChange={update("displayName")}
        error={fieldErrors.displayName}
        requiredField
      />
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={update("email")}
        error={fieldErrors.email}
        requiredField
      />
      <Input
        label="Senha"
        type="password"
        autoComplete="new-password"
        value={form.password}
        onChange={update("password")}
        hint="Pelo menos 12 caracteres."
        error={fieldErrors.password}
        requiredField
      />

      <Button type="submit" fullWidth isLoading={isSubmitting} loadingText="Criando sua conta">
        Criar conta
      </Button>
    </form>
  );
}
