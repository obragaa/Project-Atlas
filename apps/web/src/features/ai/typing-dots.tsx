/**
 * TypingDots — the "Atlas is thinking" affordance shown while a chat turn is in
 * flight (blueprint/04 Motion: purposeful, honors reduced motion via the shared
 * keyframe). Labeled for assistive tech so the pending state is announced.
 */
export function TypingDots() {
  return (
    <span className="flex gap-1" aria-label="Atlas está digitando">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 rounded-full bg-text-tertiary"
          style={{
            animation: "atlas-pulse-glow 1.2s ease-in-out infinite",
            animationDelay: `${delay}ms`,
          }}
        />
      ))}
    </span>
  );
}
