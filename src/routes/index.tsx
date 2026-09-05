import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  FileEdit,
  Plus,
  RotateCcw,
  Search,
  Send,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/certificate/AppShell";
import { CertificateCanvas } from "@/components/certificate/CertificateCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { resetDemo, useCampaigns } from "@/lib/certs/store";
import { SAMPLE_DATA } from "@/lib/certs/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import mascotAsset from "@/assets/mascot-duo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Certificate Dashboard — CertFlow for Event Organizers" },
      {
        name: "description",
        content:
          "Track certificate campaigns, drafts, generated and sent certificates, and recipient counts across all your events in one dashboard.",
      },
      { property: "og:title", content: "Certificate Dashboard — CertFlow" },
      {
        property: "og:description",
        content: "Campaigns, drafts, generation and delivery status for every event certificate you run.",
      },
    ],
  }),
  component: Dashboard,
});

type Tab = "all" | "drafts" | "generated" | "sent";

function Dashboard() {
  const campaigns = useCampaigns();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const totals = useMemo(() => {
    return campaigns.reduce(
      (acc, c) => ({
        recipients: acc.recipients + c.recipients.length,
        generated: acc.generated + c.generatedCount,
        sent: acc.sent + c.sentCount,
        drafts: acc.drafts + (c.status === "draft" ? 1 : 0),
      }),
      { recipients: 0, generated: 0, sent: 0, drafts: 0 },
    );
  }, [campaigns]);

  const visible = campaigns.filter((c) => {
    const q = query.trim().toLowerCase();
    if (q && !(c.name.toLowerCase().includes(q) || c.eventName.toLowerCase().includes(q))) return false;
    if (tab === "drafts") return c.status === "draft";
    if (tab === "generated") return c.generatedCount > 0;
    if (tab === "sent") return c.sentCount > 0;
    return true;
  });

  const hasCampaigns = campaigns.length > 0;

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Certificate dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Design, generate and deliver certificates for every event you run.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              resetDemo();
              toast.success("Dashboard reset");
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Campaigns" value={campaigns.length} icon={<Award className="h-4 w-4" />} />
        <StatCard label="Recipients" value={totals.recipients} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Generated" value={totals.generated} icon={<CheckCircle2 className="h-4 w-4" />} tone="primary" />
        <StatCard label="Sent" value={totals.sent} icon={<Send className="h-4 w-4" />} tone="success" />
        <StatCard label="Drafts" value={totals.drafts} icon={<FileEdit className="h-4 w-4" />} />
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <img
            src={mascotAsset.url}
            alt="Unstop mascot duo"
            className="h-10 w-auto object-contain"
          />
          <h2 className="text-lg font-semibold">My certificate campaigns</h2>
        </div>
        <div className="flex gap-1.5">
          {(
            [
              ["all", "All"],
              ["drafts", "Drafts"],
              ["generated", "Generated"],
              ["sent", "Sent"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              disabled={!hasCampaigns}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                tab === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
                !hasCampaigns && "cursor-not-allowed opacity-50 hover:text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns"
            disabled={!hasCampaigns}
            className="pl-9"
          />
        </div>
      </div>

      {!hasCampaigns ? (
        <div className="mt-6 rounded-2xl border border-dashed p-12 text-center sm:p-16">
          <h3 className="font-display text-2xl font-semibold tracking-tight">Create your first certificate</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Pick a ready-made design or upload your own, place the details you need, and generate certificates for
            everyone in your event.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/create">
                <Plus className="h-4 w-4" />
                Get started
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/templates">Browse templates</Link>
            </Button>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            Once you create one, it will appear here with its date and generation results.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed p-16 text-center">
          <p className="font-medium">No campaigns match this filter</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different tab or clear your search.</p>
          <Button asChild className="mt-5">
            <Link to="/create">Create Certificate</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {visible.map((c) => {
            const total = c.recipients.length;
            const pct = total ? Math.round((c.generatedCount / total) * 100) : 0;
            return (
              <Link
                key={c.id}
                to={total ? "/campaigns/$id" : "/editor/$id"}
                params={{ id: c.id }}
                className="group flex gap-5 rounded-2xl border bg-card p-5 shadow-panel transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="hidden w-48 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/10 sm:block">
                  <CertificateCanvas source={c} data={c.recipients[0] ?? SAMPLE_DATA} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{c.name}</h3>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{c.eventName}</p>
                    </div>
                    <Badge
                      className="ml-auto shrink-0 capitalize"
                      variant={c.status === "completed" ? "default" : "secondary"}
                    >
                      {c.status === "completed" ? "Completed" : c.status}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <MiniStat label="Recipients" value={total} />
                    <MiniStat label="Generated" value={c.generatedCount} />
                    <MiniStat label="Sent" value={c.sentCount} />
                  </div>
                  <Progress className="mt-4" value={pct} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {total === 0
                      ? `Created ${new Date(c.createdAt).toLocaleDateString()} · draft, no recipients yet`
                      : `Created ${new Date(c.createdAt).toLocaleDateString()} · ${pct}% generated · ${c.sentCount} sent`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-secondary/60 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: "primary" | "success";
}) {
  return (
    <div className="stat-card p-5">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p
        className={cn(
          "mt-2 text-3xl font-bold tabular-nums",
          tone === "success" && "text-success",
          tone === "primary" && "text-primary",
        )}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}
