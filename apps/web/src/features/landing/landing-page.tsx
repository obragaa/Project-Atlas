import { HeroSection } from "@/features/landing/sections/hero-section";
import { StatsSection } from "@/features/landing/sections/stats-section";
import { FeaturesSection } from "@/features/landing/sections/features-section";
import { MuscleShowcaseSection } from "@/features/landing/sections/muscle-showcase-section";
import { CtaSection } from "@/features/landing/sections/cta-section";
import { FooterSection } from "@/features/landing/sections/footer-section";

/**
 * Landing page — the public marketing surface (blueprint/00 vision, 01 brand,
 * 03 first session). Composed of self-contained sections so each stays simple
 * and independently editable. Server-rendered by default (blueprint/11, 17:
 * RSC-first) for fast first paint; only motion-bearing children opt into the
 * client where needed.
 */
export function LandingPage() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <MuscleShowcaseSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
