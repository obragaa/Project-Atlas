import { type Equipment, type MuscleGroup } from "@atlas/contracts";

/** Display labels for the closed sets (Portuguese — blueprint/01 tom de voz). */
export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: "Peito",
  back: "Costas",
  shoulders: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  legs: "Pernas",
  glutes: "Glúteos",
  core: "Core",
  fullBody: "Corpo inteiro",
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: "Barra",
  dumbbell: "Halteres",
  machine: "Máquina",
  bodyweight: "Peso do corpo",
  cable: "Cabo",
  other: "Outro",
};
