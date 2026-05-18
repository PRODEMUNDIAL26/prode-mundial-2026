import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isDeadlinePassed } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { matchId, scoreHome, scoreAway } = await req.json();

    if (
      typeof scoreHome !== "number" ||
      typeof scoreAway !== "number" ||
      scoreHome < 0 ||
      scoreAway < 0
    ) {
      return NextResponse.json({ error: "Puntaje inválido" }, { status: 400 });
    }

    const db = getDb();
    const match = db
      .prepare("SELECT kickoff_at FROM matches WHERE id = ?")
      .get(matchId) as { kickoff_at: string } | undefined;

    if (!match) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 }
      );
    }

    if (isDeadlinePassed(match.kickoff_at)) {
      return NextResponse.json(
        { error: "El plazo de predicción ha cerrado (24hs antes del partido)" },
        { status: 400 }
      );
    }

    db.prepare(
      `INSERT INTO predictions (user_id, match_id, score_home, score_away)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, match_id) DO UPDATE SET
         score_home = excluded.score_home,
         score_away = excluded.score_away,
         submitted_at = datetime('now')`
    ).run(session.userId, matchId, scoreHome, scoreAway);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
