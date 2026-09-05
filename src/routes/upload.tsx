import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ImageIcon, Trash2, UploadCloud } from "lucide-react";
import { AppShell, StepBar } from "@/components/certificate/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCampaign } from "@/lib/certs/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Your Certificate Design — CertFlow" },
      {
        name: "description",
        content:
          "Upload a PNG or JPG certificate design and place dynamic name, team, organization and date fields on it visually.",
      },
      { property: "og:title", content: "Upload Your Certificate Design — CertFlow" },
      {
        property: "og:description",
        content: "Your artwork stays untouched — drag dynamic fields on top of it.",
      },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [aspect, setAspect] = useState(1.414);
  const [fileName, setFileName] = useState("");
  const [name, setName] = useState("My Custom Certificate");
  const [eventName, setEventName] = useState("Brainwave 2026");

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!/image\/(png|jpe?g)/.test(file.type)) {
      toast.error("Unsupported file", { description: "Please upload a PNG, JPG or JPEG image." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      const img = new Image();
      img.onload = () => {
        setAspect(img.naturalWidth / img.naturalHeight);
        setImage(url);
        setFileName(file.name);
        toast.success("Design uploaded", {
          description: `${img.naturalWidth} × ${img.naturalHeight}px — aspect ratio preserved.`,
        });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  function proceed() {
    if (!image) return;
    const campaign = createCampaign({
      name,
      eventName,
      templateId: null,
      customImage: image,
      aspect,
      fields: [],
    });
    navigate({ to: "/editor/$id", params: { id: campaign.id } });
  }

  return (
    <AppShell>
      <StepBar current={1} />
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold tracking-tight">Upload your certificate design</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          PNG, JPG or JPEG. Your original design is never modified — dynamic fields are placed on top of it.
        </p>

        {!image ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-card px-6 py-20 text-center transition-colors",
              dragging ? "border-primary bg-primary/5" : "hover:border-primary/50",
            )}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <UploadCloud className="h-7 w-7 text-primary" />
            </span>
            <p className="mt-4 text-base font-semibold">Drag & drop your certificate here</p>
            <p className="mt-1 text-sm text-muted-foreground">or click to browse — PNG, JPG, JPEG up to ~10MB</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="overflow-hidden rounded-2xl border bg-canvas p-4 shadow-panel">
              <img src={image} alt="Uploaded certificate design" className="mx-auto max-h-[420px] w-auto rounded-md shadow" />
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <span className="truncate">{fileName}</span>
                <span className="ml-auto">aspect {aspect.toFixed(3)}</span>
                <Button variant="ghost" size="sm" onClick={() => setImage(null)}>
                  <Trash2 className="h-4 w-4" />
                  Replace
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cname">Event/Campaign Name</Label>
                <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ename">Event name</Label>
                <Input id="ename" value={eventName} onChange={(e) => setEventName(e.target.value)} />
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={proceed}>
              Continue to the visual editor
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
