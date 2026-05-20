import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { secret, username } = await req.json();
  if (!secret || secret !== process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const db = getDb();
  const result = db.prepare("UPDATE users SET is_admin=1 WHERE username=?").run(username);
  return NextResponse.json({ ok: true, changes: result.changes });
}
