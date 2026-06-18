import { Hero } from "@/features/landing/hero";
import { RedirectIfAuthenticated } from "@/features/auth/redirect-if-authenticated";

/**
 * Landing route. A Server Component by default (blueprint/11, 17: RSC-first for
 * fast first paint and a small JS payload). A returning, signed-in visitor is
 * sent straight to the app.
 */
export default function HomePage() {
  return (
    <>
      <RedirectIfAuthenticated />
      <Hero />
    </>
  );
}
