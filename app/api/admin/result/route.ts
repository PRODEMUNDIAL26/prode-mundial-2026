import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
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
    db.prepare(
      "UPDATE matches SET score_home = ?, score_away = ?, result_entered = 1 WHERE id = ?"
    ).run(scoreHome, scoreAway, matchId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
