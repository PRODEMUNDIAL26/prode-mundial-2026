import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { championTeamId, topScorerName } = await req.json();

    const db = getDb();
    db.prepare(
      `INSERT INTO tournament_results (id, champion_team_id, top_scorer_name)
       VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         champion_team_id = excluded.champion_team_id,
         top_scorer_name = excluded.top_scorer_name`
    ).run(championTeamId || null, topScorerName || "");

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
