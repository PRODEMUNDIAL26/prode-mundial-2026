export type Phase =
  | "group"
  | "round32"
  | "round16"
  | "quarterfinal"
  | "semifinal"
  | "final";

const MULTIPLIERS: Record<Phase, number> = {
  group: 1,
  round32: 1.5,
  round16: 2,
  quarterfinal: 2,
  semifinal: 3,
  final: 4,
};

export const PHASE_LABELS: Record<Phase, string> = {
  group: "Fase de Grupos",
  round32: "16avos de Final",
  round16: "Octavos de Final",
  quarterfinal: "Cuartos de Final",
  semifinal: "Semifinal",
  final: "Final",
};

function getResult(home: number, away: number): "home" | "draw" | "away" {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
}

export function calcMatchPoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number,
  phase: Phase
): number {
  const mult = MULTIPLIERS[phase];
  if (predHome === realHome && predAway === realAway) {
    return Math.round(3 * mult);
  }
  if (getResult(predHome, predAway) === getResult(realHome, realAway)) {
    return Math.round(1 * mult);
  }
  return 0;
}

export function calcTournamentBonus(
  predChampionId: number | null,
  predTopScorer: string,
  realChampionId: number | null,
  realTopScorer: string | null
): number {
  let bonus = 0;
  if (realChampionId && predChampionId === realChampionId) bonus += 18;
  if (
    realTopScorer &&
    predTopScorer.trim().toLowerCase() === realTopScorer.trim().toLowerCase()
  )
    bonus += 8;
  return bonus;
}
