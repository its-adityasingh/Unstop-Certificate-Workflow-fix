export type TextAlign = "left" | "center" | "right" | "justify";
export type VerticalAlign = "top" | "middle" | "bottom";

export interface CertField {
  id: string;
  /** Human label shown in panels, e.g. "Recipient Name" */
  label: string;
  /** Variable token without braces, e.g. "name". Empty for static text. */
  variable: string;
  /** Raw content, may contain {{tokens}} */
  content: string;
  /** Generic text shown in the editor before real participant data exists */
  placeholder?: string;
  /** Normalized coordinates (0..1) of the box's top-left, relative to canvas */
  x: number;
  y: number;
  /** Normalized width (0..1) and height (0..1) of the box */
  w: number;
  h: number;
  fontFamily: string;
  /** Font size as a fraction of canvas height (keeps output identical at any resolution) */
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  underline: boolean;
  uppercase: boolean;
  align: TextAlign;
  /** vertical placement of the text inside the fixed box (defaults to middle) */
  vAlign?: VerticalAlign;
  /** shrink text to fit the fixed box (defaults to true) */
  autoFit?: boolean;
  /** smallest allowed fraction of the configured font size (defaults to 0.35) */
  minFontScale?: number;
  color: string;
  /** in em */
  letterSpacing: number;
  lineHeight: number;
  /** degrees */
  rotation: number;
  opacity: number;
}

/** An organization logo / image placed on the certificate. */
export interface CertLogo {
  id: string;
  name: string;
  /** data URL of the uploaded PNG/JPG/SVG */
  src: string;
  /** normalized geometry, same coordinate system as text fields */
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  opacity: number;
  /** keep aspect ratio inside the box ("contain") or fill it ("cover"/"fill") */
  fit: "contain" | "cover" | "fill";
}

export interface Recipient {
  id: string;
  name: string;
  email: string;
  team_name: string;
  organization: string;
  event_name: string;
  event_year: string;
  year: string;
  address: string;
  date: string;
  certificate_id: string;
  position: string;
  category: string;
  generated: boolean;
  sent: boolean;
  failed: boolean;
  [key: string]: string | boolean;
}

export type CampaignStatus = "draft" | "designed" | "generating" | "generated" | "sending" | "completed";

export interface Campaign {
  id: string;
  name: string;
  eventName: string;
  /** platform template id, or null when a custom upload is used */
  templateId: string | null;
  /** data URL of an uploaded PNG/JPG design */
  customImage: string | null;
  /** width / height */
  aspect: number;
  fields: CertField[];
  /** organization logos placed on the design */
  logos?: CertLogo[];
  recipients: Recipient[];
  generatedCount: number;
  sentCount: number;
  failedCount: number;
  status: CampaignStatus;
  createdAt: number;
  updatedAt: number;
}

export const FIELD_LIBRARY: {
  label: string;
  variable: string;
  sample: string;
  placeholder: string;
  description?: string;
}[] = [
  { label: "Participant Name", variable: "name", sample: "Type Name", placeholder: "Type Name", description: "The person receiving the certificate" },
  { label: "Team Name", variable: "team_name", sample: "Team Name", placeholder: "Team Name Here", description: "Team the participant belongs to" },
  { label: "University", variable: "university", sample: "Demo University", placeholder: "University Here", description: "College or university name" },
  { label: "Organization", variable: "organization", sample: "Demo Organization", placeholder: "Organization Here", description: "Company or organization name" },
  { label: "Event Name", variable: "event_name", sample: "Demo Event 2026", placeholder: "Event Name Here", description: "Name of the event" },
  { label: "Year", variable: "year", sample: "2026", placeholder: "Year Here", description: "Year of the event" },
  { label: "Date", variable: "date", sample: "05 September 2026", placeholder: "Date Here", description: "Date printed on the certificate" },
  { label: "Address", variable: "address", sample: "12 Demo Street, Demo City 000001", placeholder: "Address Here", description: "Participant or venue address" },
  { label: "Certificate ID", variable: "certificate_id", sample: "DEMO-000001", placeholder: "Certificate ID Here", description: "Unique verification code" },
  { label: "Position", variable: "position", sample: "Finalist", placeholder: "Position Here", description: "Winner, Finalist, Participant…" },
  { label: "Category", variable: "category", sample: "Open Innovation", placeholder: "Category Here", description: "Track or category" },
  { label: "Email", variable: "email", sample: "email@example.com", placeholder: "Email Here", description: "Recipient email address" },
];

/** Long/short values used by the editor's fitting test mode. */
export const TEST_VALUE_SETS: { label: string; data: Record<string, string> }[] = [
  {
    label: "Short",
    data: { name: "Name", team_name: "XYZ", university: "Univ", organization: "Org", address: "City", position: "Winner" },
  },
  {
    label: "Typical",
    data: {
      name: "Type Name",
      team_name: "Team Name",
      university: "Sample University",
      organization: "Sample Organization",
      address: "12 Sample Street, Sample City 000001",
      position: "Finalist",
    },
  },
  {
    label: "Long",
    data: {
      name: "Participant Full Name ABCDEFG",
      team_name: "Team ABCDEFGHI",
      university: "Sample Institute of Technology and Applied Sciences",
      organization: "Sample Organization International",
      address: "Plot 18, Sector 62, Sample Business Park Phase II, Sample City 000100",
      position: "Semi-Finalist",
    },
  },
  {
    label: "Extreme",
    data: {
      name: "Participant Full Name ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      team_name: "Team ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      university: "Sample College of Engineering and Advanced Applied Sciences",
      organization: "Sample Organization International Holdings Limited",
      address: "Flat 1204, Tower C, Sample Lakeside Residency, Sample Hobli, Sample City 000087",
      position: "Special Jury Mention",
    },
  },
];

export const FONT_OPTIONS = [
  "Inter",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Poppins",
  "Roboto",
  "Montserrat",
  "Playfair Display",
  "Merriweather",
  "Lora",
  "Libre Baskerville",
  "Cormorant Garamond",
  "EB Garamond",
  "Cinzel",
  "Oswald",
  "Raleway",
  "Lato",
  "Nunito",
  "Open Sans",
  "Dancing Script",
  "Great Vibes",
  "Pinyon Script",
  "Courier New",
];

export const SAMPLE_DATA: Record<string, string> = {
  ...Object.fromEntries(FIELD_LIBRARY.map((f) => [f.variable, f.sample])),
  event_year: "2026",
};

export function renderTemplateString(content: string, data: Record<string, string | boolean>) {
  return content.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) => {
    const value = data[key];
    if (value === undefined || value === null || value === "") return match;
    return String(value);
  });
}

/**
 * Editor-side rendering: with no participant data, unresolved variables fall back
 * to a generic placeholder ("Enter your name") — never to a real person's name.
 */
export function renderFieldText(
  field: { content: string; placeholder?: string; label: string; variable: string },
  data?: Record<string, string | boolean>,
) {
  if (data) return renderTemplateString(field.content, data);
  const ph = field.placeholder || (field.variable ? `${field.label} Here` : field.content);
  return field.content.replace(/\{\{\s*[\w.]+\s*\}\}/g, ph);
}
