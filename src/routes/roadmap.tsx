import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/glass-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { roadmapApi, ApiError, type Roadmap, type RoadmapItem } from "@/lib/api";

export const Route = createFileRoute("/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — Ascend" }] }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { roadmap } = await roadmapApi.get();
        if (!cancelled) setRoadmap(roadmap);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Could not load roadmap");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const { roadmap } = await roadmapApi.generate();
      setRoadmap(roadmap);
      toast.success("Roadmap generated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const toggle = async (item: RoadmapItem) => {
    // optimistic
    setRoadmap((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) => (i._id === item._id ? { ...i, done: !i.done } : i)),
          }
        : prev,
    );
    try {
      const { roadmap: fresh } = await roadmapApi.toggleItem(item._id, !item.done);
      setRoadmap(fresh);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed");
      // revert
      setRoadmap((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) => (i._id === item._id ? { ...i, done: item.done } : i)),
            }
          : prev,
      );
    }
  };

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Your roadmap</h1>
          <p className="mt-1 text-muted-foreground">
            A 12-week plan tailored to your goals. Adapts as you grow.
          </p>
          {roadmap && (
            <div className="mt-3 max-w-md">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Overall progress</span>
                <span className="font-medium text-foreground">
                  {Math.round((roadmap.progress ?? 0) * 100)}%
                </span>
              </div>
              <Progress value={(roadmap.progress ?? 0) * 100} className="h-2" />
            </div>
          )}
        </div>
        <Button
          onClick={generate}
          disabled={generating}
          className="rounded-full gradient-primary text-primary-foreground shadow-glow"
        >
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {roadmap ? "Regenerate plan" : "Generate plan"}
        </Button>
      </div>

      {loading ? (
        <div className="grid h-64 place-items-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : !roadmap || roadmap.items.length === 0 ? (
        <GlassCard className="text-center">
          <Sparkles className="mx-auto h-10 w-10 text-primary" />
          <h3 className="mt-4 font-display text-xl font-semibold">No roadmap yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a 12-week plan personalized to your goals.
          </p>
          <Button
            onClick={generate}
            disabled={generating}
            className="mt-6 rounded-full gradient-primary text-primary-foreground shadow-glow"
          >
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate my roadmap
          </Button>
        </GlassCard>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-border to-transparent lg:left-1/2" />
          <div className="space-y-6">
            {roadmap.items.map((item, i) => {
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "relative flex gap-6 lg:items-center",
                    left ? "lg:flex-row" : "lg:flex-row-reverse",
                  )}
                >
                  <div className="absolute left-6 z-10 -translate-x-1/2 lg:left-1/2">
                    <button
                      type="button"
                      onClick={() => toggle(item)}
                      className={cn(
                        "grid h-12 w-12 place-items-center rounded-full border-4 border-background transition-transform hover:scale-110",
                        item.done ? "gradient-primary shadow-glow" : "bg-muted",
                      )}
                      aria-label={item.done ? "Mark incomplete" : "Mark complete"}
                    >
                      {item.done ? (
                        <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <div className="hidden flex-1 lg:block" />
                  <GlassCard
                    delay={0}
                    hover={false}
                    className={cn("ml-16 flex-1 lg:ml-0", item.done && "opacity-70")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Week {item.week} · {item.category}
                        </div>
                        <h3 className="mt-1 font-display text-xl font-semibold">{item.title}</h3>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                          item.done
                            ? "bg-success/15 text-success"
                            : "bg-primary/15 text-primary",
                        )}
                      >
                        {item.done ? "Done" : "Active"}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                    )}
                    {item.resources && item.resources.length > 0 && (
                      <ul className="mt-4 space-y-2 text-sm">
                        {item.resources.map((r, idx) => (
                          <li key={idx}>
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" /> {r.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
