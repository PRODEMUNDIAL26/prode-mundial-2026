import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { seed } from "@/lib/seed";

export async function POST(req: NextRequest) {
  try {
    seed();
    const { username, password } = await req.json();
    const db = getDb();

    const user = db
      .prepare("SELECT id, password_hash, is_admin FROM users WHERE username = ?")
      .get(username) as
      | { id: number; password_hash: string; is_admin: number }
      | undefined;

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const session = await getSession();
    session.userId = user.id;
    session.username = username;
    session.isAdmin = user.is_admin === 1;
    await session.save();

    return NextResponse.json({ ok: true, isAdmin: user.is_admin === 1 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
