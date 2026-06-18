import { Hero } from "@/features/landing/hero";

/**
 * Landing route. A Server Component by default (blueprint/11, 17: RSC-first for
 * fast first paint and a small JS payload).
 */
export default function HomePage() {
  return <Hero />;
}
