"use client";

import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
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
  champion_flag?: string;
}

export default function TournamentPage() {
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [prediction, setPrediction] = useState<TournamentPrediction | null>(null);
  const [locked, setLocked] = useState(false);
  const [championId, setChampionId] = useState<string>("");
  const [topScorer, setTopScorer] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/me").then((r) => r.json()),
      fetch("/api/tournament-prediction").then((r) => r.json()),
    ]).then(([meData, tData]) => {
      setUser(meData.user);
      setTeams(tData.teams ?? []);
      setLocked(tData.locked);
      if (tData.prediction) {
        setPrediction(tData.prediction);
        setChampionId(tData.prediction.champion_team_id?.toString() ?? "");
        setTopScorer(tData.prediction.top_scorer_name ?? "");
      }
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/tournament-prediction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        championTeamId: championId ? parseInt(championId) : null,
        topScorerName: topScorer,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Cargando...</div>
      </div>
    );
  }

  const groupedTeams: Record<string, Team[]> = {};
  for (const t of teams) {
    if (!groupedTeams[t.group_letter]) groupedTeams[t.group_letter] = [];
    groupedTeams[t.group_letter].push(t);
  }

  return (
    <div className="min-h-screen">
      <NavBar username={user?.username ?? ""} isAdmin={user?.isAdmin ?? false} />

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Predicciones del Torneo
          </h1>
          <p className="text-gray-500 text-sm">
            Se cierran 24hs antes del inicio del Mundial (11 Jun 2026)
          </p>
        </div>

        {locked ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-amber-700 font-medium text-sm">
              🔒 Las predicciones del torneo están cerradas
            </p>
          </div>
        ) : null}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏆 Campeón del Mundial
              </label>
              <select
                value={championId}
                onChange={(e) => setChampionId(e.target.value)}
                disabled={locked}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">-- Seleccioná un equipo --</option>
                {Object.entries(groupedTeams)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([group, groupTeams]) => (
                    <optgroup key={group} label={`Grupo ${group}`}>
                      {groupTeams.map((t) => (
                        <option key={t.id} value={t.id.toString()}>
                          {t.flag} {t.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Bonus: +18 puntos si acertás</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⚽ Goleador del Torneo
              </label>
              <input
                type="text"
                value={topScorer}
                onChange={(e) => setTopScorer(e.target.value)}
                disabled={locked}
                placeholder="Nombre del jugador"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Bonus: +8 puntos si acertás</p>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {saved && (
              <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                ✓ Predicciones guardadas
              </p>
            )}

            {!locked && (
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando..." : prediction ? "Actualizar" : "Guardar"}
              </button>
            )}
          </form>
        </div>

        {prediction && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-700 mb-2">
              Tus predicciones actuales:
            </p>
            <p className="text-sm text-blue-600">
              Campeón:{" "}
              <strong>
                {prediction.champion_flag} {prediction.champion_name ?? "—"}
              </strong>
            </p>
            <p className="text-sm text-blue-600">
              Goleador: <strong>{prediction.top_scorer_name || "—"}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
