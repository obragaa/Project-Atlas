import { type Equipment, type MuscleGroup } from "@atlas/contracts";

/**
 * The curated exercise catalogue (blueprint/07 "biblioteca completa", ADR-0004).
 * System-owned reference data loaded by the seed. Growing it ships as new data
 * here + a re-seed; entries are keyed by their stable `slug` so the seed is
 * idempotent (existing slugs are left untouched).
 */
export interface SeedExercise {
  readonly slug: string;
  readonly name: string;
  readonly primaryMuscle: MuscleGroup;
  readonly muscles: MuscleGroup[];
  readonly equipment: Equipment;
  readonly instructions: string;
  readonly tips: string[];
  readonly variations: string[];
}

export const EXERCISE_CATALOGUE: SeedExercise[] = [
  {
    slug: "barbell-bench-press",
    name: "Supino reto com barra",
    primaryMuscle: "chest",
    muscles: ["chest", "triceps", "shoulders"],
    equipment: "barbell",
    instructions:
      "Deite no banco, segure a barra um pouco mais aberto que os ombros e desça até o peito controlando o movimento, depois empurre de volta.",
    tips: ["Mantenha as escápulas retraídas", "Não deixe os cotovelos abrirem 90°"],
    variations: ["Supino inclinado", "Supino declinado"],
  },
  {
    slug: "incline-dumbbell-press",
    name: "Supino inclinado com halteres",
    primaryMuscle: "chest",
    muscles: ["chest", "shoulders", "triceps"],
    equipment: "dumbbell",
    instructions:
      "No banco inclinado a 30–45°, empurre os halteres para cima até quase a extensão total e desça controlando.",
    tips: ["Controle a descida", "Não bata os halteres no topo"],
    variations: ["Supino reto com halteres"],
  },
  {
    slug: "push-up",
    name: "Flexão de braço",
    primaryMuscle: "chest",
    muscles: ["chest", "triceps", "core"],
    equipment: "bodyweight",
    instructions:
      "Com o corpo em prancha, desça o peito até perto do chão e empurre de volta mantendo o tronco rígido.",
    tips: ["Mantenha o corpo alinhado", "Cotovelos próximos ao corpo"],
    variations: ["Flexão inclinada", "Flexão diamante"],
  },
  {
    slug: "barbell-back-squat",
    name: "Agachamento livre",
    primaryMuscle: "legs",
    muscles: ["legs", "glutes", "core"],
    equipment: "barbell",
    instructions:
      "Com a barra apoiada no trapézio, agache empurrando o quadril para trás até as coxas ficarem paralelas e suba.",
    tips: ["Joelhos alinhados aos pés", "Mantenha o tronco ereto"],
    variations: ["Agachamento frontal", "Agachamento goblet"],
  },
  {
    slug: "romanian-deadlift",
    name: "Levantamento terra romeno",
    primaryMuscle: "legs",
    muscles: ["legs", "glutes", "back"],
    equipment: "barbell",
    instructions:
      "Com leve flexão de joelhos, desça a barra junto às pernas empurrando o quadril para trás e volte contraindo os glúteos.",
    tips: ["Coluna neutra", "Sinta o alongamento posterior"],
    variations: ["Terra romeno com halteres"],
  },
  {
    slug: "walking-lunge",
    name: "Afundo caminhando",
    primaryMuscle: "legs",
    muscles: ["legs", "glutes", "core"],
    equipment: "dumbbell",
    instructions:
      "Dê um passo à frente e desça até o joelho de trás quase tocar o chão; alterne as pernas avançando.",
    tips: ["Tronco estável", "Joelho da frente sobre o tornozelo"],
    variations: ["Afundo estático", "Afundo reverso"],
  },
  {
    slug: "deadlift",
    name: "Levantamento terra",
    primaryMuscle: "back",
    muscles: ["back", "legs", "glutes", "core"],
    equipment: "barbell",
    instructions:
      "Com a barra no chão, segure-a, mantenha a coluna neutra e suba estendendo quadril e joelhos juntos.",
    tips: ["Barra próxima ao corpo", "Não arredonde a lombar"],
    variations: ["Terra sumô"],
  },
  {
    slug: "pull-up",
    name: "Barra fixa",
    primaryMuscle: "back",
    muscles: ["back", "biceps"],
    equipment: "bodyweight",
    instructions:
      "Pendurado na barra com pegada pronada, puxe o corpo até o queixo passar a barra e desça controlando.",
    tips: ["Inicie o movimento pelas escápulas", "Evite balançar"],
    variations: ["Barra supinada", "Barra assistida"],
  },
  {
    slug: "bent-over-row",
    name: "Remada curvada",
    primaryMuscle: "back",
    muscles: ["back", "biceps", "shoulders"],
    equipment: "barbell",
    instructions:
      "Com o tronco inclinado e a coluna neutra, puxe a barra em direção ao abdômen e desça controlando.",
    tips: ["Cotovelos rentes ao corpo", "Não use impulso"],
    variations: ["Remada unilateral com halter"],
  },
  {
    slug: "overhead-press",
    name: "Desenvolvimento militar",
    primaryMuscle: "shoulders",
    muscles: ["shoulders", "triceps", "core"],
    equipment: "barbell",
    instructions:
      "Em pé, com a barra na altura dos ombros, empurre acima da cabeça até a extensão total e desça controlando.",
    tips: ["Não hiperestenda a lombar", "Aperte os glúteos para estabilizar"],
    variations: ["Desenvolvimento com halteres", "Desenvolvimento sentado"],
  },
  {
    slug: "lateral-raise",
    name: "Elevação lateral",
    primaryMuscle: "shoulders",
    muscles: ["shoulders"],
    equipment: "dumbbell",
    instructions:
      "Com halteres ao lado do corpo, eleve os braços lateralmente até a altura dos ombros e desça devagar.",
    tips: ["Cotovelos levemente flexionados", "Evite balançar o tronco"],
    variations: ["Elevação lateral no cabo"],
  },
  {
    slug: "bicep-curl",
    name: "Rosca direta",
    primaryMuscle: "biceps",
    muscles: ["biceps"],
    equipment: "dumbbell",
    instructions:
      "Com os cotovelos junto ao corpo, flexione os braços levando os halteres aos ombros e desça controlando.",
    tips: ["Não use impulso", "Controle a fase negativa"],
    variations: ["Rosca martelo", "Rosca na barra W"],
  },
  {
    slug: "triceps-pushdown",
    name: "Tríceps na polia",
    primaryMuscle: "triceps",
    muscles: ["triceps"],
    equipment: "cable",
    instructions:
      "Na polia alta, com cotovelos fixos ao lado do corpo, estenda os braços para baixo e retorne controlando.",
    tips: ["Cotovelos imóveis", "Extensão completa"],
    variations: ["Tríceps corda", "Tríceps testa"],
  },
  {
    slug: "hip-thrust",
    name: "Elevação de quadril",
    primaryMuscle: "glutes",
    muscles: ["glutes", "legs"],
    equipment: "barbell",
    instructions:
      "Com as costas apoiadas no banco e a barra sobre o quadril, eleve o quadril até a extensão e desça controlando.",
    tips: ["Contraia os glúteos no topo", "Queixo levemente para baixo"],
    variations: ["Ponte de glúteo no chão"],
  },
  {
    slug: "plank",
    name: "Prancha",
    primaryMuscle: "core",
    muscles: ["core", "shoulders"],
    equipment: "bodyweight",
    instructions:
      "Apoie antebraços e pontas dos pés, mantenha o corpo alinhado e contraído pelo tempo determinado.",
    tips: ["Não deixe o quadril cair", "Respire de forma constante"],
    variations: ["Prancha lateral", "Prancha com elevação de perna"],
  },
];
