import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { seed } from "@/lib/seed";

interface TeamRow {
  id: number;
  name: string;
  iso_code: string;
  group_letter: string;
}

interface MatchRow {
  score_home: number;
  score_away: number;
  home_id: number;
  away_id: number;
}

export async function GET() {
  try {
    seed();
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const db = getDb();

    const teams = db
      .prepare("SELECT id, name, iso_code, group_letter FROM teams ORDER BY group_letter, name")
      .all() as TeamRow[];

    const results = db
      .prepare(
        `SELECT m.score_home, m.score_away,
          ht.id as home_id, at.id as away_id
         FROM matches m
         JOIN teams ht ON m.home_team_id = ht.id
         JOIN teams at ON m.away_team_id = at.id
         WHERE m.phase = 'group' AND m.result_entered = 1`
      )
      .all() as MatchRow[];

    type Standing = {
      id: number; name: string; iso: string; group: string;
      pj: number; g: number; e: number; p: number;
      gf: number; gc: number; pts: number;
    };

    const standings = new Map<number, Standing>();
    for (const t of teams) {
      standings.set(t.id, {
        id: t.id, name: t.name, iso: t.iso_code, group: t.group_letter,
        pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0,
      });
    }

    for (const r of results) {
      const home = standings.get(r.home_id)!;
      const away = standings.get(r.away_id)!;
      home.pj++; away.pj++;
      home.gf += r.score_home; home.gc += r.score_away;
      away.gf += r.score_away; away.gc += r.score_home;
      if (r.score_home > r.score_away) {
        home.g++; home.pts += 3; away.p++;
      } else if (r.score_home < r.score_away) {
        away.g++; away.pts += 3; home.p++;
      } else {
        home.e++; away.e++; home.pts++; away.pts++;
      }
    }

    const grouped: Record<string, Standing[]> = {};
    for (const s of standings.values()) {
      if (!grouped[s.group]) grouped[s.group] = [];
      grouped[s.group].push(s);
    }
    for (const g of Object.keys(grouped)) {
      grouped[g].sort((a, b) =>
        b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf
      );
    }

    return NextResponse.json({ standings: grouped });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
