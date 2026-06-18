import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/auth-shell";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Comece sua jornada"
      description="Leva menos de um minuto. Pedimos apenas o essencial."
      footer={
        <>
          Já tem uma conta?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover">
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
