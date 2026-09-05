import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell, StepBar } from "@/components/certificate/AppShell";
import { CertificateCanvas } from "@/components/certificate/CertificateCanvas";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/certs/templates";
import { SAMPLE_DATA } from "@/lib/certs/types";
import { createCampaign } from "@/lib/certs/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Certificate Templates Gallery — CertFlow" },
      {
        name: "description",
        content:
          "Browse hackathon, winner, internship, workshop and appreciation certificate templates, then open one in the visual editor.",
      },
      { property: "og:title", content: "Certificate Templates Gallery — CertFlow" },
      {
        property: "og:description",
        content: "Professionally designed certificate templates across 11 event categories.",
      },
    ],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () =>
      [...TEMPLATES]
        .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)))
        .filter(
        (t) =>
          (category === "All" || t.category === category) &&
          (t.name.toLowerCase().includes(query.toLowerCase()) ||
            t.category.toLowerCase().includes(query.toLowerCase())),
      ),
    [category, query],
  );

  function select(id: string, name: string) {
    const campaign = createCampaign({
      name: `${name} Campaign`,
      eventName: "Brainwave 2026",
      templateId: id,
    });
    toast.success("Template selected", { description: "Opening the visual editor…" });
    navigate({ to: "/editor/$id", params: { id: campaign.id } });
  }

  return (
    <AppShell>
      <StepBar current={1} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Platform templates</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {TEMPLATES.length} designs across {TEMPLATE_CATEGORIES.length - 1} categories. Fields come pre-positioned
            and stay fully editable.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={
              c === category
                ? "rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground"
                : "rounded-full border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed p-16 text-center text-muted-foreground">
          No templates match that search.
        </div>
      ) : (
        <div className="mt-7 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => (
            <div
              key={t.id}
              className="group overflow-hidden rounded-2xl border bg-card shadow-panel transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="border-b bg-canvas p-4">
                <div className="overflow-hidden rounded-md shadow-sm ring-1 ring-black/5">
                  <CertificateCanvas
                    source={{ templateId: t.id, customImage: null, aspect: t.aspect, fields: t.fields }}
                    data={SAMPLE_DATA}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 p-4">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{t.name}</h3>
                  <Badge variant="secondary" className="mt-1.5">
                    {t.category}
                  </Badge>
                </div>
                <Button className="ml-auto" size="sm" onClick={() => select(t.id, t.name)}>
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
