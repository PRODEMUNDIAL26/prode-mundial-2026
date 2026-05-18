import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Tournament starts June 11, 2026 — predictions lock 24h before
const TOURNAMENT_START = new Date("2026-06-11T15:00:00Z");
const PREDICTION_DEADLINE = new Date(
  TOURNAMENT_START.getTime() - 24 * 60 * 60 * 1000
);

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = getDb();
  const pred = db
    .prepare(
      "SELECT tp.*, t.name as champion_name, t.flag as champion_flag FROM tournament_predictions tp LEFT JOIN teams t ON tp.champion_team_id = t.id WHERE tp.user_id = ?"
    )
    .get(session.userId);

  const teams = db
    .prepare("SELECT id, name, flag, group_letter FROM teams ORDER BY group_letter, name")
    .all();

  const locked = new Date() >= PREDICTION_DEADLINE;

  return NextResponse.json({ prediction: pred, teams, locked });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (new Date() >= PREDICTION_DEADLINE) {
    return NextResponse.json(
      { error: "El plazo para predicciones del torneo ha cerrado" },
      { status: 400 }
    );
  }

  const { championTeamId, topScorerName } = await req.json();

  const db = getDb();
  db.prepare(
    `INSERT INTO tournament_predictions (user_id, champion_team_id, top_scorer_name)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       champion_team_id = excluded.champion_team_id,
       top_scorer_name = excluded.top_scorer_name,
       submitted_at = datetime('now')`
  ).run(session.userId, championTeamId || null, topScorerName || "");

  return NextResponse.json({ ok: true });
}
