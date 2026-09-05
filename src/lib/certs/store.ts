import { useSyncExternalStore } from "react";
import type { Campaign, CertField, Recipient } from "./types";
import { getTemplate, TEMPLATES } from "./templates";
import { formatDateLong, generateRecipients } from "./sample";

const KEY = "certflow.state.v4";

interface State {
  campaigns: Campaign[];
}

let state: State = { campaigns: [] };
const listeners = new Set<() => void>();
let loaded = false;

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    // Uploaded artwork can be large; drop it from persistence if we blow the quota.
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    try {
      const light: State = {
        campaigns: state.campaigns.map((c) => ({ ...c, customImage: null, logos: [] })),
      };
      window.localStorage.setItem(KEY, JSON.stringify(light));
    } catch {
      /* ignore */
    }
  }
}

function cloneFields(fields: CertField[]): CertField[] {
  return fields.map((f, i) => ({ ...f, id: `f-${Date.now().toString(36)}-${i}` }));
}

function demoCampaign(): Campaign {
  const tpl = TEMPLATES[0]!;
  const date = formatDateLong(new Date(2026, 8, 5));
  const recipients = generateRecipients(1000, {
    eventName: "Brainwave 2026",
    year: "2026",
    date,
    prefix: "BW",
  }).map((r) => ({ ...r, generated: true, sent: true }));
  const now = Date.now();
  return {
    id: "camp-brainwave-2026",
    name: "Brainwave 2026 Participation Certificate",
    eventName: "Brainwave Hackathon",
    templateId: tpl.id,
    customImage: null,
    aspect: tpl.aspect,
    fields: cloneFields(tpl.fields),
    recipients,
    generatedCount: 1000,
    sentCount: 1000,
    failedCount: 0,
    status: "completed",
    createdAt: now - 86400000 * 6,
    updatedAt: now - 86400000 * 5,
  };
}

function draftCampaign(): Campaign {
  const tpl = TEMPLATES[4]!;
  const now = Date.now();
  return {
    id: "camp-summer-internship",
    name: "Summer Internship 2026 Completion",
    eventName: "Summer Internship Program",
    templateId: tpl.id,
    customImage: null,
    aspect: tpl.aspect,
    fields: cloneFields(tpl.fields),
    recipients: [],
    generatedCount: 0,
    sentCount: 0,
    failedCount: 0,
    status: "draft",
    createdAt: now - 86400000 * 2,
    updatedAt: now - 3600000 * 5,
  };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed && Array.isArray(parsed.campaigns)) {
        state = parsed;
        emit();
        return;
      }
    }
  } catch {
    /* fall through to seed */
  }
  state = { campaigns: [] };
  emit();
}

function setState(next: State) {
  state = next;
  persist();
  emit();
}

export function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const EMPTY: State = { campaigns: [] };
export function getSnapshot() {
  return state;
}
export function getServerSnapshot() {
  return EMPTY;
}

export function useCampaigns() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).campaigns;
}

export function useCampaign(id: string | null | undefined) {
  const campaigns = useCampaigns();
  return campaigns.find((c) => c.id === id) ?? null;
}

export function createCampaign(input: {
  name: string;
  eventName: string;
  templateId?: string | null;
  customImage?: string | null;
  aspect?: number;
  fields?: CertField[];
}): Campaign {
  load();
  const tpl = getTemplate(input.templateId);
  const now = Date.now();
  const campaign: Campaign = {
    id: `camp-${now.toString(36)}`,
    name: input.name,
    eventName: input.eventName,
    templateId: input.templateId ?? null,
    customImage: input.customImage ?? null,
    aspect: input.aspect ?? tpl?.aspect ?? 1.414,
    fields: input.fields ?? (tpl ? cloneFields(tpl.fields) : []),
    recipients: [],
    generatedCount: 0,
    sentCount: 0,
    failedCount: 0,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
  setState({ campaigns: [campaign, ...state.campaigns] });
  return campaign;
}

export function updateCampaign(id: string, patch: Partial<Campaign>) {
  load();
  setState({
    campaigns: state.campaigns.map((c) =>
      c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c,
    ),
  });
}

export function deleteCampaign(id: string) {
  load();
  setState({ campaigns: state.campaigns.filter((c) => c.id !== id) });
}

export function setRecipients(id: string, recipients: Recipient[]) {
  updateCampaign(id, {
    recipients,
    generatedCount: 0,
    sentCount: 0,
    failedCount: 0,
    status: "designed",
  });
}

export function markGenerated(id: string, count: number) {
  load();
  setState({
    campaigns: state.campaigns.map((c) => {
      if (c.id !== id) return c;
      return {
        ...c,
        recipients: c.recipients.map((r, i) => (i < count ? { ...r, generated: true } : r)),
        generatedCount: count,
        status: count >= c.recipients.length ? "generated" : "generating",
        updatedAt: Date.now(),
      };
    }),
  });
}

export function markSent(id: string, count: number) {
  load();
  setState({
    campaigns: state.campaigns.map((c) => {
      if (c.id !== id) return c;
      return {
        ...c,
        recipients: c.recipients.map((r, i) => (i < count ? { ...r, sent: true } : r)),
        sentCount: count,
        status: count >= c.recipients.length ? "completed" : "sending",
        updatedAt: Date.now(),
      };
    }),
  });
}

export function loadDemoData() {
  setState({ campaigns: [demoCampaign(), draftCampaign()] });
}

export function resetDemo() {
  setState({ campaigns: [] });
}
