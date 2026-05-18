"use client";

import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Flag } from "@/components/Flag";
import { BracketView } from "@/components/BracketView";
import { formatTimeOnly, formatDayShort } from "@/lib/utils";

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface Match {
  id: number;
  phase: string;
  match_number: number;
  kickoff_at: string;
  home_name: string | null;
  home_iso: string | null;
  home_group: string | null;
  home_placeholder: string | null;
  away_name: string | null;
  away_iso: string | null;
  away_placeholder: string | null;
  venue: string;
  city: string;
  country: string;
  score_home: number | null;
  score_away: number | null;
  result_entered: number;
}

interface Standing {
  id: number; name: string; iso: string; group: string;
  pj: number; g: number; e: number; p: number;
  gf: number; gc: number; pts: number;
}

const PHASE_ORDER: Record<string, number> = {
  group: 0, round32: 1, round16: 2, quarterfinal: 3, semifinal: 4, final: 5,
};

const PHASE_LABELS: Record<string, string> = {
  group: "Fase de Grupos",
  round32: "16avos de Final",
  round16: "Octavos de Final",
  quarterfinal: "Cuartos de Final",
  semifinal: "Semifinal",
  final: "Final",
};

const PHASE_BADGE: Record<string, string> = {
  group: "bg-blue-100 text-blue-700",
  round32: "bg-purple-100 text-purple-700",
  round16: "bg-orange-100 text-orange-700",
  quarterfinal: "bg-red-100 text-red-700",
  semifinal: "bg-rose-100 text-rose-700",
  final: "bg-yellow-100 text-yellow-700",
};

function StandingsTable({ standings, group }: { standings: Standing[]; group: string }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Grupo {group}</span>
      </div>
      <div className="rounded-lg border border-gray-100 overflow-hidden bg-white shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-3 py-1.5 font-semibold text-gray-500 w-full">Equipo</th>
              <th className="px-2 py-1.5 font-semibold text-gray-500 text-center">PJ</th>
              <th className="px-2 py-1.5 font-semibold text-gray-500 text-center">G</th>
              <th className="px-2 py-1.5 font-semibold text-gray-500 text-center">E</th>
              <th className="px-2 py-1.5 font-semibold text-gray-500 text-center">P</th>
              <th className="px-2 py-1.5 font-semibold text-gray-500 text-center">GD</th>
              <th className="px-2 py-1.5 font-semibold text-gray-500 text-center font-bold text-gray-700">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {standings.map((s, idx) => (
              <tr key={s.id} className={idx < 2 ? "bg-green-50/40" : ""}>
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                    {idx < 2 && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />}
                    {idx === 2 && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />}
                    {idx === 3 && <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />}
                    {s.iso && <Flag code={s.iso} size="sm" />}
                    <span className="font-medium text-gray-800">{s.name}</span>
                  </div>
                </td>
                <td className="px-2 py-1.5 text-center text-gray-600">{s.pj}</td>
                <td className="px-2 py-1.5 text-center text-gray-600">{s.g}</td>
                <td className="px-2 py-1.5 text-center text-gray-600">{s.e}</td>
                <td className="px-2 py-1.5 text-center text-gray-600">{s.p}</td>
                <td className="px-2 py-1.5 text-center text-gray-600">
                  {s.gf - s.gc > 0 ? `+${s.gf - s.gc}` : s.gf - s.gc}
                </td>
                <td className="px-2 py-1.5 text-center font-bold text-gray-800">{s.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function FixturePage() {
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Record<string, Standing[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState("group");
  const [selectedGroup, setSelectedGroup] = useState("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/me").then((r) => r.json()),
      fetch("/api/matches").then((r) => r.json()),
      fetch("/api/standings").then((r) => r.json()),
    ]).then(([meData, matchData, standingsData]) => {
      setUser(meData.user);
      setMatches(matchData.matches ?? []);
      setStandings(standingsData.standings ?? {});
      setLoading(false);
    });
  }, []);

  const phases = [...new Set(matches.map((m) => m.phase))].sort(
    (a, b) => PHASE_ORDER[a] - PHASE_ORDER[b]
  );

  const isKnockout = selectedPhase !== "group";

  const filteredMatches = matches.filter((m) => {
    if (m.phase !== selectedPhase) return false;
    if (selectedGroup === "all") return true;
    return m.home_group === selectedGroup;
  });

  const groupLetters =
    selectedPhase === "group"
      ? [...new Set(
          matches
            .filter((m) => m.phase === "group")
            .map((m) => m.home_group)
            .filter(Boolean) as string[]
        )].sort()
      : [];

  const standingGroups = Object.keys(standings).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Cargando fixture...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar username={user?.username ?? ""} isAdmin={user?.isAdmin ?? false} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-800 mb-0.5">Fixture — Mundial 2026</h1>
          <p className="text-gray-400 text-sm">
            11 jun – 19 jul 2026 · Horarios en
            <span className="font-medium text-gray-600"> Argentina (ART)</span> y
            <span className="font-medium text-gray-600"> Europa (CEST)</span>
          </p>
        </div>

        {/* Phase tabs */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {phases.map((phase) => (
            <button
              key={phase}
              onClick={() => { setSelectedPhase(phase); setSelectedGroup("all"); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedPhase === phase
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {PHASE_LABELS[phase]}
            </button>
          ))}
        </div>

        {/* Group filter (only in group phase) */}
        {selectedPhase === "group" && groupLetters.length > 0 && (
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedGroup("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedGroup === "all"
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Todos
            </button>
            {groupLetters.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedGroup === g
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                Grupo {g}
              </button>
            ))}
          </div>
        )}

        {/* Group standings tables */}
        {selectedPhase === "group" && standingGroups.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Tabla de Posiciones</h2>
            {selectedGroup === "all" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {standingGroups.map((g) => (
                  <StandingsTable key={g} standings={standings[g]} group={g} />
                ))}
              </div>
            ) : (
              standings[selectedGroup] && (
                <StandingsTable standings={standings[selectedGroup]} group={selectedGroup} />
              )
            )}
          </div>
        )}

        {/* Bracket view for knockout phases */}
        {isKnockout && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Cuadro del Torneo</h2>
            <BracketView matches={matches.filter((m) => ["round32", "round16", "quarterfinal", "semifinal", "final"].includes(m.phase))} />
          </div>
        )}

        {/* Match list header */}
        <h2 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
          {PHASE_LABELS[selectedPhase]}
        </h2>

        {/* Match table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[2fr_auto_2fr_1fr] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="text-right">Local</div>
            <div className="text-center">-</div>
            <div>Visitante</div>
            <div className="text-right">Resultado</div>
          </div>

          {filteredMatches.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              No hay partidos en esta fase todavía
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredMatches.map((match, idx) => {
                const homeName = match.home_name ?? match.home_placeholder ?? "?";
                const awayName = match.away_name ?? match.away_placeholder ?? "?";
                const timeAR = formatTimeOnly(match.kickoff_at, "America/Argentina/Buenos_Aires");
                const timeEU = formatTimeOnly(match.kickoff_at, "Europe/Madrid");
                const day = formatDayShort(match.kickoff_at);

                return (
                  <div
                    key={match.id}
                    className={`px-4 py-2.5 hover:bg-gray-50/50 transition-colors ${
                      idx % 2 === 0 ? "" : "bg-gray-50/30"
                    }`}
                  >
                    <div className="grid grid-cols-[2fr_auto_2fr_1fr] gap-2 items-center">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-semibold text-gray-800 text-sm text-right">{homeName}</span>
                        {match.home_iso && <Flag code={match.home_iso} size="sm" />}
                      </div>
                      <div className="text-center text-gray-300 font-bold text-xs px-1">vs</div>
                      <div className="flex items-center gap-1.5">
                        {match.away_iso && <Flag code={match.away_iso} size="sm" />}
                        <span className="font-semibold text-gray-800 text-sm">{awayName}</span>
                      </div>
                      <div className="text-right">
                        {match.result_entered ? (
                          <span className="font-bold text-green-700 text-sm">
                            {match.score_home} – {match.score_away}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">pendiente</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                      <span className="font-medium text-gray-500">{day}</span>
                      <span className="flex items-center gap-1">
                        <Flag code="ar" size="sm" />
                        <span className="font-semibold text-gray-600">{timeAR}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Flag code="es" size="sm" />
                        <span className="font-semibold text-gray-600">{timeEU}</span>
                      </span>
                      {match.venue && (
                        <>
                          <span>·</span>
                          <span>🏟️ {match.venue}</span>
                          <span>·</span>
                          <span>{match.city}, {match.country}</span>
                        </>
                      )}
                      {match.home_group && (
                        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${PHASE_BADGE[match.phase]}`}>
                          Grupo {match.home_group}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-400 text-center">
          {filteredMatches.length} partidos · Horarios aproximados, sujetos a confirmación FIFA
        </p>
      </div>
    </div>
  );
}
