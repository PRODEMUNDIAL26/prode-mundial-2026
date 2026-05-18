"use client";

import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface LeaderboardEntry {
  userId: number;
  username: string;
  matchPoints: number;
  bonus: number;
  total: number;
  predictedMatches: number;
  finishedMatches: number;
}

export default function LeaderboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/me").then((r) => r.json()),
      fetch("/api/leaderboard").then((r) => r.json()),
    ]).then(([meData, lbData]) => {
      setUser(meData.user);
      setLeaderboard(lbData.leaderboard ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Cargando tabla...</div>
      </div>
    );
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen">
      <NavBar username={user?.username ?? ""} isAdmin={user?.isAdmin ?? false} />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Tabla de Posiciones
          </h1>
          <p className="text-gray-500 text-sm">
            Actualizada automáticamente al ingresar resultados
          </p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Todavía no hay puntos cargados
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 rounded-xl border bg-white shadow-sm ${
                  entry.userId === user?.id
                    ? "border-green-300 bg-green-50"
                    : "border-gray-100"
                }`}
              >
                <div className="w-8 text-center font-bold text-lg">
                  {medals[idx] ?? `${idx + 1}`}
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-gray-800">
                    {entry.username}
                    {entry.userId === user?.id && (
                      <span className="ml-2 text-xs text-green-600 font-medium">
                        (vos)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {entry.predictedMatches}/{entry.finishedMatches} partidos predichos
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {entry.total}
                  </div>
                  <div className="text-xs text-gray-400">
                    {entry.matchPoints} pts
                    {entry.bonus > 0 && (
                      <span className="text-green-600"> +{entry.bonus} bonus</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scoring legend */}
        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm">
            Sistema de puntos
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>✅ Marcador exacto: <strong>3 pts</strong></div>
            <div>✓ Resultado correcto: <strong>1 pt</strong></div>
            <div>Grupos: <strong>×1</strong></div>
            <div>Ronda 32: <strong>×1.5</strong></div>
            <div>Octavos: <strong>×2</strong></div>
            <div>Cuartos: <strong>×2</strong></div>
            <div>Semifinal: <strong>×3</strong></div>
            <div>Final: <strong>×4</strong></div>
            <div>Goleador: <strong>+8 pts</strong></div>
            <div>Campeón: <strong>+18 pts</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
