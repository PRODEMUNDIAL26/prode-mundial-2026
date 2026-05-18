import { getDb } from "./db";
import { R32_DEFS, R16_STRUCTURE, QF_STRUCTURE, SF_STRUCTURE } from "./bracket";

// Confirmed groups per official draw + playoff results
const GROUPS: Record<string, string[]> = {
  A: ["México", "Corea del Sur", "Sudáfrica", "República Checa"],
  B: ["Canadá", "Suiza", "Qatar", "Bosnia Herzegovina"],
  C: ["Brasil", "Marruecos", "Escocia", "Haití"],
  D: ["Estados Unidos", "Australia", "Paraguay", "Turquía"],
  E: ["Alemania", "Ecuador", "Costa de Marfil", "Curazao"],
  F: ["Países Bajos", "Japón", "Túnez", "Suecia"],
  G: ["Bélgica", "Irán", "Egipto", "Nueva Zelanda"],
  H: ["Cabo Verde", "Arabia Saudita", "España", "Uruguay"],
  I: ["Francia", "Senegal", "Noruega", "Irak"],
  J: ["Argelia", "Argentina", "Austria", "Jordania"],
  K: ["Portugal", "Colombia", "Uzbekistán", "RD Congo"],
  L: ["Inglaterra", "Croacia", "Panamá", "Ghana"],
};

// ISO 3166-1 alpha-2 codes for flag-icons CSS library
// Special subdivisions: gb-sct (Scotland), gb-eng (England), cw (Curaçao)
const ISO: Record<string, string> = {
  México: "mx",
  "Corea del Sur": "kr",
  Sudáfrica: "za",
  "República Checa": "cz",
  Canadá: "ca",
  Suiza: "ch",
  Qatar: "qa",
  "Bosnia Herzegovina": "ba",
  Brasil: "br",
  Marruecos: "ma",
  Escocia: "gb-sct",
  Haití: "ht",
  "Estados Unidos": "us",
  Australia: "au",
  Paraguay: "py",
  Turquía: "tr",
  Alemania: "de",
  Ecuador: "ec",
  "Costa de Marfil": "ci",
  Curazao: "cw",
  "Países Bajos": "nl",
  Japón: "jp",
  Túnez: "tn",
  Suecia: "se",
  Bélgica: "be",
  Irán: "ir",
  Egipto: "eg",
  "Nueva Zelanda": "nz",
  "Cabo Verde": "cv",
  "Arabia Saudita": "sa",
  España: "es",
  Uruguay: "uy",
  Francia: "fr",
  Senegal: "sn",
  Noruega: "no",
  Irak: "iq",
  Argelia: "dz",
  Argentina: "ar",
  Austria: "at",
  Jordania: "jo",
  Portugal: "pt",
  Colombia: "co",
  Uzbekistán: "uz",
  "RD Congo": "cd",
  Inglaterra: "gb-eng",
  Croacia: "hr",
  Panamá: "pa",
  Ghana: "gh",
};

interface VenueInfo { venue: string; city: string; country: string }

const GROUP_VENUES: Record<string, VenueInfo[]> = {
  A: [
    { venue: "Estadio Azteca", city: "Ciudad de México", country: "México" },
    { venue: "Estadio Akron", city: "Guadalajara", country: "México" },
    { venue: "Estadio BBVA", city: "Monterrey", country: "México" },
    { venue: "Mercedes-Benz Stadium", city: "Atlanta", country: "EE.UU." },
  ],
  B: [
    { venue: "BMO Field", city: "Toronto", country: "Canadá" },
    { venue: "Levi's Stadium", city: "Santa Clara", country: "EE.UU." },
    { venue: "SoFi Stadium", city: "Inglewood", country: "EE.UU." },
    { venue: "BC Place", city: "Vancouver", country: "Canadá" },
  ],
  C: [
    { venue: "MetLife Stadium", city: "East Rutherford", country: "EE.UU." },
    { venue: "Gillette Stadium", city: "Foxborough", country: "EE.UU." },
    { venue: "Lincoln Financial Field", city: "Filadelfia", country: "EE.UU." },
    { venue: "Hard Rock Stadium", city: "Miami", country: "EE.UU." },
  ],
  D: [
    { venue: "SoFi Stadium", city: "Inglewood", country: "EE.UU." },
    { venue: "BC Place", city: "Vancouver", country: "Canadá" },
    { venue: "Levi's Stadium", city: "Santa Clara", country: "EE.UU." },
    { venue: "Lumen Field", city: "Seattle", country: "EE.UU." },
  ],
  E: [
    { venue: "NRG Stadium", city: "Houston", country: "EE.UU." },
    { venue: "MetLife Stadium", city: "East Rutherford", country: "EE.UU." },
    { venue: "GEHA Field at Arrowhead", city: "Kansas City", country: "EE.UU." },
    { venue: "BMO Field", city: "Toronto", country: "Canadá" },
  ],
  F: [
    { venue: "Estadio BBVA", city: "Monterrey", country: "México" },
    { venue: "NRG Stadium", city: "Houston", country: "EE.UU." },
    { venue: "GEHA Field at Arrowhead", city: "Kansas City", country: "EE.UU." },
    { venue: "AT&T Stadium", city: "Arlington", country: "EE.UU." },
  ],
  G: [
    { venue: "SoFi Stadium", city: "Inglewood", country: "EE.UU." },
    { venue: "Lumen Field", city: "Seattle", country: "EE.UU." },
    { venue: "BC Place", city: "Vancouver", country: "Canadá" },
    { venue: "SoFi Stadium", city: "Inglewood", country: "EE.UU." },
  ],
  H: [
    { venue: "Estadio Akron", city: "Guadalajara", country: "México" },
    { venue: "Mercedes-Benz Stadium", city: "Atlanta", country: "EE.UU." },
    { venue: "Hard Rock Stadium", city: "Miami", country: "EE.UU." },
    { venue: "Estadio Akron", city: "Guadalajara", country: "México" },
  ],
  I: [
    { venue: "Gillette Stadium", city: "Foxborough", country: "EE.UU." },
    { venue: "MetLife Stadium", city: "East Rutherford", country: "EE.UU." },
    { venue: "Lincoln Financial Field", city: "Filadelfia", country: "EE.UU." },
    { venue: "BMO Field", city: "Toronto", country: "Canadá" },
  ],
  J: [
    { venue: "GEHA Field at Arrowhead", city: "Kansas City", country: "EE.UU." },
    { venue: "AT&T Stadium", city: "Arlington", country: "EE.UU." },
    { venue: "Levi's Stadium", city: "Santa Clara", country: "EE.UU." },
    { venue: "GEHA Field at Arrowhead", city: "Kansas City", country: "EE.UU." },
  ],
  K: [
    { venue: "Estadio Azteca", city: "Ciudad de México", country: "México" },
    { venue: "Estadio Akron", city: "Guadalajara", country: "México" },
    { venue: "Hard Rock Stadium", city: "Miami", country: "EE.UU." },
    { venue: "NRG Stadium", city: "Houston", country: "EE.UU." },
  ],
  L: [
    { venue: "AT&T Stadium", city: "Arlington", country: "EE.UU." },
    { venue: "Gillette Stadium", city: "Foxborough", country: "EE.UU." },
    { venue: "Lincoln Financial Field", city: "Filadelfia", country: "EE.UU." },
    { venue: "BMO Field", city: "Toronto", country: "Canadá" },
  ],
};

const KNOCKOUT_VENUES: VenueInfo[] = [
  { venue: "MetLife Stadium", city: "East Rutherford", country: "EE.UU." },
  { venue: "AT&T Stadium", city: "Arlington", country: "EE.UU." },
  { venue: "SoFi Stadium", city: "Inglewood", country: "EE.UU." },
  { venue: "Mercedes-Benz Stadium", city: "Atlanta", country: "EE.UU." },
  { venue: "NRG Stadium", city: "Houston", country: "EE.UU." },
  { venue: "Levi's Stadium", city: "Santa Clara", country: "EE.UU." },
  { venue: "Hard Rock Stadium", city: "Miami", country: "EE.UU." },
  { venue: "Gillette Stadium", city: "Foxborough", country: "EE.UU." },
];

export function seed() {
  const db = getDb();

  const alreadySeeded = db
    .prepare("SELECT COUNT(*) as c FROM teams")
    .get() as { c: number };
  if (alreadySeeded.c > 0) return;

  const insertTeam = db.prepare(
    "INSERT INTO teams (name, flag, iso_code, group_letter) VALUES (?, ?, ?, ?)"
  );
  const teamIds: Record<string, number> = {};

  for (const [group, teamNames] of Object.entries(GROUPS)) {
    for (const name of teamNames) {
      const iso = ISO[name] ?? "";
      const result = insertTeam.run(name, "", iso, group);
      teamIds[name] = result.lastInsertRowid as number;
    }
  }

  const insertMatch = db.prepare(`
    INSERT INTO matches (phase, match_number, home_team_id, away_team_id, home_placeholder, away_placeholder, kickoff_at, venue, city, country)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const groupLetters = Object.keys(GROUPS);
  let matchNum = 1;
  const startDate = new Date("2026-06-11T15:00:00Z");

  for (let gIdx = 0; gIdx < groupLetters.length; gIdx++) {
    const group = groupLetters[gIdx];
    const teamNames = GROUPS[group];
    const venues = GROUP_VENUES[group];

    const dayOffset = Math.floor(gIdx / 4);
    const timeSlotOffset = (gIdx % 4) * 4;

    const baseDate = new Date(startDate);
    baseDate.setDate(baseDate.getDate() + dayOffset);
    baseDate.setHours(baseDate.getHours() + timeSlotOffset);

    const teamPairs: [number, number][] = [
      [0, 1], [2, 3],
      [0, 2], [1, 3],
      [0, 3], [1, 2],
    ];
    const mdDayOffsets = [0, 0, 6, 6, 12, 12];

    for (let pIdx = 0; pIdx < teamPairs.length; pIdx++) {
      const [hi, ai] = teamPairs[pIdx];
      const ko = new Date(baseDate);
      ko.setDate(ko.getDate() + mdDayOffsets[pIdx]);
      if (pIdx % 2 === 1) ko.setHours(ko.getHours() + 4);
      const v = venues[pIdx % venues.length];
      insertMatch.run(
        "group", matchNum++,
        teamIds[teamNames[hi]], teamIds[teamNames[ai]],
        null, null,
        ko.toISOString(),
        v.venue, v.city, v.country
      );
    }
  }

  // R32 matches (73–88) using official bracket labels
  {
    const base = new Date("2026-06-28T18:00:00Z");
    for (let i = 0; i < R32_DEFS.length; i++) {
      const def = R32_DEFS[i];
      const ko = new Date(base);
      ko.setDate(ko.getDate() + Math.floor(i / 2));
      if (i % 2 === 1) ko.setHours(ko.getHours() + 4);
      const v = KNOCKOUT_VENUES[i % KNOCKOUT_VENUES.length];
      insertMatch.run("round32", def.matchNumber, null, null, def.homeLabel, def.awayLabel, ko.toISOString(), v.venue, v.city, v.country);
    }
  }

  // R16 matches (89–96)
  {
    const base = new Date("2026-07-04T18:00:00Z");
    for (let i = 0; i < R16_STRUCTURE.length; i++) {
      const { r32, r16 } = R16_STRUCTURE[i];
      const homeMatchNum = R32_DEFS[r32[0]].matchNumber;
      const awayMatchNum = R32_DEFS[r32[1]].matchNumber;
      const ko = new Date(base);
      ko.setDate(ko.getDate() + Math.floor(i / 2));
      if (i % 2 === 1) ko.setHours(ko.getHours() + 4);
      const v = KNOCKOUT_VENUES[i % KNOCKOUT_VENUES.length];
      insertMatch.run("round16", r16, null, null, `Gan. P.${homeMatchNum}`, `Gan. P.${awayMatchNum}`, ko.toISOString(), v.venue, v.city, v.country);
    }
  }

  // QF matches (97–100)
  {
    const base = new Date("2026-07-09T18:00:00Z");
    for (let i = 0; i < QF_STRUCTURE.length; i++) {
      const { r16, qf } = QF_STRUCTURE[i];
      const homeR16 = R16_STRUCTURE[r16[0]].r16;
      const awayR16 = R16_STRUCTURE[r16[1]].r16;
      const ko = new Date(base);
      ko.setDate(ko.getDate() + Math.floor(i / 2));
      if (i % 2 === 1) ko.setHours(ko.getHours() + 4);
      const v = KNOCKOUT_VENUES[i % KNOCKOUT_VENUES.length];
      insertMatch.run("quarterfinal", qf, null, null, `Gan. P.${homeR16}`, `Gan. P.${awayR16}`, ko.toISOString(), v.venue, v.city, v.country);
    }
  }

  // SF matches (101–102)
  {
    const base = new Date("2026-07-14T18:00:00Z");
    for (let i = 0; i < SF_STRUCTURE.length; i++) {
      const { qf, sf } = SF_STRUCTURE[i];
      const homeQF = QF_STRUCTURE[qf[0]].qf;
      const awayQF = QF_STRUCTURE[qf[1]].qf;
      const ko = new Date(base);
      if (i % 2 === 1) ko.setHours(ko.getHours() + 4);
      const v = KNOCKOUT_VENUES[i % KNOCKOUT_VENUES.length];
      insertMatch.run("semifinal", sf, null, null, `Gan. P.${homeQF}`, `Gan. P.${awayQF}`, ko.toISOString(), v.venue, v.city, v.country);
    }
  }

  // Final (103)
  insertMatch.run("final", 103, null, null, "Gan. P.101", "Gan. P.102", "2026-07-19T20:00:00Z", "MetLife Stadium", "East Rutherford", "EE.UU.");

  console.log("✅ DB seeded — Mundial 2026");
}
