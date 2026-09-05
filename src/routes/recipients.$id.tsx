import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileSpreadsheet, Users, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, StepBar } from "@/components/certificate/AppShell";
import { CertificateCanvas } from "@/components/certificate/CertificateCanvas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { setRecipients, useCampaign } from "@/lib/certs/store";
import { formatDateLong, generateRecipients, parseCsv } from "@/lib/certs/sample";

export const Route = createFileRoute("/recipients/$id")({
  head: () => ({
    meta: [
      { title: "Add Certificate Recipients — CertFlow" },
      {
        name: "description",
        content:
          "Upload a recipient CSV or generate 1,000 realistic demo participants to fill your certificate's dynamic fields.",
      },
      { property: "og:title", content: "Add Certificate Recipients — CertFlow" },
      { property: "og:description", content: "CSV upload or one-click 1,000 demo recipients." },
    ],
  }),
  component: RecipientsPage,
});

function RecipientsPage() {
  const { id } = Route.useParams();
  const campaign = useCampaign(id);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

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

  const defaults = {
    eventName: campaign.eventName || "Brainwave 2026",
    year: "2026",
    date: formatDateLong(new Date(2026, 8, 5)),
    prefix: "BW",
  };

  function makeSample() {
    setBusy(true);
    setTimeout(() => {
      setRecipients(campaign!.id, generateRecipients(1000, defaults));
      setBusy(false);
      toast.success("1,000 demo recipients generated", { description: "Fictional data — no real people." });
    }, 400);
  }

  function onCsv(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result), defaults);
      if (rows.length === 0) {
        toast.error("Could not read that CSV", { description: "Expected a header row and at least one record." });
        return;
      }
      setRecipients(campaign!.id, rows);
      toast.success(`${rows.length.toLocaleString()} recipients imported`);
    };
    reader.readAsText(file);
  }

  const recipients = campaign.recipients;
  const preview = recipients.slice(0, 8);

  return (
    <AppShell>
      <StepBar current={3} />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/editor/$id" params={{ id: campaign.id }}>
            <ArrowLeft className="h-4 w-4" />
            Back to editor
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-bold tracking-tight">Add recipients</h1>
        <Badge variant="secondary">{campaign.name}</Badge>
        <Button
          className="ml-auto"
          disabled={recipients.length === 0}
          onClick={() => navigate({ to: "/campaigns/$id", params: { id: campaign.id } })}
        >
          Continue to generation
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-6 shadow-panel">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">Upload CSV</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Columns: name, email, team_name, organization, event_name, year, date, certificate_id.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => onCsv(e.target.files?.[0])}
              />
              <Button variant="outline" className="mt-5 w-full" onClick={() => fileRef.current?.click()}>
                Choose CSV file
              </Button>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-panel">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20">
                <Wand2 className="h-5 w-5 text-accent-foreground" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">Use sample data</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Creates 1,000 clearly fictional participants for a full end-to-end demo run.
              </p>
              <Button className="mt-5 w-full" onClick={makeSample} disabled={busy}>
                {busy ? "Generating…" : "Generate Sample 1,000 Recipients"}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card shadow-panel">
            <div className="flex items-center gap-3 border-b px-5 py-4">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Recipient data</h2>
              <Badge variant="secondary" className="ml-auto">
                {recipients.length.toLocaleString()} loaded
              </Badge>
            </div>
            {recipients.length === 0 ? (
              <div className="p-14 text-center">
                <p className="font-medium">No recipients yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a CSV or generate the 1,000-person demo list to continue.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Certificate ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.email}</TableCell>
                      <TableCell>{r.team_name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.organization}</TableCell>
                      <TableCell className="font-mono text-xs">{r.certificate_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {recipients.length > preview.length && (
              <p className="border-t px-5 py-3 text-xs text-muted-foreground">
                Showing first {preview.length} of {recipients.length.toLocaleString()} — the full table is on the next
                step.
              </p>
            )}
          </div>
        </div>

        <aside className="rounded-2xl border bg-card p-4 shadow-panel">
          <h2 className="text-sm font-semibold">Live preview</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {recipients[0] ? `Rendered with ${recipients[0].name}'s data.` : "Rendered with sample data."}
          </p>
          <div className="mt-3 overflow-hidden rounded-md ring-1 ring-black/10">
            <CertificateCanvas source={campaign} data={recipients[0]} />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
