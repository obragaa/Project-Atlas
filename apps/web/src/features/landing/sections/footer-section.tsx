import Link from "next/link";

/**
 * Footer — tasteful and quiet (blueprint/05: calm, organized). The brand mark,
 * a short tagline, and small print. Tokenized borders and text only.
 */
export function FooterSection() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div>
          <div className="flex items-center gap-2 sm:justify-start">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-tight text-text-primary">Atlas</span>
          </div>
          <p className="mt-2 max-w-xs text-sm text-text-tertiary">
            Inteligência a serviço da sua evolução física.
          </p>
        </div>

        <nav className="flex items-center gap-6 text-sm text-text-secondary">
          <Link href="/login" className="transition-colors hover:text-text-primary">
            Entrar
          </Link>
          <Link href="/register" className="transition-colors hover:text-text-primary">
            Criar conta
          </Link>
        </nav>
      </div>

      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-text-tertiary sm:text-left">
        © {year} Atlas. Treine com inteligência.
      </p>
    </footer>
  );
}
