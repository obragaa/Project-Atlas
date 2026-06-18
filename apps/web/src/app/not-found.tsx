import Link from "next/link";
import { buttonVariants, cn } from "@atlas/ui";

/**
 * 404 — never a dead end (blueprint/02 "Sem páginas mortas", 01 empty states:
 * transmit opportunity, offer a clear next action).
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm text-text-tertiary">404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
        Esta página não foi encontrada.
      </h1>
      <p className="mt-3 text-text-secondary">
        O caminho mudou ou nunca existiu. Vamos te levar de volta ao seu ponto de partida.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
        Voltar ao início
      </Link>
    </main>
  );
}
