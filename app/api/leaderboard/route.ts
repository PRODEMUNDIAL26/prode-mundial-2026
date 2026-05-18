import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calcMatchPoints, calcTournamentBonus, type Phase } from "@/lib/scoring";
import { seed } from "@/lib/seed";

export async function GET() {
  try {
    seed();
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const db = getDb();

    const users = db
      .prepare("SELECT id, username FROM users ORDER BY username")
      .all() as { id: number; username: string }[];

    const finishedMatches = db
      .prepare(
        "SELECT id, phase, score_home, score_away FROM matches WHERE result_entered = 1"
      )
      .all() as {
      id: number;
      phase: string;
      score_home: number;
      score_away: number;
    }[];

    const tournamentResult = db
      .prepare("SELECT * FROM tournament_results WHERE id = 1")
      .get() as
      | { champion_team_id: number | null; top_scorer_name: string | null }
      | undefined;

    const leaderboard = users.map((user) => {
      const preds = db
        .prepare(
          "SELECT match_id, score_home, score_away FROM predictions WHERE user_id = ?"
        )
        .all(user.id) as {
        match_id: number;
        score_home: number;
        score_away: number;
      }[];
      const predMap: Record<number, { score_home: number; score_away: number }> =
        {};
      for (const p of preds) predMap[p.match_id] = p;

      let matchPoints = 0;
      for (const match of finishedMatches) {
        const pred = predMap[match.id];
        if (!pred) continue;
        matchPoints += calcMatchPoints(
          pred.score_home,
          pred.score_away,
          match.score_home,
          match.score_away,
          match.phase as Phase
        );
      }

      const tournPred = db
        .prepare(
          "SELECT champion_team_id, top_scorer_name FROM tournament_predictions WHERE user_id = ?"
        )
        .get(user.id) as
        | { champion_team_id: number | null; top_scorer_name: string }
        | undefined;

      const bonus =
        tournamentResult && tournPred
          ? calcTournamentBonus(
              tournPred.champion_team_id,
              tournPred.top_scorer_name,
              tournamentResult.champion_team_id ?? null,
              tournamentResult.top_scorer_name ?? null
            )
          : 0;

      return {
        userId: user.id,
        username: user.username,
        matchPoints,
        bonus,
        total: matchPoints + bonus,
        predictedMatches: preds.length,
        finishedMatches: finishedMatches.length,
      };
    });

    leaderboard.sort((a, b) => b.total - a.total);

    return NextResponse.json({ leaderboard });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
