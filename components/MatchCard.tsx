"use client";

import { useState } from "react";
import { cn, isDeadlinePassed, formatTimeOnly, formatDayShort } from "@/lib/utils";
import { Flag } from "@/components/Flag";

interface Match {
  id: number;
  phase: string;
  kickoff_at: string;
  home_name: string | null;
  home_iso: string | null;
  home_placeholder: string | null;
  away_name: string | null;
  away_iso: string | null;
  away_placeholder: string | null;
  venue?: string;
  city?: string;
  country?: string;
  score_home: number | null;
  score_away: number | null;
  result_entered: number;
}

interface Prediction {
  score_home: number;
  score_away: number;
}

interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  onSave: (matchId: number, scoreHome: number, scoreAway: number) => Promise<void>;
}

export function MatchCard({ match, prediction, onSave }: MatchCardProps) {
  const [home, setHome] = useState(prediction?.score_home?.toString() ?? "");
  const [away, setAway] = useState(prediction?.score_away?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const locked = isDeadlinePassed(match.kickoff_at);
  const homeName = match.home_name ?? match.home_placeholder ?? "?";
  const awayName = match.away_name ?? match.away_placeholder ?? "?";

  const timeAR = formatTimeOnly(match.kickoff_at, "America/Argentina/Buenos_Aires");
  const timeEU = formatTimeOnly(match.kickoff_at, "Europe/Madrid");
  const day = formatDayShort(match.kickoff_at);

  async function handleSave() {
    const h = parseInt(home);
    const a = parseInt(away);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setError("Marcador inválido");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(match.id, h, a);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={cn(
      "rounded-lg border bg-white px-3 py-2 shadow-sm text-sm transition-all",
      match.result_entered && "border-green-200 bg-green-50/50",
      locked && !match.result_entered && "opacity-75"
    )}>
      {/* Top: date + venue */}
      <div className="flex items-center justify-between mb-1.5 text-xs text-gray-400">
        <span className="font-medium text-gray-500">{day}</span>
        {match.venue && (
          <span className="text-right truncate max-w-[58%]">
            🏟️ {match.venue} · {match.city}, {match.country}
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-2">
        {/* Home */}
        <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
          <span className="truncate font-semibold text-gray-800 text-sm">{homeName}</span>
          {match.home_iso && <Flag code={match.home_iso} size="sm" />}
        </div>

        {/* Score */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {match.result_entered ? (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 rounded font-bold text-green-800">
              <span>{match.score_home}</span>
              <span className="text-green-400 text-xs">-</span>
              <span>{match.score_away}</span>
            </div>
          ) : locked ? (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-gray-500 text-xs">
              {prediction
                ? <><span>{prediction.score_home}</span><span>-</span><span>{prediction.score_away}</span></>
                : <span>🔒</span>
              }
            </div>
          ) : (
            <>
              <input
                type="number" min="0" max="99" value={home}
                onChange={(e) => setHome(e.target.value)}
                className="w-9 text-center border-2 border-gray-200 rounded py-0.5 font-bold focus:border-green-500 focus:outline-none text-sm"
              />
              <span className="text-gray-300 font-bold text-xs">-</span>
              <input
                type="number" min="0" max="99" value={away}
                onChange={(e) => setAway(e.target.value)}
                className="w-9 text-center border-2 border-gray-200 rounded py-0.5 font-bold focus:border-green-500 focus:outline-none text-sm"
              />
            </>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          {match.away_iso && <Flag code={match.away_iso} size="sm" />}
          <span className="truncate font-semibold text-gray-800 text-sm">{awayName}</span>
        </div>
      </div>

      {/* Bottom: times + save */}
      <div className="flex items-center justify-between mt-1.5 gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Flag code="ar" size="sm" />
          <span className="font-medium text-gray-600">{timeAR}</span>
          <span>·</span>
          <Flag code="es" size="sm" />
          <span className="font-medium text-gray-600">{timeEU}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {match.result_entered && prediction && (
            <span className="text-xs text-gray-400">
              Tu prode: <span className="font-semibold">{prediction.score_home}-{prediction.score_away}</span>
            </span>
          )}
          {error && <span className="text-xs text-red-500">{error}</span>}
          {saved && <span className="text-xs text-green-600 font-medium">✓</span>}
          {!locked && !match.result_entered && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-0.5 bg-green-700 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
            >
              {saving ? "..." : "Guardar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
