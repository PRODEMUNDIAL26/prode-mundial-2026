// Official 2026 FIFA World Cup Knockout Bracket Structure
// Group stage = matches 1-72, R32 = 73-88, R16 = 89-96, QF = 97-100, SF = 101-102, Final = 103

export interface BracketMatchDef {
  matchNumber: number;
  homeLabel: string;
  awayLabel: string;
}

// R32 matches in official order (73-88)
export const R32_DEFS: BracketMatchDef[] = [
  { matchNumber: 73, homeLabel: "1E",  awayLabel: "3er (A/B/C/D/F)" },
  { matchNumber: 74, homeLabel: "1I",  awayLabel: "3er (C/D/F/G/H)" },
  { matchNumber: 75, homeLabel: "1F",  awayLabel: "2C" },
  { matchNumber: 76, homeLabel: "1C",  awayLabel: "2F" },
  { matchNumber: 77, homeLabel: "1J",  awayLabel: "2H" },
  { matchNumber: 78, homeLabel: "2E",  awayLabel: "2I" },
  { matchNumber: 79, homeLabel: "1A",  awayLabel: "3er (C/E/F/H/I)" },
  { matchNumber: 80, homeLabel: "1L",  awayLabel: "3er (E/H/I/J/K)" },
  { matchNumber: 81, homeLabel: "1D",  awayLabel: "3er (B/E/F/I/J)" },
  { matchNumber: 82, homeLabel: "1G",  awayLabel: "3er (A/E/H/I/J)" },
  { matchNumber: 83, homeLabel: "2K",  awayLabel: "2L" },
  { matchNumber: 84, homeLabel: "1H",  awayLabel: "2J" },
  { matchNumber: 85, homeLabel: "1B",  awayLabel: "3er (E/F/G/I/J)" },
  { matchNumber: 86, homeLabel: "2D",  awayLabel: "2G" },
  { matchNumber: 87, homeLabel: "1K",  awayLabel: "3er (D/E/I/J/L)" },
  { matchNumber: 88, homeLabel: "2A",  awayLabel: "2B" },
];

// Bracket tree structure
// Each "section" = 2 R32 matches → 1 R16 match
// Each pair of sections → 1 QF match
// Structure: [r32MatchA_idx, r32MatchB_idx] → R16 match number
export const R16_STRUCTURE = [
  { r32: [0, 2], r16: 89  },  // W73 vs W75
  { r32: [1, 4], r16: 90  },  // W74 vs W77
  { r32: [3, 5], r16: 91  },  // W76 vs W78
  { r32: [6, 7], r16: 92  },  // W79 vs W80
  { r32: [10,11], r16: 93 },  // W83 vs W84
  { r32: [8, 9],  r16: 94 },  // W81 vs W82
  { r32: [13,15], r16: 95 },  // W86 vs W88
  { r32: [12,14], r16: 96 },  // W85 vs W87
];

// QF structure: [r16_section_idx_A, r16_section_idx_B] → QF match number
export const QF_STRUCTURE = [
  { r16: [0, 1], qf: 97  },  // W89 vs W90
  { r16: [4, 5], qf: 98  },  // W93 vs W94
  { r16: [2, 3], qf: 99  },  // W91 vs W92
  { r16: [6, 7], qf: 100 },  // W95 vs W96
];

// SF: [qf_idx_A, qf_idx_B] → SF match number
export const SF_STRUCTURE = [
  { qf: [0, 1], sf: 101 },  // W97 vs W98
  { qf: [2, 3], sf: 102 },  // W99 vs W100
];

// The four "arms" of the bracket for visual display (each arm = 4 R32 + 2 R16 + 1 QF)
// Arm 0 (top-left):    R32 idx [0,2] → R16 M89, R32 idx [1,4] → R16 M90, QF M97
// Arm 1 (bottom-left): R32 idx [10,11] → R16 M93, R32 idx [8,9] → R16 M94, QF M98
// Arm 2 (top-right):   R32 idx [3,5] → R16 M91, R32 idx [6,7] → R16 M92, QF M99
// Arm 3 (bottom-right):R32 idx [13,15] → R16 M95, R32 idx [12,14] → R16 M96, QF M100

export interface BracketArm {
  r32Pairs: [[number, number], [number, number]]; // 2 pairs of R32 idx
  r16Pair: [number, number]; // 2 R16 match numbers
  qf: number; // QF match number
  sf: number; // SF match number
}

export const BRACKET_ARMS: BracketArm[] = [
  {
    r32Pairs: [[0, 2], [1, 4]],
    r16Pair: [89, 90],
    qf: 97,
    sf: 101,
  },
  {
    r32Pairs: [[10, 11], [8, 9]],
    r16Pair: [93, 94],
    qf: 98,
    sf: 101,
  },
  {
    r32Pairs: [[3, 5], [6, 7]],
    r16Pair: [91, 92],
    qf: 99,
    sf: 102,
  },
  {
    r32Pairs: [[13, 15], [12, 14]],
    r16Pair: [95, 96],
    qf: 100,
    sf: 102,
  },
];

export const FINAL_MATCH = 103;
