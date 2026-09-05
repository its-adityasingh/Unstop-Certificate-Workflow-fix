import type { Recipient } from "./types";

const FIRST = ["Participant"];

const TEAM_A = ["Alpha", "Nebula", "Quantum", "Vertex", "Cipher", "Nova", "Orbit", "Pixel", "Fusion", "Zenith", "Delta", "Titan", "Echo", "Lumen", "Vortex"];
const TEAM_B = ["Coders", "Builders", "Innovators", "Squad", "Labs", "Collective", "Works", "Crew", "Syndicate", "Force"];

const ORGS = [
  "Demo University", "Demo Institute of Technology", "Demo College of Engineering",
  "Sample Polytechnic", "Example School of Design", "Demo Institute of Science",
  "Sample University", "Demo Technical College", "Example Academy", "Demo State University",
  "Sample Institute", "Example College",
];

const CATEGORIES = ["AI & ML", "Web3", "FinTech", "HealthTech", "Open Innovation", "Sustainability", "AR/VR", "Robotics"];
const POSITIONS = ["Participant", "Participant", "Participant", "Participant", "Finalist", "Semi-Finalist", "Runner Up", "Winner"];

function slugEmail(first: string, last: string, i: number) {
  return `${first.toLowerCase()}.${last.toLowerCase()}${i % 97}@example.com`;
}

export function generateRecipients(
  count: number,
  opts: { eventName: string; year: string; date: string; prefix: string },
): Recipient[] {
  const out: Recipient[] = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST[i % FIRST.length]!;
    const last = String(i + 1).padStart(3, "0");
    const team = `Team ${TEAM_A[(i * 3) % TEAM_A.length]!} ${TEAM_B[(i * 5) % TEAM_B.length]!}`;
    const serial = String(i + 1).padStart(6, "0");
    out.push({
      id: `r-${serial}`,
      name: `${first} ${last}`,
      email: slugEmail(first, last, i),
      team_name: team,
      organization: ORGS[(i * 11) % ORGS.length]!,
      university: ORGS[(i * 11) % ORGS.length]!,
      event_name: opts.eventName,
      event_year: opts.year,
      year: opts.year,
      address: `${(i % 90) + 10} ${["Demo Road", "Sample Street", "Example Avenue", "Lake View Road", "Sector 62"][i % 5]}, ${["Demo City", "Sample City", "Example City", "Demo Town", "Sample Town"][i % 5]} ${100000 + (i % 200)}`,
      date: opts.date,
      certificate_id: `${opts.prefix}-${serial}`,
      position: POSITIONS[(i * 13) % POSITIONS.length]!,
      category: CATEGORIES[(i * 17) % CATEGORIES.length]!,
      generated: false,
      sent: false,
      failed: false,
    });
  }
  // Make the very first record match the demo script exactly.
  if (out[0]) {
    out[0] = {
      ...out[0],
      name: "Participant 001",
      email: "participant001@example.com",
      team_name: "Team 001",
      organization: "Demo University",
    };
  }
  return out;
}

export function parseCsv(
  text: string,
  fallback: { eventName: string; year: string; date: string; prefix: string },
): Recipient[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const split = (line: string) =>
    line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  const headers = split(lines[0] ?? "").map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line, i) => {
    const cells = split(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = cells[idx] ?? ""));
    const serial = String(i + 1).padStart(6, "0");
    return {
      id: `r-${serial}`,
      name: row["name"] ?? "",
      email: row["email"] ?? "",
      team_name: row["team_name"] ?? row["team"] ?? "",
      organization: row["organization"] ?? row["college_name"] ?? "",
      university: row["university"] ?? row["college_name"] ?? row["organization"] ?? "",
      event_name: row["event_name"] ?? row["event"] ?? fallback.eventName,
      event_year: row["event_year"] ?? row["year"] ?? fallback.year,
      year: row["year"] ?? row["event_year"] ?? fallback.year,
      address: row["address"] ?? "",
      date: row["date"] ?? fallback.date,
      certificate_id: row["certificate_id"] ?? `${fallback.prefix}-${serial}`,
      position: row["position"] ?? "Participant",
      category: row["category"] ?? "",
      ...row,
      generated: false,
      sent: false,
      failed: false,
    } as Recipient;
  });
}

export function formatDateLong(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}
