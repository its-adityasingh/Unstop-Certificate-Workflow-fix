import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LayoutTemplate, Upload } from "lucide-react";
import { AppShell, StepBar } from "@/components/certificate/AppShell";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a Certificate Campaign — CertFlow" },
      {
        name: "description",
        content:
          "Start a new certificate campaign: pick a professionally designed platform template or upload your own PNG or JPG certificate design.",
      },
      { property: "og:title", content: "Create a Certificate Campaign — CertFlow" },
      {
        property: "og:description",
        content: "Pick a platform template or upload your own certificate artwork to begin.",
      },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  return (
    <AppShell>
      <StepBar current={1} />
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight">Create a certificate</h1>
        <p className="mt-3 text-muted-foreground">
          Choose how you want to start. You can position dynamic fields visually in the next step either way.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        <OptionCard
          to="/templates"
          icon={<LayoutTemplate className="h-6 w-6" />}
          eyebrow="Option 1"
          title="Use Platform Template"
          description="Choose from professionally designed certificate templates."
          bullets={["12 ready-made designs", "11 event categories", "Fields pre-positioned for you"]}
        />
        <OptionCard
          to="/upload"
          icon={<Upload className="h-6 w-6" />}
          eyebrow="Option 2"
          title="Upload Your Own Design"
          description="Upload your PNG or JPG certificate design and customize it with dynamic fields."
          bullets={["PNG, JPG and JPEG", "Original artwork untouched", "Drag fields anywhere on it"]}
          accent
        />
      </div>
    </AppShell>
  );
}

function OptionCard({
  to,
  icon,
  eyebrow,
  title,
  description,
  bullets,
  accent,
}: {
  to: "/templates" | "/upload";
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  accent?: boolean;
}) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col rounded-2xl border bg-card p-7 text-left shadow-panel transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
    >
      <span
        className={
          accent
            ? "flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground"
            : "flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
        }
      >
        {icon}
      </span>
      <span className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{eyebrow}</span>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
        {bullets.map((b) => (
          <li key={b} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {b}
          </li>
        ))}
      </ul>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        Continue
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
