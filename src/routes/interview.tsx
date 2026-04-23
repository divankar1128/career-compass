import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Play, Clock, Zap } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { interviewQuestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/interview")({
  head: () => ({ meta: [{ title: "Interview Prep — Ascend" }] }),
  component: InterviewPage,
});

function InterviewPage() {
  const [current, setCurrent] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Interview Prep</h1>
        <p className="mt-1 text-muted-foreground">Practice with AI. Get scored on content, structure, and delivery.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Mocks done", value: "27" },
          { label: "Avg. score", value: "8.4" },
          { label: "Hours practiced", value: "14h" },
          { label: "Streak", value: "12 days" },
        ].map((s, i) => (
          <GlassCard key={s.label} delay={i * 0.05} className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-2 font-display text-3xl font-bold gradient-text">{s.value}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-display text-lg font-semibold">Question bank</h2>
          {interviewQuestions.map((q, i) => (
            <motion.button
              key={q.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setCurrent(q.id)}
              className={cn(
                "w-full rounded-2xl border p-5 text-left transition-all",
                current === q.id
                  ? "border-primary bg-primary/5 shadow-glow"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {q.type}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        q.difficulty === "Easy" && "bg-success/15 text-success",
                        q.difficulty === "Medium" && "bg-warning/15 text-warning",
                        q.difficulty === "Hard" && "bg-destructive/15 text-destructive",
                      )}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="mt-3 font-medium">{q.question}</p>
                </div>
                <Play className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
            </motion.button>
          ))}
        </div>

        <GlassCard className="h-fit lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Live mock</h2>
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="mt-2 text-sm text-muted-foreground">
                  {interviewQuestions.find((q) => q.id === current)?.question}
                </p>
                <div className="my-8 grid place-items-center">
                  <button
                    onClick={() => {
                      setRecording(!recording);
                      if (!recording) toast.info("Recording started");
                      else toast.success("Great answer! Score: 8.7/10");
                    }}
                    className={cn(
                      "relative grid h-28 w-28 place-items-center rounded-full transition-all",
                      recording
                        ? "bg-destructive shadow-glow"
                        : "gradient-primary shadow-glow hover:scale-105",
                    )}
                  >
                    {recording && (
                      <>
                        <span className="absolute inset-0 animate-ping rounded-full bg-destructive opacity-30" />
                        <span className="absolute -inset-2 animate-pulse rounded-full border-2 border-destructive/40" />
                      </>
                    )}
                    <Mic className="h-10 w-10 text-primary-foreground" />
                  </button>
                </div>
                <p className="text-center text-sm font-medium">
                  {recording ? "Listening..." : "Tap to record your answer"}
                </p>
                <div className="mt-6 flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs">
                  <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> 02:34</span>
                  <span className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary" /> AI listening</span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-muted">
                  <Mic className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Pick a question to start your mock interview.</p>
                <Button className="mt-4 rounded-full gradient-primary text-primary-foreground shadow-glow">
                  Start random
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </AppShell>
  );
}
