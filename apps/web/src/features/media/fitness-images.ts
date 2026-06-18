import { type Equipment, type MuscleGroup } from "@atlas/contracts";

/**
 * Curated fitness imagery (blueprint/01 Brand: premium, energetic). Stable
 * Unsplash CDN URLs with sizing params so next/image optimizes them. Centralized
 * so every screen draws from one coherent visual library.
 *
 * `&w=…&q=…&auto=format&fit=crop` keeps payloads small; the photos are dark,
 * high-contrast gym/training shots that sit well under the dark theme.
 */
const U = (id: string, w = 1200, q = 70) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

/** Big, cinematic hero shots (landing, dashboard banner). */
export const HERO_IMAGES = {
  landing: U("1534438327276-14e5300c3a48", 1920, 72), // athlete lifting, dramatic
  dashboard: U("1517836357463-d25dfeac3438", 1600, 70), // gym interior, moody
  auth: U("1517963879433-6ad2b056d712", 1600, 70), // dumbbells, dark
} as const;

/** A muscle-group → photo map (exercise cards/detail, filters). */
export const MUSCLE_IMAGES: Record<MuscleGroup, string> = {
  chest: U("1571019613454-1cb2f99b2d8b", 800), // bench press
  back: U("1599058917212-d750089bc07e", 800), // pull / back
  shoulders: U("1532029837206-abbe2b7620e3", 800), // overhead
  biceps: U("1581009146145-b5ef050c2e1e", 800), // arm curl
  triceps: U("1581009137042-c552e485697a", 800), // arms
  legs: U("1434608519344-49d77a699e1d", 800), // squat / legs
  glutes: U("1518611012118-696072aa579a", 800), // lower body
  core: U("1517344884509-a0c97ec11bcc", 800), // core / abs
  fullBody: U("1546483875-ad9014c88eba", 800), // full body training
};

/** Equipment → small accent photo (optional use). */
export const EQUIPMENT_IMAGES: Record<Equipment, string> = {
  barbell: U("1534368420009-621bfab424a8", 600),
  dumbbell: U("1517963879433-6ad2b056d712", 600),
  machine: U("1576678927484-cc907957088c", 600),
  bodyweight: U("1518611012118-696072aa579a", 600),
  cable: U("1591940765318-90c5c5f3e3d2", 600),
  other: U("1571902943202-507ec2618e8f", 600),
};

/** A deterministic muscle image for a given exercise (by primary muscle). */
export function exerciseImage(primaryMuscle: MuscleGroup): string {
  return MUSCLE_IMAGES[primaryMuscle];
}
