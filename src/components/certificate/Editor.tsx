import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Copy,
  Eye,
  ImagePlus,
  Italic,
  Plus,
  RotateCw,
  Trash2,
  Type,
  Underline,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, StepBar } from "@/components/certificate/AppShell";
import { CertificateCanvas } from "@/components/certificate/CertificateCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSnapshot, updateCampaign, useCampaign } from "@/lib/certs/store";
import {
  FIELD_LIBRARY,
  FONT_OPTIONS,
  SAMPLE_DATA,
  TEST_VALUE_SETS,
  type CertField,
  type CertLogo,
} from "@/lib/certs/types";
import { cn } from "@/lib/utils";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function currentLogos(campaignId: string) {
  return getSnapshot().campaigns.find((c) => c.id === campaignId)?.logos ?? [];
}

function newField(partial: Partial<CertField>): CertField {
  return {
    id: `f-${Math.random().toString(36).slice(2, 9)}`,
    label: "Text",
    variable: "",
    content: "Text",
    x: 0.3,
    y: 0.45,
    w: 0.4,
    h: 0.1,
    fontFamily: "Inter",
    fontSize: 0.05,
    fontWeight: 600,
    italic: false,
    underline: false,
    uppercase: false,
    align: "center",
    vAlign: "middle",
    autoFit: true,
    minFontScale: 0.35,
    color: "#1f2937",
    letterSpacing: 0,
    lineHeight: 1.2,
    rotation: 0,
    opacity: 1,
    ...partial,
  };
}

type Box = { x: number; y: number; w: number; h: number; rotation: number };
type DragMode = {
  kind: "move" | "resize" | "rotate";
  target: "field" | "logo";
  id: string;
  startX: number;
  startY: number;
  box: Box;
};

export function CertificateEditor({ id }: { id: string }) {
  const campaign = useCampaign(id);
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("University");
  const [testSet, setTestSet] = useState(1);
  const previewData = { ...SAMPLE_DATA, ...(TEST_VALUE_SETS[testSet]?.data ?? {}) };
  const drag = useRef<DragMode | null>(null);
  const canvasSize = useRef({ width: 1, height: 1 });

  const fields = campaign?.fields ?? [];
  const logos = campaign?.logos ?? [];
  const selected = fields.find((f) => f.id === selectedId) ?? null;
  const selectedLogo = logos.find((l) => l.id === selectedLogoId) ?? null;

  const patchLogo = useCallback(
    (lid: string, patch: Partial<CertLogo>) => {
      if (!campaign) return;
      updateCampaign(campaign.id, {
        logos: (campaign.logos ?? []).map((l) => (l.id === lid ? { ...l, ...patch } : l)),
      });
    },
    [campaign],
  );

  const removeLogo = useCallback(
    (lid: string) => {
      if (!campaign) return;
      updateCampaign(campaign.id, { logos: (campaign.logos ?? []).filter((l) => l.id !== lid) });
      setSelectedLogoId(null);
    },
    [campaign],
  );


  const patchField = useCallback(
    (fid: string, patch: Partial<CertField>) => {
      if (!campaign) return;
      updateCampaign(campaign.id, {
        fields: campaign.fields.map((f) => (f.id === fid ? { ...f, ...patch } : f)),
      });
    },
    [campaign],
  );

  const addField = useCallback(
    (f: CertField) => {
      if (!campaign) return;
      updateCampaign(campaign.id, { fields: [...campaign.fields, f] });
      setSelectedId(f.id);
    },
    [campaign],
  );

  const removeField = useCallback(
    (fid: string) => {
      if (!campaign) return;
      updateCampaign(campaign.id, { fields: campaign.fields.filter((f) => f.id !== fid) });
      setSelectedId(null);
    },
    [campaign],
  );

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const d = drag.current;
      if (!d) return;
      const { width, height } = canvasSize.current;
      const dx = (e.clientX - d.startX) / width;
      const dy = (e.clientY - d.startY) / height;
      const apply = (patch: Partial<Box>) =>
        d.target === "field" ? patchField(d.id, patch) : patchLogo(d.id, patch);
      if (d.kind === "move") {
        apply({
          x: clamp(d.box.x + dx, -0.2, 1.2),
          y: clamp(d.box.y + dy, -0.2, 1.2),
        });
      } else if (d.kind === "resize") {
        apply({
          w: clamp(d.box.w + dx, 0.02, 1.6),
          h: clamp(d.box.h + dy, 0.02, 1.2),
        });
      } else {
        const cx = (d.box.x + d.box.w / 2) * width;
        const cy = (d.box.y + d.box.h / 2) * height;
        const rect = canvasRectRef.current;
        if (!rect) return;
        const angle =
          (Math.atan2(e.clientY - rect.top - cy, e.clientX - rect.left - cx) * 180) / Math.PI + 90;
        apply({ rotation: Math.round(angle) });
      }
    }
    function onUp() {
      drag.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [patchField, patchLogo]);

  const canvasRectRef = useRef<DOMRect | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const item = selectedLogo ?? selected;
      if (!item) return;
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable) return;
      const step = e.shiftKey ? 0.02 : 0.002;
      const apply = (patch: Partial<Box>) =>
        selectedLogo ? patchLogo(item.id, patch) : patchField(item.id, patch);
      if (e.key === "ArrowLeft") apply({ x: item.x - step });
      else if (e.key === "ArrowRight") apply({ x: item.x + step });
      else if (e.key === "ArrowUp") apply({ y: item.y - step });
      else if (e.key === "ArrowDown") apply({ y: item.y + step });
      else if (e.key === "Delete" || e.key === "Backspace")
        selectedLogo ? removeLogo(item.id) : removeField(item.id);
      else return;
      e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, selectedLogo, patchField, patchLogo, removeField, removeLogo]);

  if (!campaign) {
    return (
      <AppShell wide>
        <div className="rounded-2xl border border-dashed p-16 text-center">
          <p className="text-muted-foreground">This campaign no longer exists.</p>
          <Button asChild className="mt-4">
            <Link to="/">Back to dashboard</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const used = new Set(fields.map((f) => f.variable).filter(Boolean));

  function startDrag(kind: DragMode["kind"], field: CertField, e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    canvasRectRef.current = canvasWrapRef.current?.getBoundingClientRect() ?? null;
    setSelectedId(field.id);
    setSelectedLogoId(null);
    drag.current = {
      kind,
      target: "field",
      id: field.id,
      startX: e.clientX,
      startY: e.clientY,
      box: { x: field.x, y: field.y, w: field.w, h: field.h, rotation: field.rotation },
    };
  }

  function startLogoDrag(kind: DragMode["kind"], logo: CertLogo, e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    canvasRectRef.current = canvasWrapRef.current?.getBoundingClientRect() ?? null;
    setSelectedLogoId(logo.id);
    setSelectedId(null);
    drag.current = {
      kind,
      target: "logo",
      id: logo.id,
      startX: e.clientX,
      startY: e.clientY,
      box: { x: logo.x, y: logo.y, w: logo.w, h: logo.h, rotation: logo.rotation },
    };
  }

  function handleLogoFiles(files: FileList | null) {
    if (!files || !campaign) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      toast.error("Please choose PNG, JPG or SVG image files.");
      return;
    }
    let placed = 0;
    list.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const src = String(reader.result ?? "");
        if (!src) return;
        const img = new Image();
        const finish = (ratio: number) => {
          const existing = currentLogos(campaign.id).length;
          const h = 0.14;
          const w = (h * ratio) / (campaign.aspect || 1.414);
          const logo: CertLogo = {
            id: `logo-${Math.random().toString(36).slice(2, 9)}`,
            name: file.name.replace(/\.[^.]+$/, ""),
            src,
            x: clamp(0.06 + ((existing + idx) % 4) * 0.2, 0, 0.9),
            y: 0.06,
            w: clamp(w, 0.05, 0.5),
            h,
            rotation: 0,
            opacity: 1,
            fit: "contain",
          };
          updateCampaign(campaign.id, { logos: [...currentLogos(campaign.id), logo] });
          setSelectedLogoId(logo.id);
          setSelectedId(null);
          placed += 1;
          if (placed === list.length)
            toast.success(placed === 1 ? "Logo added" : `${placed} logos added`, {
              description: "Drag to position, use the corner handle to resize.",
            });
        };
        img.onload = () => finish(img.naturalWidth / Math.max(1, img.naturalHeight));
        img.onerror = () => finish(1);
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  }

  function addVariable(v: { label: string; variable: string; placeholder?: string }) {
    addField(
      newField({
        label: v.label,
        variable: v.variable,
        content: `{{${v.variable}}}`,
        placeholder: v.placeholder ?? `${v.label} Here`,
        y: 0.4 + (fields.length % 5) * 0.06,
        fontSize: v.variable === "name" ? 0.085 : 0.035,
        fontWeight: v.variable === "name" ? 700 : 500,
      }),
    );
    toast.success(`${v.label} added`, { description: "Drag it into position on the certificate." });
  }

  return (
    <AppShell wide>
      <StepBar current={2} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/create">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <Input
          value={campaign.name}
          onChange={(e) => updateCampaign(campaign.id, { name: e.target.value })}
          className="h-9 w-[320px] font-semibold"
        />
        <Badge variant="secondary">{campaign.customImage ? "Custom upload" : "Platform template"}</Badge>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4" />
            Preview Certificate
          </Button>
          <Button onClick={() => navigate({ to: "/recipients/$id", params: { id: campaign.id } })}>
            Save & add recipients
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)_310px]">
        {/* LEFT — field library */}
        <aside className="rounded-2xl border bg-card shadow-panel">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Dynamic fields</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Click to place, then drag on the canvas.</p>
          </div>
          <div className="h-[300px] overflow-y-auto xl:h-[430px]">
            <div className="space-y-1.5 p-3">
              {FIELD_LIBRARY.map((v) => (
                <button
                  key={v.variable}
                  onClick={() => addVariable(v)}
                  className="flex w-full items-center gap-3 rounded-lg border bg-background px-3 py-2 text-left transition-colors hover:border-primary/50 hover:bg-secondary"
                >
                  <Type className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{v.label}</span>
                    <span className="block truncate font-mono text-[11px] text-primary/80">
                      {`{{${v.variable}}}`}
                    </span>
                    {v.description && (
                      <span className="block truncate text-[11px] text-muted-foreground">{v.description}</span>
                    )}
                  </span>
                  {used.has(v.variable) ? (
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      placed
                    </Badge>
                  ) : (
                    <Plus className="ml-auto h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t p-3">
            <Button variant="outline" className="w-full" onClick={() => setCustomOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Text Field
            </Button>
          </div>
          <div className="border-t p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Organization logos
            </h3>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                handleLogoFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <Button variant="outline" className="w-full" onClick={() => logoInputRef.current?.click()}>
              <ImagePlus className="h-4 w-4" />
              Upload logo(s)
            </Button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              PNG, JPG or SVG. Add as many as you need — drag each one anywhere on the certificate.
            </p>
            <div className="mt-2 space-y-1">
              {logos.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setSelectedLogoId(l.id);
                    setSelectedId(null);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs",
                    selectedLogoId === l.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                >
                  <img src={l.src} alt="" className="h-6 w-6 shrink-0 rounded bg-white object-contain" />
                  <span className="truncate">{l.name || "Logo"}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="border-t px-4 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Layers</h3>
            <div className="mt-2 space-y-1">
              {fields.length === 0 && <p className="text-xs text-muted-foreground">No fields placed yet.</p>}
              {fields.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedId(f.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs",
                    selectedId === f.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                >
                  <span className="truncate">{f.label}</span>
                  <span className="ml-auto opacity-70">
                    {Math.round(f.x * 100)}%, {Math.round(f.y * 100)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER — canvas */}
        <section className="rounded-2xl border bg-canvas p-4 shadow-panel sm:p-8">
          <div className="mx-auto mb-3 flex max-w-4xl flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Test with sample values:</span>
            {TEST_VALUE_SETS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setTestSet(i)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  testSet === i ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div ref={canvasWrapRef} className="mx-auto max-w-4xl shadow-lift ring-1 ring-black/10">
            <CertificateCanvas
              source={campaign}
              data={previewData}
              overlay={({ width, height }) => {
                canvasSize.current = { width, height };
                return (
                  <div
                    className="absolute inset-0"
                    onPointerDown={() => {
                      setSelectedId(null);
                      setSelectedLogoId(null);
                    }}
                  >
                    {logos.map((l) => {
                      const active = l.id === selectedLogoId;
                      return (
                        <div
                          key={l.id}
                          onPointerDown={(e) => startLogoDrag("move", l, e)}
                          className={cn(
                            "absolute cursor-move border transition-colors",
                            active ? "border-primary" : "border-transparent hover:border-primary/40",
                          )}
                          style={{
                            left: l.x * width,
                            top: l.y * height,
                            width: l.w * width,
                            height: l.h * height,
                            transform: `rotate(${l.rotation}deg)`,
                            transformOrigin: "center center",
                          }}
                        >
                          {active && (
                            <>
                              <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                                {l.name || "Logo"}
                              </span>
                              <span
                                className="absolute -bottom-1 -right-1 h-3 w-3 cursor-nwse-resize rounded-sm border-2 border-primary bg-card"
                                onPointerDown={(e) => startLogoDrag("resize", l, e)}
                              />
                              <span
                                className="absolute -top-7 left-1/2 flex h-5 w-5 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border border-primary bg-card"
                                onPointerDown={(e) => startLogoDrag("rotate", l, e)}
                              >
                                <RotateCw className="h-3 w-3 text-primary" />
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })}
                    {fields.map((f) => {
                      const active = f.id === selectedId;
                      return (
                        <div
                          key={f.id}
                          onPointerDown={(e) => startDrag("move", f, e)}
                          className={cn(
                            "absolute cursor-move border transition-colors",
                            active ? "border-primary" : "border-transparent hover:border-primary/40",
                          )}
                          style={{
                            left: f.x * width,
                            top: f.y * height,
                            width: f.w * width,
                            height: f.h * height,
                            transform: `rotate(${f.rotation}deg)`,
                            transformOrigin: "center center",
                            backgroundColor: active ? "color-mix(in oklab, var(--primary) 8%, transparent)" : undefined,
                          }}
                        >
                          {active && (
                            <>
                              <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                                {f.label}
                              </span>
                              {[
                                ["-left-1 -top-1", "nwse-resize"],
                                ["-right-1 -top-1", "nesw-resize"],
                                ["-left-1 -bottom-1", "nesw-resize"],
                              ].map(([pos, cur]) => (
                                <span
                                  key={pos}
                                  className={cn("absolute h-2.5 w-2.5 rounded-sm border border-primary bg-card", pos)}
                                  style={{ cursor: cur }}
                                  onPointerDown={(e) => startDrag("resize", f, e)}
                                />
                              ))}
                              <span
                                className="absolute -bottom-1 -right-1 h-3 w-3 cursor-nwse-resize rounded-sm border-2 border-primary bg-card"
                                onPointerDown={(e) => startDrag("resize", f, e)}
                              />
                              <span
                                className="absolute -top-7 left-1/2 flex h-5 w-5 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border border-primary bg-card"
                                onPointerDown={(e) => startDrag("rotate", f, e)}
                              >
                                <RotateCw className="h-3 w-3 text-primary" />
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
          </div>
          <p className="mx-auto mt-4 max-w-4xl text-center text-xs text-muted-foreground">
            Positions are stored as normalized coordinates (0–1), so what you see here is exactly what gets generated —
            at any output resolution. Arrow keys nudge, Shift + arrows move faster.
          </p>
        </section>

        {/* RIGHT — properties */}
        <aside className="rounded-2xl border bg-card shadow-panel">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Properties</h2>
          </div>
          {selectedLogo ? (
            <div className="h-[560px] overflow-y-auto">
              <div className="space-y-5 p-4">
                <div className="rounded-lg border bg-secondary/40 p-3">
                  <img
                    src={selectedLogo.src}
                    alt={selectedLogo.name}
                    className="mx-auto h-20 w-full rounded bg-white object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo name</Label>
                  <Input
                    value={selectedLogo.name}
                    onChange={(e) => patchLogo(selectedLogo.id, { name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <NumberBox label="X %" value={selectedLogo.x * 100} onChange={(v) => patchLogo(selectedLogo.id, { x: v / 100 })} />
                  <NumberBox label="Y %" value={selectedLogo.y * 100} onChange={(v) => patchLogo(selectedLogo.id, { y: v / 100 })} />
                  <NumberBox label="Width %" value={selectedLogo.w * 100} onChange={(v) => patchLogo(selectedLogo.id, { w: v / 100 })} />
                  <NumberBox label="Height %" value={selectedLogo.h * 100} onChange={(v) => patchLogo(selectedLogo.id, { h: v / 100 })} />
                </div>
                <Separator />
                <SliderRow
                  label="Rotation"
                  value={selectedLogo.rotation}
                  min={-180}
                  max={180}
                  step={1}
                  suffix="°"
                  onChange={(v) => patchLogo(selectedLogo.id, { rotation: v })}
                />
                <SliderRow
                  label="Opacity"
                  value={selectedLogo.opacity * 100}
                  min={10}
                  max={100}
                  step={1}
                  suffix="%"
                  onChange={(v) => patchLogo(selectedLogo.id, { opacity: v / 100 })}
                />
                <div className="space-y-2">
                  <Label>Fit inside box</Label>
                  <div className="flex gap-2">
                    {(["contain", "cover", "fill"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => patchLogo(selectedLogo.id, { fit: f })}
                        className={cn(
                          "flex-1 rounded-md border px-2 py-1.5 text-xs capitalize transition-colors",
                          selectedLogo.fit === f
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:bg-secondary",
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    “Contain” keeps the logo’s original proportions inside the box you drew.
                  </p>
                </div>
                <Separator />
                <Button variant="destructive" className="w-full" onClick={() => removeLogo(selectedLogo.id)}>
                  <Trash2 className="h-4 w-4" />
                  Remove logo
                </Button>
              </div>
            </div>
          ) : !selected ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Select a field or logo on the certificate to edit it.
            </div>
          ) : (
            <div className="h-[560px] overflow-y-auto">
              <div className="space-y-5 p-4">
                <div className="space-y-2">
                  <Label>Field label</Label>
                  <Input value={selected.label} onChange={(e) => patchField(selected.id, { label: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={selected.content}
                    rows={3}
                    spellCheck={false}
                    onChange={(e) => patchField(selected.id, { content: e.target.value })}
                    className="min-h-20 resize-y whitespace-pre-wrap break-words font-mono text-sm leading-relaxed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Drag the bottom-right corner to enlarge this box and see your whole text. Use tokens like{" "}
                    <span className="font-mono">{"{{name}}"}</span> — they are replaced per recipient.
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <NumberBox label="X %" value={selected.x * 100} onChange={(v) => patchField(selected.id, { x: v / 100 })} />
                  <NumberBox label="Y %" value={selected.y * 100} onChange={(v) => patchField(selected.id, { y: v / 100 })} />
                  <NumberBox label="Width %" value={selected.w * 100} onChange={(v) => patchField(selected.id, { w: v / 100 })} />
                  <NumberBox label="Height %" value={selected.h * 100} onChange={(v) => patchField(selected.id, { h: v / 100 })} />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Font</Label>
                  <Select value={selected.fontFamily} onValueChange={(v) => patchField(selected.id, { fontFamily: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f} style={{ fontFamily: `"${f}", sans-serif` }}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <SliderRow
                  label="Font size"
                  value={Math.round(selected.fontSize * 1000)}
                  min={8}
                  max={200}
                  step={1}
                  suffix="pt"
                  onChange={(v) => {
                    const fontSize = v / 1000;
                    // keep the allocated box tall/wide enough so the chosen size is
                    // actually visible instead of being shrunk away by auto-fit
                    const needH = Math.min(fontSize * (selected.lineHeight || 1.2) * 1.35, 1 - selected.y);
                    patchField(selected.id, {
                      fontSize,
                      h: Math.max(selected.h, needH),
                    });
                  }}
                />

                <SliderRow
                  label="Weight"
                  value={selected.fontWeight}
                  min={100}
                  max={900}
                  step={100}
                  onChange={(v) => patchField(selected.id, { fontWeight: v })}
                />
                <SliderRow
                  label="Letter spacing"
                  value={selected.letterSpacing * 100}
                  min={-10}
                  max={40}
                  step={1}
                  suffix="/100em"
                  onChange={(v) => patchField(selected.id, { letterSpacing: v / 100 })}
                />
                <SliderRow
                  label="Line height"
                  value={selected.lineHeight * 100}
                  min={80}
                  max={250}
                  step={5}
                  suffix="%"
                  onChange={(v) => patchField(selected.id, { lineHeight: v / 100 })}
                />
                <SliderRow
                  label="Rotation"
                  value={selected.rotation}
                  min={-180}
                  max={180}
                  step={1}
                  suffix="°"
                  onChange={(v) => patchField(selected.id, { rotation: v })}
                />
                <SliderRow
                  label="Opacity"
                  value={selected.opacity * 100}
                  min={10}
                  max={100}
                  step={1}
                  suffix="%"
                  onChange={(v) => patchField(selected.id, { opacity: v / 100 })}
                />

                <Separator />

                <div className="flex flex-wrap gap-2">
                  <ToggleBtn
                    active={selected.fontWeight >= 700}
                    onClick={() => patchField(selected.id, { fontWeight: selected.fontWeight >= 700 ? 400 : 700 })}
                  >
                    <Bold className="h-4 w-4" />
                  </ToggleBtn>
                  <ToggleBtn active={selected.italic} onClick={() => patchField(selected.id, { italic: !selected.italic })}>
                    <Italic className="h-4 w-4" />
                  </ToggleBtn>
                  <ToggleBtn
                    active={selected.underline}
                    onClick={() => patchField(selected.id, { underline: !selected.underline })}
                  >
                    <Underline className="h-4 w-4" />
                  </ToggleBtn>
                  <ToggleBtn
                    active={selected.uppercase}
                    onClick={() => patchField(selected.id, { uppercase: !selected.uppercase })}
                  >
                    <span className="text-xs font-semibold">AA</span>
                  </ToggleBtn>
                  <span className="mx-1 w-px bg-border" />
                  {(["left", "center", "right", "justify"] as const).map((a) => (
                    <ToggleBtn key={a} active={selected.align === a} onClick={() => patchField(selected.id, { align: a })}>
                      {a === "left" ? (
                        <AlignLeft className="h-4 w-4" />
                      ) : a === "center" ? (
                        <AlignCenter className="h-4 w-4" />
                      ) : a === "right" ? (
                        <AlignRight className="h-4 w-4" />
                      ) : (
                        <AlignJustify className="h-4 w-4" />
                      )}
                    </ToggleBtn>
                  ))}
                  <span className="mx-1 w-px bg-border" />
                  {(["top", "middle", "bottom"] as const).map((v) => (
                    <ToggleBtn
                      key={v}
                      active={(selected.vAlign ?? "middle") === v}
                      onClick={() => patchField(selected.id, { vAlign: v })}
                    >
                      <span className="text-[10px] font-semibold uppercase">
                        {v === "top" ? "T" : v === "middle" ? "M" : "B"}
                      </span>
                    </ToggleBtn>
                  ))}
                </div>

                <Separator />

                <div className="rounded-lg border bg-secondary/40 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs">Auto-fit text to box</Label>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Long values shrink (then wrap) inside this fixed area.
                      </p>
                    </div>
                    <ToggleBtn
                      active={selected.autoFit !== false}
                      onClick={() => patchField(selected.id, { autoFit: selected.autoFit === false })}
                    >
                      <span className="text-[10px] font-semibold">FIT</span>
                    </ToggleBtn>
                  </div>
                  <div className="mt-3">
                    <SliderRow
                      label="Minimum size"
                      value={(selected.minFontScale ?? 0.35) * 100}
                      min={20}
                      max={100}
                      step={5}
                      suffix="% of font size"
                      onChange={(v) => patchField(selected.id, { minFontScale: v / 100 })}
                    />
                  </div>
                </div>


                <div className="space-y-2">
                  <Label>Text colour</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selected.color}
                      onChange={(e) => patchField(selected.id, { color: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded border bg-background"
                    />
                    <Input value={selected.color} onChange={(e) => patchField(selected.id, { color: e.target.value })} />
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      addField(
                        newField({
                          ...selected,
                          id: `f-${Math.random().toString(36).slice(2, 9)}`,
                          x: selected.x + 0.03,
                          y: selected.y + 0.05,
                        }),
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => removeField(selected.id)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Certificate preview</DialogTitle>
            <DialogDescription>
              Rendered with the “{TEST_VALUE_SETS[testSet]?.label}” sample values — exactly the same fitting logic used
              for every generated certificate.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-2 flex flex-wrap gap-2">
            {TEST_VALUE_SETS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setTestSet(i)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  testSet === i ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-lg ring-1 ring-black/10">
            <CertificateCanvas source={campaign} data={previewData} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Keep editing
            </Button>
            <Button onClick={() => navigate({ to: "/recipients/$id", params: { id: campaign.id } })}>
              Looks good — add recipients
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom field */}
      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a custom text field</DialogTitle>
            <DialogDescription>
              Give it a name — we create a matching variable you can map from your CSV.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Field name</Label>
            <Input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="University" />
            <p className="text-xs text-muted-foreground">
              Variable: <span className="font-mono">{`{{${slugify(customLabel) || "custom_field"}}}`}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const variable = slugify(customLabel) || "custom_field";
                addField(
                  newField({
                    label: customLabel || "Custom field",
                    variable,
                    content: `{{${variable}}}`,
                    placeholder: `${customLabel || "Custom field"} Here`,
                    fontSize: 0.035,
                  }),
                );
                setCustomOpen(false);
                toast.success("Custom field added");
              }}
            >
              Add field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}

function NumberBox({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        value={Number(value.toFixed(1))}
        step={0.5}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8"
      />
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {Math.round(value)}
          {suffix ?? ""}
        </span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(vals) => onChange(vals[0] ?? value)} />
    </div>
  );
}
