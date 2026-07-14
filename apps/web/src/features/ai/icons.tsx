/**
 * Atlas AI iconography (features/ai). Inline SVGs — no extra dependency; stroke
 * uses `currentColor` so color comes from the surrounding token classes
 * (blueprint/05 Design System, 06 Accessibility: decorative, `aria-hidden`).
 */

export function SparkIcon({ large }: { large?: boolean }) {
  const s = large ? 28 : 22;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4z" />
    </svg>
  );
}

export function DumbbellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6.5 6.5 17.5 17.5M3 7v10M7 4v16M17 4v16M21 7v10" />
    </svg>
  );
}
