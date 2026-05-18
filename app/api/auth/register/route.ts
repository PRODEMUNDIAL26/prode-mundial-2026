import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { seed } from "@/lib/seed";

export async function POST(req: NextRequest) {
  try {
    seed();
    const { username, password } = await req.json();

    if (!username || !password || username.length < 3 || password.length < 6) {
      return NextResponse.json(
        { error: "Usuario mínimo 3 caracteres, contraseña mínimo 6" },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(username);
    if (existing) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);
    const isFirstUser =
      (db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number })
        .c === 0;

    const result = db
      .prepare(
        "INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)"
      )
      .run(username, hash, isFirstUser ? 1 : 0);

    const session = await getSession();
    session.userId = result.lastInsertRowid as number;
    session.username = username;
    session.isAdmin = isFirstUser;
    await session.save();

    return NextResponse.json({
      ok: true,
      isAdmin: isFirstUser,
      message: isFirstUser ? "Cuenta admin creada" : "Cuenta creada",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
