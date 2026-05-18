"use client";

import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { formatDate } from "@/lib/utils";

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
  home_placeholder: string | null;
  away_name: string | null;
  away_flag: string | null;
  away_placeholder: string | null;
  score_home: number | null;
  score_away: number | null;
  result_entered: number;
}

interface UserRow {
  id: number;
  username: string;
  is_admin: number;
  created_at: string;
}

interface Team {
  id: number;
  name: string;
  flag: string;
}

const PHASE_LABELS: Record<string, string> = {
  group: "Grupos",
  round32: "Ronda 32",
  round16: "Octavos",
  quarterfinal: "Cuartos",
  semifinal: "Semifinal",
  final: "Final",
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTab, setActiveTab] = useState<"results" | "users" | "tournament">("results");

  // result entry
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [resultHome, setResultHome] = useState("");
  const [resultAway, setResultAway] = useState("");

  // tournament result
  const [champId, setChampId] = useState("");
  const [topScorer, setTopScorer] = useState("");
  const [tournSaved, setTournSaved] = useState(false);

  // new user
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [newUserMsg, setNewUserMsg] = useState("");

  // phase filter
  const [filterPhase, setFilterPhase] = useState("all");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
    loadMatches();
    loadUsers();
    fetch("/api/tournament-prediction")
      .then((r) => r.json())
      .then((d) => setTeams(d.teams ?? []));
  }, []);

  function loadMatches() {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches ?? []));
  }

  function loadUsers() {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []));
  }

  async function saveResult(matchId: number) {
    const h = parseInt(resultHome);
    const a = parseInt(resultAway);
    if (isNaN(h) || isNaN(a)) return;

    await fetch("/api/admin/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, scoreHome: h, scoreAway: a }),
    });
    setEditingMatch(null);
    loadMatches();
  }

  async function saveTournamentResult(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/tournament-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        championTeamId: champId ? parseInt(champId) : null,
        topScorerName: topScorer,
      }),
    });
    setTournSaved(true);
    setTimeout(() => setTournSaved(false), 2000);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: newUsername,
        password: newPassword,
        isAdmin: newIsAdmin,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setNewUserMsg("Error: " + data.error);
    } else {
      setNewUserMsg("✓ Usuario creado");
      setNewUsername("");
      setNewPassword("");
      setNewIsAdmin(false);
      loadUsers();
    }
    setTimeout(() => setNewUserMsg(""), 3000);
  }

  async function deleteUser(userId: number) {
    if (!confirm("¿Eliminar este usuario y todos sus pronósticos?")) return;
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    loadUsers();
  }

  const filteredMatches =
    filterPhase === "all"
      ? matches
      : matches.filter((m) => m.phase === filterPhase);

  const phases = [...new Set(matches.map((m) => m.phase))];

  return (
    <div className="min-h-screen">
      <NavBar username={user?.username ?? ""} isAdmin={true} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Panel de Administración
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {(["results", "tournament", "users"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "results" && "Resultados"}
              {tab === "tournament" && "Torneo"}
              {tab === "users" && "Usuarios"}
            </button>
          ))}
        </div>

        {/* Results tab */}
        {activeTab === "results" && (
          <div>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              <button
                onClick={() => setFilterPhase("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filterPhase === "all"
                    ? "bg-green-700 text-white"
                    : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                Todos
              </button>
              {phases.map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPhase(p)}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    filterPhase === p
                      ? "bg-green-700 text-white"
                      : "bg-white border border-gray-200 text-gray-600"
                  }`}
                >
                  {PHASE_LABELS[p] ?? p}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredMatches.map((match) => {
                const homeName = match.home_name ?? match.home_placeholder ?? "?";
                const awayName = match.away_name ?? match.away_placeholder ?? "?";
                const homeFlag = match.home_flag ?? "";
                const awayFlag = match.away_flag ?? "";

                return (
                  <div
                    key={match.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border bg-white ${
                      match.result_entered
                        ? "border-green-200"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex-1 text-sm">
                      <div className="font-medium">
                        {homeFlag} {homeName} vs {awayFlag} {awayName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {PHASE_LABELS[match.phase]} · {formatDate(match.kickoff_at)}
                      </div>
                    </div>

                    {match.result_entered ? (
                      <div className="flex items-center gap-2">
                        <span className="text-green-700 font-bold">
                          {match.score_home} - {match.score_away}
                        </span>
                        <button
                          onClick={() => {
                            setEditingMatch(match.id);
                            setResultHome(match.score_home?.toString() ?? "");
                            setResultAway(match.score_away?.toString() ?? "");
                          }}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          editar
                        </button>
                      </div>
                    ) : editingMatch === match.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={resultHome}
                          onChange={(e) => setResultHome(e.target.value)}
                          className="w-10 text-center border rounded-lg py-1 text-sm"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          min="0"
                          value={resultAway}
                          onChange={(e) => setResultAway(e.target.value)}
                          className="w-10 text-center border rounded-lg py-1 text-sm"
                        />
                        <button
                          onClick={() => saveResult(match.id)}
                          className="px-3 py-1 bg-green-700 text-white text-xs rounded-lg hover:bg-green-600"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setEditingMatch(null)}
                          className="text-xs text-gray-400"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingMatch(match.id);
                          setResultHome("");
                          setResultAway("");
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        Cargar resultado
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tournament tab */}
        {activeTab === "tournament" && (
          <div className="max-w-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Resultado Final del Torneo
            </h2>
            <form onSubmit={saveTournamentResult} className="space-y-4 bg-white rounded-xl border p-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campeón
                </label>
                <select
                  value={champId}
                  onChange={(e) => setChampId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">-- Seleccioná --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id.toString()}>
                      {t.flag} {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goleador
                </label>
                <input
                  type="text"
                  value={topScorer}
                  onChange={(e) => setTopScorer(e.target.value)}
                  placeholder="Nombre del jugador"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {tournSaved && (
                <p className="text-green-600 text-sm">✓ Guardado</p>
              )}
              <button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                Guardar resultado del torneo
              </button>
            </form>
          </div>
        )}

        {/* Users tab */}
        {activeTab === "users" && (
          <div>
            <div className="bg-white rounded-xl border p-5 mb-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4">
                Crear usuario
              </h2>
              <form onSubmit={createUser} className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Usuario"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    minLength={3}
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={newIsAdmin}
                    onChange={(e) => setNewIsAdmin(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isAdmin" className="text-sm text-gray-600">
                    Es administrador
                  </label>
                </div>
                {newUserMsg && (
                  <p
                    className={`text-sm ${
                      newUserMsg.startsWith("Error")
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {newUserMsg}
                  </p>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Crear usuario
                </button>
              </form>
            </div>

            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
                >
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">
                      {u.username}
                    </span>
                    {u.is_admin === 1 && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        admin
                      </span>
                    )}
                  </div>
                  {u.id !== user?.id && (
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
