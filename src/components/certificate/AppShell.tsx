import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutDashboard, Plus, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import unstopLogo from "@/assets/unstop-logo.jpg.asset.json";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/templates", label: "Templates", icon: Sparkles },
] as const;

export function AppShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHomePage = pathname === "/";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background">
        <div className={cn("mx-auto flex h-16 items-center gap-6 px-5", wide ? "max-w-[1920px]" : "w-full")}>
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={unstopLogo.url}
              alt="Unstop"
              className="h-9 w-auto object-contain"
            />
            <span className="text-[17px] font-semibold tracking-tight">Certificate Generator</span>
          </Link>
          {isHomePage ? (
            <>
              <nav className="hidden items-center gap-1 sm:flex">
                {NAV.map((item) => {
                  const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="ml-auto flex items-center gap-3">
                <Button asChild size="sm">
                  <Link to="/create">
                    <Plus className="h-4 w-4" />
                    Create Certificate
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="ml-auto flex items-center gap-3">
              <Button asChild size="sm">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>
            </div>
          )}
        </div>
      </header>
      <main className={cn("mx-auto w-full px-5 py-8", wide ? "max-w-[1920px]" : "w-full")}>{children}</main>
    </div>
  );
}

export function StepBar({ current }: { current: 1 | 2 | 3 | 4 }) {
  const steps = ["Design source", "Certificate editor", "Recipients", "Generate & send"];
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={s} className="flex items-center gap-3">
            <span
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5",
                active && "border-primary bg-primary text-primary-foreground",
                done && "border-success/40 bg-success/10 text-success",
                !active && !done && "text-muted-foreground",
              )}
            >
              <span className="text-xs font-semibold">{n}</span>
              <span className="font-medium">{s}</span>
            </span>
            {i < steps.length - 1 && <span className="hidden h-px w-6 bg-border sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}
