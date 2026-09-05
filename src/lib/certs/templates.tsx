import type { CertField } from "./types";
import mosaicAsset from "@/assets/certificate-appreciation-mosaic.png.asset.json";
import stripesAsset from "@/assets/certificate-stripes-blue.png.asset.json";
import ribbonAsset from "@/assets/certificate-geometric-ribbon.png.asset.json";
import bandsAsset from "@/assets/certificate-mosaic-bands.png.asset.json";

export interface CertTemplate {
  id: string;
  name: string;
  category: string;
  aspect: number;
  variant: string;
  paper: string;
  ink: string;
  accent: string;
  soft: string;
  /** optional full-bleed background image (used instead of drawn artwork) */
  image?: string;
  fields: CertField[];
}

let uid = 0;
const nid = (p: string) => `${p}-${++uid}`;

interface FieldInit extends Partial<CertField> {
  label: string;
  content: string;
  x: number;
  y: number;
  w: number;
}

function f(init: FieldInit): CertField {
  return {
    id: nid("f"),
    variable: "",
    h: 0.09,
    fontFamily: "Inter",
    fontSize: 0.05,
    fontWeight: 400,
    italic: false,
    underline: false,
    uppercase: false,
    align: "center",
    color: "#1f2937",
    letterSpacing: 0,
    lineHeight: 1.2,
    rotation: 0,
    opacity: 1,
    ...init,
  } as CertField;
}

function baseLayout(opts: {
  title: string;
  ink: string;
  accent: string;
  muted: string;
  titleFont: string;
  nameFont: string;
  subtitle?: string;
  body?: string;
}): CertField[] {
  const { title, ink, accent, muted, titleFont, nameFont } = opts;
  return [
    f({
      label: "Certificate Title",
      content: title,
      x: 0.1,
      y: 0.16,
      w: 0.8,
      h: 0.1,
      fontFamily: titleFont,
      fontSize: 0.082,
      fontWeight: 700,
      letterSpacing: 0.06,
      uppercase: true,
      color: ink,
    }),
    f({
      label: "Presented To Label",
      content: opts.subtitle ?? "This certificate is proudly presented to",
      x: 0.15,
      y: 0.33,
      w: 0.7,
      h: 0.06,
      fontSize: 0.032,
      color: muted,
      letterSpacing: 0.02,
    }),
    f({
      label: "Participant Name",
      placeholder: "Type Name",
      variable: "name",
      content: "{{name}}",
      x: 0.1,
      y: 0.41,
      w: 0.8,
      h: 0.12,
      fontFamily: nameFont,
      fontSize: 0.095,
      fontWeight: 700,
      color: accent,
    }),
    f({
      label: "Description",
      content:
        opts.body ??
        "for outstanding participation in {{event_name}} representing {{organization}} as part of {{team_name}}.",
      x: 0.14,
      y: 0.57,
      w: 0.72,
      h: 0.12,
      fontSize: 0.031,
      lineHeight: 1.45,
      color: muted,
    }),
    f({
      label: "Date",
      placeholder: "Date Here",
      variable: "date",
      content: "{{date}}",
      x: 0.1,
      y: 0.82,
      w: 0.26,
      h: 0.06,
      fontSize: 0.03,
      fontWeight: 600,
      color: ink,
    }),
    f({
      label: "Certificate ID",
      placeholder: "Certificate ID Here",
      variable: "certificate_id",
      content: "ID: {{certificate_id}}",
      x: 0.64,
      y: 0.82,
      w: 0.26,
      h: 0.06,
      fontSize: 0.026,
      color: muted,
      letterSpacing: 0.05,
    }),
  ];
}

export const TEMPLATE_CATEGORIES = [
  "All",
  "Hackathon",
  "Competition",
  "Participation",
  "Winner",
  "Internship",
  "Job / Career",
  "Workshop",
  "Seminar",
  "Volunteering",
  "Achievement",
  "Appreciation",
];

export const TEMPLATES: CertTemplate[] = [
  {
    id: "tpl-hackathon-neon",
    name: "Hackathon Circuit",
    category: "Hackathon",
    aspect: 1.414,
    variant: "tech",
    paper: "#0b1220",
    ink: "#e6edf7",
    accent: "#5eead4",
    soft: "#94a3b8",
    fields: baseLayout({
      title: "Certificate of Participation",
      ink: "#e6edf7",
      accent: "#5eead4",
      muted: "#9fb0c7",
      titleFont: "Montserrat",
      nameFont: "Montserrat",
    }),
  },
  {
    id: "tpl-winner-gold",
    name: "Gold Laurel Winner",
    category: "Winner",
    aspect: 1.414,
    variant: "goldframe",
    paper: "#fffdf6",
    ink: "#3f3222",
    accent: "#a1741f",
    soft: "#8b7a5c",
    fields: baseLayout({
      title: "Certificate of Excellence",
      ink: "#3f3222",
      accent: "#a1741f",
      muted: "#8b7a5c",
      titleFont: "Playfair Display",
      nameFont: "Playfair Display",
      body: "awarded for securing {{position}} in {{event_name}} in the {{category}} category.",
    }),
  },
  {
    id: "tpl-participation-classic",
    name: "Classic Participation",
    category: "Participation",
    aspect: 1.414,
    variant: "classic",
    paper: "#ffffff",
    ink: "#1f2937",
    accent: "#1d4ed8",
    soft: "#64748b",
    fields: baseLayout({
      title: "Certificate of Participation",
      ink: "#1f2937",
      accent: "#1d4ed8",
      muted: "#64748b",
      titleFont: "Merriweather",
      nameFont: "Merriweather",
    }),
  },
  {
    id: "tpl-competition-bold",
    name: "Competition Arena",
    category: "Competition",
    aspect: 1.414,
    variant: "diagonal",
    paper: "#ffffff",
    ink: "#111827",
    accent: "#b91c1c",
    soft: "#6b7280",
    fields: baseLayout({
      title: "Certificate of Achievement",
      ink: "#111827",
      accent: "#b91c1c",
      muted: "#6b7280",
      titleFont: "Poppins",
      nameFont: "Poppins",
      body: "for competing in {{event_name}} and finishing as {{position}}.",
    }),
  },
  {
    id: "tpl-internship-modern",
    name: "Internship Completion",
    category: "Internship",
    aspect: 1.414,
    variant: "sidebar",
    paper: "#ffffff",
    ink: "#0f172a",
    accent: "#0f766e",
    soft: "#64748b",
    fields: baseLayout({
      title: "Internship Certificate",
      ink: "#0f172a",
      accent: "#0f766e",
      muted: "#64748b",
      titleFont: "Inter",
      nameFont: "Inter",
      subtitle: "This is to certify that",
      body: "has successfully completed an internship with {{organization}} during {{event_year}}.",
    }),
  },
  {
    id: "tpl-career-slate",
    name: "Career Milestone",
    category: "Job / Career",
    aspect: 1.414,
    variant: "minimal",
    paper: "#f8fafc",
    ink: "#0f172a",
    accent: "#1e293b",
    soft: "#64748b",
    fields: baseLayout({
      title: "Professional Recognition",
      ink: "#0f172a",
      accent: "#1e293b",
      muted: "#64748b",
      titleFont: "Inter",
      nameFont: "Playfair Display",
    }),
  },
  {
    id: "tpl-workshop-wave",
    name: "Workshop Wave",
    category: "Workshop",
    aspect: 1.414,
    variant: "wave",
    paper: "#ffffff",
    ink: "#15304f",
    accent: "#2563eb",
    soft: "#5b7391",
    fields: baseLayout({
      title: "Workshop Completion",
      ink: "#15304f",
      accent: "#2563eb",
      muted: "#5b7391",
      titleFont: "Poppins",
      nameFont: "Poppins",
      body: "attended the {{event_name}} workshop hosted for {{organization}}.",
    }),
  },
  {
    id: "tpl-seminar-frame",
    name: "Seminar Formal",
    category: "Seminar",
    aspect: 1.414,
    variant: "double",
    paper: "#fdfcfa",
    ink: "#28303f",
    accent: "#7c2d12",
    soft: "#6f6a63",
    fields: baseLayout({
      title: "Certificate of Attendance",
      ink: "#28303f",
      accent: "#7c2d12",
      muted: "#6f6a63",
      titleFont: "Merriweather",
      nameFont: "Merriweather",
    }),
  },
  {
    id: "tpl-volunteer-leaf",
    name: "Volunteer Service",
    category: "Volunteering",
    aspect: 1.414,
    variant: "corner",
    paper: "#f7fdf9",
    ink: "#14352a",
    accent: "#15803d",
    soft: "#5b7d6d",
    fields: baseLayout({
      title: "Certificate of Service",
      ink: "#14352a",
      accent: "#15803d",
      muted: "#5b7d6d",
      titleFont: "Montserrat",
      nameFont: "Montserrat",
      body: "in grateful recognition of volunteer service at {{event_name}}, {{event_year}}.",
    }),
  },
  {
    id: "tpl-achievement-seal",
    name: "Achievement Seal",
    category: "Achievement",
    aspect: 1.414,
    variant: "seal",
    paper: "#ffffff",
    ink: "#1b1b3a",
    accent: "#4338ca",
    soft: "#5d5d80",
    fields: baseLayout({
      title: "Certificate of Achievement",
      ink: "#1b1b3a",
      accent: "#4338ca",
      muted: "#5d5d80",
      titleFont: "Playfair Display",
      nameFont: "Playfair Display",
    }),
  },
  {
    id: "tpl-appreciation-warm",
    name: "Warm Appreciation",
    category: "Appreciation",
    aspect: 1.414,
    variant: "arch",
    paper: "#fffaf3",
    ink: "#43302b",
    accent: "#c2410c",
    soft: "#8a6f63",
    fields: baseLayout({
      title: "Certificate of Appreciation",
      ink: "#43302b",
      accent: "#c2410c",
      muted: "#8a6f63",
      titleFont: "Playfair Display",
      nameFont: "Georgia",
    }),
  },
  {
    id: "tpl-appreciation-mosaic",
    name: "Geometric Mosaic Appreciation",
    category: "Appreciation",
    aspect: 1.386,
    variant: "image",
    image: mosaicAsset.url,
    paper: "#f6f8fa",
    ink: "#1d2a3a",
    accent: "#1c3f77",
    soft: "#6b7c90",
    fields: [],
  },
  {
    id: "tpl-appreciation-stripes",
    name: "Diagonal Stripes Certificate",
    category: "Appreciation",
    aspect: 1920 / 1376,
    variant: "image",
    image: stripesAsset.url,
    paper: "#ffffff",
    ink: "#1d2a3a",
    accent: "#2a4f9b",
    soft: "#6b7c90",
    fields: [],
  },
  {
    id: "tpl-appreciation-ribbon",
    name: "Geometric Ribbon Appreciation",
    category: "Appreciation",
    aspect: 1920 / 1379,
    variant: "image",
    image: ribbonAsset.url,
    paper: "#ffffff",
    ink: "#1d2a3a",
    accent: "#1c3f77",
    soft: "#6b7c90",
    fields: [],
  },
  {
    id: "tpl-achievement-bands",
    name: "Mosaic Bands Certificate",
    category: "Achievement",
    aspect: 1920 / 1376,
    variant: "image",
    image: bandsAsset.url,
    paper: "#ffffff",
    ink: "#123a63",
    accent: "#1ba4e2",
    soft: "#6b7c90",
    fields: [],
  },
  {
    id: "tpl-hackathon-grid",
    name: "Builder Grid",
    category: "Hackathon",
    aspect: 1.414,
    variant: "grid",
    paper: "#111827",
    ink: "#f3f4f6",
    accent: "#f59e0b",
    soft: "#9ca3af",
    fields: baseLayout({
      title: "Hackathon Certificate",
      ink: "#f3f4f6",
      accent: "#f59e0b",
      muted: "#9ca3af",
      titleFont: "Roboto",
      nameFont: "Roboto",
    }),
  },
];

export function getTemplate(id: string | null | undefined) {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}

/** Decorative background drawn in a 1000 x (1000/aspect) coordinate space. */
export function TemplateArtwork({ template }: { template: CertTemplate }) {
  const W = 1000;
  const H = Math.round(1000 / template.aspect);
  const { accent, soft, variant, paper, ink } = template;
  const p = 26;

  if (template.image) {
    return (
      <img
        src={template.image}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 h-full w-full object-fill"
      />
    );
  }

  const decor = () => {
    switch (variant) {
      case "tech":
        return (
          <>
            <rect x={0} y={0} width={W} height={H} fill="url(#techGrad)" />
            {Array.from({ length: 14 }).map((_, i) => (
              <line
                key={i}
                x1={0}
                y1={(H / 14) * i}
                x2={W}
                y2={(H / 14) * i}
                stroke={accent}
                strokeOpacity={0.07}
              />
            ))}
            <circle cx={W - 90} cy={90} r={54} fill="none" stroke={accent} strokeOpacity={0.5} strokeWidth={2} />
            <circle cx={W - 90} cy={90} r={34} fill={accent} fillOpacity={0.14} />
            <rect x={p} y={p} width={W - p * 2} height={H - p * 2} fill="none" stroke={accent} strokeOpacity={0.45} />
            <rect x={0} y={H - 14} width={W} height={14} fill={accent} fillOpacity={0.8} />
          </>
        );
      case "goldframe":
        return (
          <>
            <rect x={0} y={0} width={W} height={H} fill={paper} />
            <rect x={18} y={18} width={W - 36} height={H - 36} fill="none" stroke={accent} strokeWidth={6} />
            <rect x={34} y={34} width={W - 68} height={H - 68} fill="none" stroke={accent} strokeWidth={1.5} strokeOpacity={0.7} />
            {[[34, 34], [W - 34, 34], [34, H - 34], [W - 34, H - 34]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={12} fill={accent} fillOpacity={0.85} />
            ))}
            <circle cx={W / 2} cy={H - 96} r={44} fill="none" stroke={accent} strokeWidth={2} />
            <circle cx={W / 2} cy={H - 96} r={32} fill={accent} fillOpacity={0.14} />
          </>
        );
      case "classic":
        return (
          <>
            <rect x={0} y={0} width={W} height={H} fill={paper} />
            <rect x={p} y={p} width={W - p * 2} height={H - p * 2} fill="none" stroke={accent} strokeWidth={3} />
            <rect x={p + 10} y={p + 10} width={W - (p + 10) * 2} height={H - (p + 10) * 2} fill="none" stroke={soft} strokeOpacity={0.5} />
            <rect x={W / 2 - 70} y={H - 118} width={140} height={3} fill={accent} />
          </>
        );
      case "diagonal":
        return (
          <>
            <rect x={0} y={0} width={W} height={H} fill={paper} />
            <polygon points={`0,0 300,0 0,220`} fill={accent} fillOpacity={0.9} />
            <polygon points={`0,0 190,0 0,140`} fill={ink} fillOpacity={0.85} />
            <polygon points={`${W},${H} ${W - 300},${H} ${W},${H - 220}`} fill={accent} fillOpacity={0.9} />
            <polygon points={`${W},${H} ${W - 190},${H} ${W},${H - 140}`} fill={ink} fillOpacity={0.85} />
          </>
        );
      case "sidebar":
        return (
          <>
            <rect x={0} y={0} width={W} height={H} fill={paper} />
            <rect x={0} y={0} width={64} height={H} fill={accent} />
            <rect x={64} y={0} width={10} height={H} fill={accent} fillOpacity={0.35} />
            <rect x={110} y={H - 90} width={220} height={2} fill={soft} fillOpacity={0.6} />
          </>
        );
      case "minimal":
        return (
          <>
            <rect x={0} y={0} width={W} height={H} fill={paper} />
            <rect x={0} y={0} width={W} height={10} fill={accent} />
            <rect x={80} y={H - 70} width={W - 160} height={1} fill={soft} fillOpacity={0.5} />
          </>
        );
      case "wave":
        return (
          <>
            <rect x={0} y={0} width={W} height={H} fill={paper} />
            <path d={`M0,0 L${W},0 L${W},110 Q${W / 2},210 0,110 Z`} fill={accent} fillOpacity={0.14} />
            <path d={`M0,${H} L${W},${H} L${W},${H - 110} Q${W / 2},${H - 210} 0,${H - 110} Z`} fill={accent} fillOpacity={0.22} />
            <rect x={p} y={p} width={W - p * 2} height={H - p * 2} fill="none" stroke={accent} strokeOpacity={0.35} />
          </>
        );
      case "double":
        return (
          <>
            <rect x={0} y={0} width={W} height={H} fill={paper} />
            <rect x={20} y={20} width={W - 40} height={H - 40} fill="none" stroke={ink} strokeWidth={2} strokeOpacity={0.6} />
            <rect x={30} y={30} width={W - 60} height={H - 60} fill="none" stroke={accent} strokeWidth={5} strokeOpacity={0.75} />
            <rect x={44} y={44} width={W - 88} height={H - 88} fill="none" stroke={ink} strokeOpacity={0.25} />
          </>
        );
      case "corner":
        return (
          <>
            <rect x={0} y={0} width={W} height={H} fill={paper} />
            <path d={`M0,0 L260,0 L0,260 Z`} fill={accent} fillOpacity={0.16} />
            <path d={`M${W},${H} L${W - 260},${H} L${W},${H - 260} Z`} fill={accent} fillOpacity={0.16} />
            <circle cx={W - 110} cy={110} r={40} fill={accent} fillOpacity={0.18} />
            <rect x={p} y={p} width={W - p * 2} height={H - p * 2} fill="none" stroke={accent} strokeOpacity={0.5} strokeWidth={2} />
          </>
        );
      case "seal":
        return (
          <>
            <rect x={0} y={0} width={W} height={H} fill={paper} />
            <rect x={0} y={0} width={W} height={H} fill="url(#sealGrad)" />
            <rect x={p} y={p} width={W - p * 2} height={H - p * 2} rx={12} fill="none" stroke={accent} strokeWidth={2} strokeOpacity={0.6} />
            <circle cx={W - 120} cy={H - 120} r={52} fill={accent} fillOpacity={0.12} />
            <circle cx={W - 120} cy={H - 120} r={52} fill="none" stroke={accent} strokeOpacity={0.6} strokeWidth={2} />
            <circle cx={W - 120} cy={H - 120} r={38} fill="none" stroke={accent} strokeOpacity={0.35} />
          </>
        );
      case "arch":
        return (
          <>
            <rect x={0} y={0} width={W} height={H} fill={paper} />
            <path d={`M${W / 2 - 300},${H - 60} L${W / 2 - 300},220 Q${W / 2},-40 ${W / 2 + 300},220 L${W / 2 + 300},${H - 60} Z`} fill="none" stroke={accent} strokeOpacity={0.4} strokeWidth={2} />
            <rect x={0} y={0} width={W} height={H} fill="none" stroke={accent} strokeOpacity={0.25} strokeWidth={16} />
          </>
        );
      case "grid":
      default:
        return (
          <>
            <rect x={0} y={0} width={W} height={H} fill={paper} />
            {Array.from({ length: 25 }).map((_, i) => (
              <line key={`v${i}`} x1={(W / 25) * i} y1={0} x2={(W / 25) * i} y2={H} stroke={accent} strokeOpacity={0.06} />
            ))}
            {Array.from({ length: 17 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={(H / 17) * i} x2={W} y2={(H / 17) * i} stroke={accent} strokeOpacity={0.06} />
            ))}
            <rect x={p} y={p} width={W - p * 2} height={H - p * 2} fill="none" stroke={accent} strokeOpacity={0.6} strokeWidth={2} />
            <rect x={p} y={p} width={160} height={6} fill={accent} />
          </>
        );
    }
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="techGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b1220" />
          <stop offset="100%" stopColor="#132033" />
        </linearGradient>
        <linearGradient id="sealGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.08" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {decor()}
    </svg>
  );
}
