import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/glass-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { roadmapMilestones } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — Ascend" }] }),
  component: RoadmapPage,
});

function RoadmapPage() {
  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Your roadmap</h1>
          <p className="mt-1 text-muted-foreground">A 12-week plan tailored to your goals. Adapts as you grow.</p>
        </div>
        <Button className="rounded-full gradient-primary text-primary-foreground shadow-glow">
          <Sparkles className="mr-2 h-4 w-4" /> Regenerate plan
        </Button>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-border to-transparent lg:left-1/2" />
        <div className="space-y-6">
          {roadmapMilestones.map((m, i) => {
            const left = i % 2 === 0;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "relative flex gap-6",
                  "lg:items-center",
                  left ? "lg:flex-row" : "lg:flex-row-reverse",
                )}
              >
                <div className="absolute left-6 z-10 -translate-x-1/2 lg:left-1/2">
                  <div
                    className={cn(
                      "grid h-12 w-12 place-items-center rounded-full border-4 border-background",
                      m.status === "done"
                        ? "gradient-primary shadow-glow"
                        : m.status === "active"
                          ? "bg-primary/20 ring-2 ring-primary"
                          : "bg-muted",
                    )}
                  >
                    {m.status === "done" ? (
                      <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                    ) : m.status === "active" ? (
                      <Circle className="h-5 w-5 text-primary animate-pulse" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="hidden flex-1 lg:block" />
                <GlassCard
                  delay={0}
                  hover={false}
                  className={cn("ml-16 flex-1 lg:ml-0", m.status === "active" && "ring-2 ring-primary/30 shadow-glow")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Phase {m.id}
                      </div>
                      <h3 className="mt-1 font-display text-xl font-semibold">{m.title}</h3>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                        m.status === "done"
                          ? "bg-success/15 text-success"
                          : m.status === "active"
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {m.status}
                    </span>
                  </div>
                  <Progress value={m.progress} className="mt-4 h-1.5" />
                  <ul className="mt-4 space-y-2 text-sm">
                    {m.items.map((it) => (
                      <li key={it} className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60" /> {it}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
