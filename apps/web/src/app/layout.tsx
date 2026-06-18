import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { LivingBackground } from "@/components/living-background/living-background";
import { AuthProvider } from "@/features/auth/auth-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Atlas — Evolução física inteligente",
    template: "%s · Atlas",
  },
  description:
    "Mais que uma plataforma fitness. Um ecossistema inteligente para a evolução humana.",
  applicationName: "Atlas",
};

export const viewport: Viewport = {
  themeColor: "#06080c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-dvh font-sans text-text-primary antialiased">
        <LivingBackground />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
