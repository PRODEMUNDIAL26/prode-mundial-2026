import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { seed } from "@/lib/seed";

export async function GET() {
  try {
    seed();
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const db = getDb();
    const matches = db
      .prepare(
        `SELECT m.*,
          ht.name as home_name, ht.flag as home_flag, ht.iso_code as home_iso, ht.group_letter as home_group,
          at.name as away_name, at.flag as away_flag, at.iso_code as away_iso, at.group_letter as away_group
        FROM matches m
        LEFT JOIN teams ht ON m.home_team_id = ht.id
        LEFT JOIN teams at ON m.away_team_id = at.id
        ORDER BY m.kickoff_at ASC`
      )
      .all();

    const predictions = db
      .prepare(
        "SELECT match_id, score_home, score_away FROM predictions WHERE user_id = ?"
      )
      .all(session.userId) as {
      match_id: number;
      score_home: number;
      score_away: number;
    }[];

    const predMap: Record<
      number,
      { score_home: number; score_away: number }
    > = {};
    for (const p of predictions) {
      predMap[p.match_id] = { score_home: p.score_home, score_away: p.score_away };
    }

    return NextResponse.json({ matches, predictions: predMap });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
