"use client";

import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { MatchCard } from "@/components/MatchCard";
import { Flag } from "@/components/Flag";

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
  home_flag: string | null;
  home_iso: string | null;
  home_group: string | null;
  home_placeholder: string | null;
  away_name: string | null;
  away_flag: string | null;
  away_iso: string | null;
  away_group: string | null;
  away_placeholder: string | null;
  venue?: string;
  city?: string;
  country?: string;
  score_home: number | null;
  score_away: number | null;
  result_entered: number;
}

interface Team {
  id: number;
  name: string;
  flag: string;
  group_letter: string;
}

interface TournamentPrediction {
  champion_team_id: number | null;
  top_scorer_name: string;
  champion_name?: string;
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

export default function PronosticosPage() {
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<
    Record<number, { score_home: number; score_away: number }>
  >({});
  const [selectedPhase, setSelectedPhase] = useState<string>("group");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Tournament predictions state
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournamentPred, setTournamentPred] = useState<TournamentPrediction | null>(null);
  const [tournamentLocked, setTournamentLocked] = useState(false);
  const [championId, setChampionId] = useState("");
  const [topScorer, setTopScorer] = useState("");
  const [tSaving, setTSaving] = useState(false);
  const [tSaved, setTSaved] = useState(false);
  const [tError, setTError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/me").then((r) => r.json()),
      fetch("/api/matches").then((r) => r.json()),
      fetch("/api/tournament-prediction").then((r) => r.json()),
    ]).then(([meData, matchData, tData]) => {
      setUser(meData.user);
      setMatches(matchData.matches ?? []);
      setPredictions(matchData.predictions ?? {});
      setTeams(tData.teams ?? []);
      setTournamentLocked(tData.locked ?? false);
      if (tData.prediction) {
        setTournamentPred(tData.prediction);
        setChampionId(tData.prediction.champion_team_id?.toString() ?? "");
        setTopScorer(tData.prediction.top_scorer_name ?? "");
      }
      setLoading(false);
    });
  }, []);

  async function handleSaveMatch(matchId: number, scoreHome: number, scoreAway: number) {
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, scoreHome, scoreAway }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { score_home: scoreHome, score_away: scoreAway },
    }));
  }

  async function handleSaveTournament(e: React.FormEvent) {
    e.preventDefault();
    setTSaving(true);
    setTError("");
    const res = await fetch("/api/tournament-prediction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        championTeamId: championId ? parseInt(championId) : null,
        topScorerName: topScorer,
      }),
    });
    const data = await res.json();
    setTSaving(false);
    if (!res.ok) { setTError(data.error); return; }
    setTSaved(true);
    setTimeout(() => setTSaved(false), 2500);
  }

  const phases = [...new Set(matches.map((m) => m.phase))].sort(
    (a, b) => PHASE_ORDER[a] - PHASE_ORDER[b]
  );

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

  const groupedTeams: Record<string, Team[]> = {};
  for (const t of teams) {
    if (!groupedTeams[t.group_letter]) groupedTeams[t.group_letter] = [];
    groupedTeams[t.group_letter].push(t);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar username={user?.username ?? ""} isAdmin={user?.isAdmin ?? false} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Pronósticos</h1>
          <p className="text-gray-500 text-sm">
            Hacé tus predicciones antes de 24hs del partido
          </p>
        </div>

        {/* Phase tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {phases.map((phase) => (
            <button
              key={phase}
              onClick={() => { setSelectedPhase(phase); setSelectedGroup("all"); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedPhase === phase
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {PHASE_LABELS[phase] ?? phase}
            </button>
          ))}
        </div>

        {/* Group filter */}
        {selectedPhase === "group" && groupLetters.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedGroup("all")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
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
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
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

        {/* Match list */}
        <div className="space-y-3">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No hay partidos en esta fase todavía
            </div>
          ) : (
            filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predictions[match.id]}
                onSave={handleSaveMatch}
              />
            ))
          )}
        </div>

        {/* Tournament predictions section */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Predicciones del Torneo</h2>
          <p className="text-gray-500 text-sm mb-4">
            Se cierran 24hs antes del inicio del Mundial (11 Jun 2026)
          </p>

          {tournamentLocked && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-amber-700 font-medium text-sm">
                🔒 Las predicciones del torneo están cerradas
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-lg">
            <form onSubmit={handleSaveTournament} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  🏆 Campeón del Mundial
                </label>
                <select
                  value={championId}
                  onChange={(e) => setChampionId(e.target.value)}
                  disabled={tournamentLocked}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">-- Seleccioná un equipo --</option>
                  {Object.entries(groupedTeams)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([group, groupTeams]) => (
                      <optgroup key={group} label={`Grupo ${group}`}>
                        {groupTeams.map((t) => (
                          <option key={t.id} value={t.id.toString()}>
                            {t.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Bonus: +18 puntos si acertás</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  ⚽ Goleador del Torneo
                </label>
                <input
                  type="text"
                  value={topScorer}
                  onChange={(e) => setTopScorer(e.target.value)}
                  disabled={tournamentLocked}
                  placeholder="Nombre del jugador"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">Bonus: +8 puntos si acertás</p>
              </div>

              {tError && (
                <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{tError}</p>
              )}
              {tSaved && (
                <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">✓ Guardado</p>
              )}

              {!tournamentLocked && (
                <button
                  type="submit"
                  disabled={tSaving}
                  className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {tSaving ? "Guardando..." : tournamentPred ? "Actualizar" : "Guardar"}
                </button>
              )}
            </form>

            {tournamentPred && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-1">Tus pronósticos actuales:</p>
                <p className="text-sm text-gray-600">
                  Campeón: <strong>{tournamentPred.champion_name ?? "—"}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Goleador: <strong>{tournamentPred.top_scorer_name || "—"}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
