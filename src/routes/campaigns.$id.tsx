import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Eye, Mail, RefreshCw, Search, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell, StepBar } from "@/components/certificate/AppShell";
import { CertificateCanvas } from "@/components/certificate/CertificateCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { markGenerated, markSent, useCampaign } from "@/lib/certs/store";
import type { Recipient } from "@/lib/certs/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/campaigns/$id")({
  head: () => ({
    meta: [
      { title: "Generate & Send Certificates — CertFlow" },
      {
        name: "description",
        content:
          "Bulk-generate certificates for every recipient, watch live progress, simulate delivery and review per-recipient status.",
      },
      { property: "og:title", content: "Generate & Send Certificates — CertFlow" },
      { property: "og:description", content: "Bulk generation, delivery simulation and a full recipient status table." },
    ],
  }),
  component: CampaignPage,
});

const PAGE_SIZE = 25;

function CampaignPage() {
  const { id } = Route.useParams();
  const campaign = useCampaign(id);
  const [genProgress, setGenProgress] = useState<number | null>(null);
  const [sendProgress, setSendProgress] = useState<number | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);
  const [previewRecipient, setPreviewRecipient] = useState<Recipient | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "generated" | "pending" | "sent" | "not_sent">("all");
  const [page, setPage] = useState(1);
  const timer = useRef<number | null>(null);

  const total = campaign?.recipients.length ?? 0;

  const filtered = useMemo(() => {
    if (!campaign) return [];
    const q = query.trim().toLowerCase();
    return campaign.recipients.filter((r) => {
      if (q && ![r.name, r.email, r.team_name, r.organization, r.certificate_id].some((v) => v.toLowerCase().includes(q)))
        return false;
      if (filter === "generated") return r.generated;
      if (filter === "pending") return !r.generated;
      if (filter === "sent") return r.sent;
      if (filter === "not_sent") return !r.sent;
      return true;
    });
  }, [campaign, query, filter]);

  if (!campaign) {
    return (
      <AppShell>
        <div className="rounded-2xl border border-dashed p-16 text-center">
          <p className="text-muted-foreground">This campaign no longer exists.</p>
          <Button asChild className="mt-4">
            <Link to="/">Back to dashboard</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  function runProgress(kind: "generate" | "send") {
    if (timer.current) window.clearInterval(timer.current);
    const setter = kind === "generate" ? setGenProgress : setSendProgress;
    const commit = kind === "generate" ? markGenerated : markSent;
    let done = 0;
    setter(0);
    const stepSize = Math.max(1, Math.round(total / 40));
    timer.current = window.setInterval(() => {
      done = Math.min(total, done + stepSize);
      setter(done);
      commit(id, done);
      if (done >= total) {
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
        window.setTimeout(() => setter(null), 900);
        toast.success(
          kind === "generate"
            ? `${total.toLocaleString()} certificates generated successfully.`
            : "Certificates sent successfully",
          { description: kind === "send" ? `${total.toLocaleString()} recipients · 0 failed` : undefined },
        );
      }
    }, 55);
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const generating = genProgress !== null;
  const sending = sendProgress !== null;
  const allGenerated = total > 0 && campaign.generatedCount >= total;
  const allSent = total > 0 && campaign.sentCount >= total;

  return (
    <AppShell wide>
      <StepBar current={4} />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/recipients/$id" params={{ id: campaign.id }}>
            <ArrowLeft className="h-4 w-4" />
            Recipients
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{campaign.name}</h1>
          <p className="text-sm text-muted-foreground">{campaign.eventName}</p>
        </div>
        <Badge className="ml-2" variant={allSent ? "default" : "secondary"}>
          {allSent ? "Completed" : allGenerated ? "Generated" : total ? "Ready" : "Draft"}
        </Badge>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/editor/$id" params={{ id: campaign.id }}>
              Edit design
            </Link>
          </Button>
          <Button onClick={() => runProgress("generate")} disabled={generating || total === 0}>
            <Sparkles className="h-4 w-4" />
            {allGenerated ? "Re-generate All Certificates" : "Generate All Certificates"}
          </Button>
          <Button
            variant={allGenerated ? "default" : "secondary"}
            onClick={() => setConfirmSend(true)}
            disabled={!allGenerated || sending}
          >
            <Send className="h-4 w-4" />
            Send Certificates
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Recipients" value={total} icon={<Mail className="h-4 w-4" />} />
        <Stat label="Generated" value={campaign.generatedCount} tone="primary" />
        <Stat label="Sent" value={campaign.sentCount} tone="success" />
        <Stat label="Failed" value={campaign.failedCount} tone="muted" />
      </div>

      {(generating || sending) && (
        <div className="mt-5 rounded-2xl border bg-card p-5 shadow-panel">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            <p className="text-sm font-medium">
              {generating ? "Generating certificates…" : "Sending certificates…"}
            </p>
            <span className="ml-auto text-sm tabular-nums text-muted-foreground">
              {(genProgress ?? sendProgress ?? 0).toLocaleString()} / {total.toLocaleString()} (
              {Math.round(((genProgress ?? sendProgress ?? 0) / Math.max(1, total)) * 100)}%)
            </span>
          </div>
          <Progress className="mt-3" value={((genProgress ?? sendProgress ?? 0) / Math.max(1, total)) * 100} />
          <p className="mt-2 text-xs text-muted-foreground">
            Remaining: {(total - (genProgress ?? sendProgress ?? 0)).toLocaleString()}
          </p>
        </div>
      )}

      {allSent && !sending && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-5">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <p className="text-sm font-medium">
            {total.toLocaleString()} / {total.toLocaleString()} certificates generated and sent · 0 failed
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-2xl border bg-card shadow-panel">
          <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4">
            <h2 className="text-sm font-semibold">Recipients</h2>
            <div className="relative ml-auto w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, email, team, ID"
                className="h-9 pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["all", "All"],
                  ["generated", "Generated"],
                  ["pending", "Pending"],
                  ["sent", "Sent"],
                  ["not_sent", "Not sent"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setFilter(key);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    filter === key ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {total === 0 ? (
            <div className="p-14 text-center">
              <p className="font-medium">No recipients yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Add recipients before generating certificates.</p>
              <Button asChild className="mt-4">
                <Link to="/recipients/$id" params={{ id: campaign.id }}>
                  Add recipients
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Certificate ID</TableHead>
                      <TableHead>Generation</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r, i) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {(current - 1) * PAGE_SIZE + i + 1}
                        </TableCell>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-muted-foreground">{r.email}</TableCell>
                        <TableCell>{r.team_name}</TableCell>
                        <TableCell className="text-muted-foreground">{r.organization}</TableCell>
                        <TableCell className="font-mono text-xs">{r.certificate_id}</TableCell>
                        <TableCell>
                          <StatusPill ok={r.generated} okLabel="Generated" pendingLabel="Pending" />
                        </TableCell>
                        <TableCell>
                          <StatusPill ok={r.sent} okLabel="Sent" pendingLabel="Queued" />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setPreviewRecipient(r)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-wrap items-center gap-3 border-t px-5 py-3 text-sm">
                <span className="text-muted-foreground">
                  {filtered.length.toLocaleString()} results · page {current} of {pageCount}
                </span>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={current >= pageCount}
                    onClick={() => setPage(current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <aside className="rounded-2xl border bg-card p-4 shadow-panel">
          <h2 className="text-sm font-semibold">Generated certificate</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {campaign.recipients[0] ? campaign.recipients[0].name : "Sample data"} · identical geometry to the editor.
          </p>
          <div className="mt-3 overflow-hidden rounded-md ring-1 ring-black/10">
            <CertificateCanvas source={campaign} data={campaign.recipients[0]} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {campaign.recipients.slice(1, 5).map((r) => (
              <button
                key={r.id}
                onClick={() => setPreviewRecipient(r)}
                className="overflow-hidden rounded-md ring-1 ring-black/10 transition-transform hover:scale-[1.02]"
              >
                <CertificateCanvas source={campaign} data={r} />
              </button>
            ))}
          </div>
        </aside>
      </div>

      <AlertDialog open={confirmSend} onOpenChange={setConfirmSend}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send certificates to {total.toLocaleString()} recipients?</AlertDialogTitle>
            <AlertDialogDescription>
              This is a demo simulation — no real emails leave the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => runProgress("send")}>Send certificates</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!previewRecipient} onOpenChange={(o) => !o && setPreviewRecipient(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{previewRecipient?.name}</DialogTitle>
            <DialogDescription>
              {previewRecipient?.certificate_id} · {previewRecipient?.email}
            </DialogDescription>
          </DialogHeader>
          {previewRecipient && (
            <div className="overflow-hidden rounded-lg ring-1 ring-black/10">
              <CertificateCanvas source={campaign} data={previewRecipient} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function StatusPill({ ok, okLabel, pendingLabel }: { ok: boolean; okLabel: string; pendingLabel: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        ok ? "bg-success/12 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      {ok ? okLabel : pendingLabel}
    </span>
  );
}

function Stat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone?: "primary" | "success" | "muted";
  icon?: React.ReactNode;
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
