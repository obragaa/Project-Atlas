import { type SVGProps } from "react";

/**
 * Landing iconography — light, single-stroke line icons that inherit color via
 * `currentColor` (blueprint/05: tokens first, no hardcoded hues). Each icon is
 * decorative; callers provide an accessible label on the surrounding element.
 */
type IconProps = SVGProps<SVGSVGElement>;

const baseProps: IconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

/** Dumbbell — building / programming workouts. */
export function DumbbellIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6.5 6.5 17.5 17.5" />
      <path d="M3 8.5 5 6.5l2 2-2 2-2-2Z" />
      <path d="M8.5 3 6.5 5l2 2 2-2-2-2Z" />
      <path d="M21 15.5 19 17.5l-2-2 2-2 2 2Z" />
      <path d="M15.5 21l2-2-2-2-2 2 2 2Z" />
    </svg>
  );
}

/** Library / catalogue — searchable exercise library. */
export function LibraryIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 4h4v16H5z" />
      <path d="M11 4h4v16h-4z" />
      <path d="m17.5 5 3 .8-3 14-3-.8" />
    </svg>
  );
}

/** Trending line — progress / evolution tracking. */
export function TrendingIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 17 9 11l4 4 8-8" />
      <path d="M21 7v5h-5" />
    </svg>
  );
}

/** Spark — Atlas intelligence (coming soon). */
export function SparkIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z" />
    </svg>
  );
}

/** Arrow — inline CTA affordance. */
export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
