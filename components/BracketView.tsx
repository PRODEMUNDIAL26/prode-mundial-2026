"use client";

import { BRACKET_ARMS, R32_DEFS } from "@/lib/bracket";
import { Flag } from "@/components/Flag";

interface KnockoutMatch {
  match_number: number;
  home_name: string | null;
  home_iso: string | null;
  home_placeholder: string | null;
  away_name: string | null;
  away_iso: string | null;
  away_placeholder: string | null;
  score_home: number | null;
  score_away: number | null;
  result_entered: number;
}

interface BracketViewProps {
  matches: KnockoutMatch[];
}

function TeamLine({
  name, iso, score, hasResult,
}: {
  name: string; iso: string | null; score: number | null; hasResult: boolean;
}) {
  return (
    <div className="flex items-center gap-1 px-1.5 py-[3px]">
      {iso
        ? <Flag code={iso} size="sm" />
        : <span className="inline-block w-4 h-3 shrink-0" />}
      <span className="flex-1 truncate text-[11px] text-gray-700 leading-tight min-w-0">{name}</span>
      {hasResult && score !== null && (
        <span className="text-[11px] font-bold text-green-700 shrink-0 w-4 text-right">{score}</span>
      )}
    </div>
  );
}

function MatchCard({ matchNum, match }: { matchNum: number; match?: KnockoutMatch }) {
  const home = match?.home_name ?? match?.home_placeholder ?? "—";
  const away = match?.away_name ?? match?.away_placeholder ?? "—";
  const homeIso = match?.home_iso ?? null;
  const awayIso = match?.away_iso ?? null;
  const hasResult = !!match?.result_entered;

  return (
    <div className={`w-full rounded border text-xs overflow-hidden shadow-sm ${hasResult ? "border-green-300 bg-green-50/60" : "border-gray-200 bg-white"}`}>
      <div className="px-1.5 py-[2px] bg-gray-50 border-b border-gray-100 text-[9px] font-semibold text-gray-400 tracking-wide">
        P.{matchNum}
      </div>
      <TeamLine name={home} iso={homeIso} score={match?.score_home ?? null} hasResult={hasResult} />
      <div className="border-t border-gray-100" />
      <TeamLine name={away} iso={awayIso} score={match?.score_away ?? null} hasResult={hasResult} />
    </div>
  );
}

// Grid layout constants
// 16 rows × ROW_PX height = full bracket height
// Arms 0+1 (SF101) occupy rows 1–8; Arms 2+3 (SF102) occupy rows 9–16
// Within each half: each arm occupies 4 rows
// R32 pair within an arm: 2 rows each
const ROW_PX = 56;
const COL_W = 148;
const COL_GAP = 6;
const COLS = 5;
const TOTAL_ROWS = 16;

// [matchNumber, colIndex(1-based), rowStart(1-based), rowSpan]
type GridItem = [number, number, number, number];

const GRID_ITEMS: GridItem[] = [
  // ── Column 1: R32 ──
  // Arm 0 (rows 1–4)
  [73, 1, 1, 1], [75, 1, 2, 1],  // R32 pair [0,2]
  [74, 1, 3, 1], [77, 1, 4, 1],  // R32 pair [1,4]
  // Arm 1 (rows 5–8)
  [83, 1, 5, 1], [84, 1, 6, 1],  // R32 pair [10,11]
  [81, 1, 7, 1], [82, 1, 8, 1],  // R32 pair [8,9]
  // Arm 2 (rows 9–12)
  [76, 1, 9, 1],  [78, 1, 10, 1], // R32 pair [3,5]
  [79, 1, 11, 1], [80, 1, 12, 1], // R32 pair [6,7]
  // Arm 3 (rows 13–16)
  [86, 1, 13, 1], [88, 1, 14, 1], // R32 pair [13,15]
  [85, 1, 15, 1], [87, 1, 16, 1], // R32 pair [12,14]

  // ── Column 2: R16 ──
  [89, 2, 1, 2], [90, 2, 3, 2],   // Arm 0
  [93, 2, 5, 2], [94, 2, 7, 2],   // Arm 1
  [91, 2, 9, 2], [92, 2, 11, 2],  // Arm 2
  [95, 2, 13, 2], [96, 2, 15, 2], // Arm 3

  // ── Column 3: QF ──
  [97, 3, 1, 4],  // Arm 0
  [98, 3, 5, 4],  // Arm 1
  [99, 3, 9, 4],  // Arm 2
  [100, 3, 13, 4], // Arm 3

  // ── Column 4: SF ──
  [101, 4, 1, 8],
  [102, 4, 9, 8],

  // ── Column 5: Final ──
  [103, 5, 1, 16],
];

const COL_LABELS = ["16avos de Final", "Octavos de Final", "Cuartos de Final", "Semifinal", "Final"];

export function BracketView({ matches }: BracketViewProps) {
  const matchMap = new Map<number, KnockoutMatch>();
  for (const m of matches) {
    matchMap.set(m.match_number, m);
  }

  const totalW = COLS * COL_W + (COLS - 1) * COL_GAP;
  const totalH = TOTAL_ROWS * ROW_PX;

  return (
    <div className="overflow-x-auto pb-2">
      {/* Column headers */}
      <div
        className="flex mb-2"
        style={{ width: totalW, gap: COL_GAP }}
      >
        {COL_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wide shrink-0"
            style={{ width: COL_W }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Bracket grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, ${COL_W}px)`,
          gridTemplateRows: `repeat(${TOTAL_ROWS}, ${ROW_PX}px)`,
          columnGap: COL_GAP,
          width: totalW,
          height: totalH,
        }}
      >
        {GRID_ITEMS.map(([matchNum, col, row, span]) => (
          <div
            key={matchNum}
            style={{
              gridColumn: col,
              gridRow: `${row} / span ${span}`,
              display: "flex",
              alignItems: "center",
              padding: "2px 0",
            }}
          >
            <MatchCard matchNum={matchNum} match={matchMap.get(matchNum)} />
          </div>
        ))}
      </div>
    </div>
  );
}
