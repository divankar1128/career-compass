import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Bookmark, Filter } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { jobs } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [{ title: "Jobs — Ascend" }] }),
  component: JobsPage,
});

const filters = ["All", "Remote", "Full-time", "Senior+", "Top match"];

function JobsPage() {
  const [active, setActive] = useState("All");
  const [saved, setSaved] = useState<number[]>([]);

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Jobs for you</h1>
          <p className="mt-1 text-muted-foreground">Hand-picked roles that match your trajectory.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Filter by company..." className="w-56 rounded-full" />
          <Button variant="outline" size="icon" className="rounded-full">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
              active === f
                ? "border-primary gradient-primary text-primary-foreground shadow-glow"
                : "border-border hover:border-primary/40",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobs.map((j, i) => {
          const isSaved = saved.includes(j.id);
          return (
            <motion.div
              key={j.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard delay={0} className="group relative h-full">
                <button
                  onClick={() => {
                    setSaved((p) => (isSaved ? p.filter((x) => x !== j.id) : [...p, j.id]));
                    toast.success(isSaved ? "Removed from saved" : "Saved to your list");
                  }}
                  className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Bookmark className={cn("h-4 w-4", isSaved && "fill-primary text-primary")} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-lg font-bold text-primary-foreground shadow-glow">
                    {j.logo}
                  </div>
                  <div>
                    <div className="font-semibold">{j.company}</div>
                    <div className="text-xs text-muted-foreground">{j.posted}</div>
                  </div>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold leading-snug">{j.title}</h3>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {j.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" /> {j.salary}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {j.tags.map((t) => (
                    <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative h-9 w-9">
                      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="oklch(0.5 0.02 270 / 0.2)" strokeWidth="3" />
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="oklch(0.72 0.2 295)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${(j.match / 100) * 94.2} 94.2`}
                        />
                      </svg>
                      <div className="absolute inset-0 grid place-items-center text-[10px] font-bold">{j.match}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">match</span>
                  </div>
                  <Button size="sm" className="rounded-full gradient-primary text-primary-foreground shadow-glow">
                    Apply
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </AppShell>
  );
}
