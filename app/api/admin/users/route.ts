import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const db = getDb();
  const users = db
    .prepare(
      "SELECT id, username, is_admin, created_at FROM users ORDER BY created_at"
    )
    .all();

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { username, password, isAdmin } = await req.json();

  if (!username || !password || username.length < 3 || password.length < 6) {
    return NextResponse.json(
      { error: "Usuario mínimo 3 chars, contraseña mínimo 6" },
      { status: 400 }
    );
  }

  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username);
  if (existing) {
    return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  db.prepare(
    "INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)"
  ).run(username, hash, isAdmin ? 1 : 0);

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (userId === session.userId) {
    return NextResponse.json(
      { error: "No podés eliminar tu propia cuenta" },
      { status: 400 }
    );
  }

  const db = getDb();
  db.prepare("DELETE FROM predictions WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM tournament_predictions WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM users WHERE id = ?").run(userId);

  return NextResponse.json({ ok: true });
}
