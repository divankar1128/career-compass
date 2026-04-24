import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Bookmark, Filter, Loader2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { jobsApi, ApiError, type Job, type RecommendedJob } from "@/lib/api";

export const Route = createFileRoute("/jobs")({
  head: () => ({ meta: [{ title: "Jobs — Ascend" }] }),
  component: JobsPage,
});

const filters = ["Recommended", "All", "Remote", "Senior+"] as const;
type FilterKey = (typeof filters)[number];

function formatSalary(j: Job) {
  if (j.salaryMin || j.salaryMax) {
    const min = j.salaryMin ? `$${Math.round(j.salaryMin / 1000)}k` : "";
    const max = j.salaryMax ? `$${Math.round(j.salaryMax / 1000)}k` : "";
    return [min, max].filter(Boolean).join("–") || "Competitive";
  }
  return "Competitive";
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function JobsPage() {
  const [active, setActive] = useState<FilterKey>("Recommended");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Array<{ job: Job; matchScore?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        if (active === "Recommended") {
          const { items } = await jobsApi.recommended();
          if (!cancelled)
            setItems(items.map((r: RecommendedJob) => ({ job: r.job, matchScore: r.matchScore })));
        } else {
          const params: Parameters<typeof jobsApi.list>[0] = { limit: 30 };
          if (search) params.q = search;
          if (active === "Remote") params.remote = true;
          if (active === "Senior+") params.level = "senior";
          const { items } = await jobsApi.list(params);
          if (!cancelled) setItems(items.map((j) => ({ job: j })));
        }
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Could not load jobs");
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, search]);

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Jobs for you</h1>
          <p className="mt-1 text-muted-foreground">Hand-picked roles that match your trajectory.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => active === "Recommended" && setActive("All")}
            className="w-56 rounded-full"
          />
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

      {loading ? (
        <div className="grid h-64 place-items-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <GlassCard className="text-center">
          <p className="text-sm text-muted-foreground">
            No jobs found. Try a different filter or seed jobs in the backend.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map(({ job, matchScore }, i) => {
            const isSaved = saved.includes(job._id);
            const logo = job.company.charAt(0).toUpperCase();
            const match = matchScore ?? 0;
            return (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <GlassCard delay={0} className="group relative h-full">
                  <button
                    onClick={() => {
                      setSaved((p) => (isSaved ? p.filter((x) => x !== job._id) : [...p, job._id]));
                      toast.success(isSaved ? "Removed from saved" : "Saved to your list");
                    }}
                    className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={isSaved ? "Unsave" : "Save"}
                  >
                    <Bookmark className={cn("h-4 w-4", isSaved && "fill-primary text-primary")} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-lg font-bold text-primary-foreground shadow-glow">
                      {logo}
                    </div>
                    <div>
                      <div className="font-semibold">{job.company}</div>
                      <div className="text-xs text-muted-foreground">{timeAgo(job.postedAt)}</div>
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold leading-snug">{job.title}</h3>
                  <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location || (job.remote ? "Remote" : "—")}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      {formatSalary(job)}
                    </div>
                  </div>
                  {job.tags && job.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.tags.slice(0, 4).map((t) => (
                        <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex items-center justify-between">
                    {matchScore !== undefined ? (
                      <div className="flex items-center gap-2">
                        <div className="relative h-9 w-9">
                          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r="15"
                              fill="none"
                              stroke="oklch(0.5 0.02 270 / 0.2)"
                              strokeWidth="3"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="15"
                              fill="none"
                              stroke="oklch(0.72 0.2 295)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={`${(match / 100) * 94.2} 94.2`}
                            />
                          </svg>
                          <div className="absolute inset-0 grid place-items-center text-[10px] font-bold">
                            {match}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">match</span>
                      </div>
                    ) : (
                      <span />
                    )}
                    <Button
                      size="sm"
                      asChild
                      className="rounded-full gradient-primary text-primary-foreground shadow-glow"
                    >
                      <a
                        href={job.applyUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Apply <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
