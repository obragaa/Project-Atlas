import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Bem-vindo de volta"
      description="Continue de onde parou na sua evolução."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/register" className="text-accent hover:text-accent-hover">
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
