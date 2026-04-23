import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/resume")({
  head: () => ({ meta: [{ title: "Resume Analyzer — Ascend" }] }),
  component: ResumePage,
});

function ResumePage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [progress, setProgress] = useState(0);

  const analyze = () => {
    setAnalyzing(true);
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setAnalyzing(false);
          setAnalyzed(true);
          toast.success("Resume analyzed — score 84/100");
          return 100;
        }
        return p + 8;
      });
    }, 100);
  };

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Resume Analyzer</h1>
        <p className="mt-1 text-muted-foreground">Upload your resume — get a recruiter-grade score in seconds.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div
            onClick={analyze}
            className="group relative cursor-pointer rounded-2xl border-2 border-dashed border-border p-12 text-center transition-all hover:border-primary hover:bg-primary/5"
          >
            <motion.div
              animate={{ y: analyzing ? [0, -8, 0] : 0 }}
              transition={{ repeat: analyzing ? Infinity : 0, duration: 1.2 }}
              className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-primary shadow-glow"
            >
              <Upload className="h-7 w-7 text-primary-foreground" />
            </motion.div>
            <h3 className="mt-6 font-display text-xl font-semibold">
              {analyzing ? "Analyzing..." : "Drop your resume here"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">PDF, DOCX up to 10MB</p>
            {analyzing && <Progress value={progress} className="mx-auto mt-6 max-w-xs" />}
            {!analyzing && (
              <Button className="mt-6 rounded-full gradient-primary text-primary-foreground shadow-glow">
                <Sparkles className="mr-2 h-4 w-4" /> Try with sample resume
              </Button>
            )}
          </div>

          {analyzed && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <h3 className="font-display text-lg font-semibold">AI Suggestions</h3>
              <ul className="mt-4 space-y-3">
                {[
                  { ok: true, text: "Strong impact verbs in 80% of bullets" },
                  { ok: true, text: "Quantified results in 6 of 8 roles" },
                  { ok: false, text: "Missing keywords: 'distributed systems', 'observability'" },
                  { ok: false, text: "Education section is too long — trim by 40%" },
                  { ok: false, text: "Add a 1-line summary at the top targeting your ICP" },
                ].map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-3 rounded-xl border border-border bg-background/40 p-3"
                  >
                    {s.ok ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                    ) : (
                      <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
                    )}
                    <span className="text-sm">{s.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Your score</h3>
          </div>
          {analyzed ? (
            <>
              <div className="relative mx-auto mt-6 grid h-44 w-44 place-items-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(0.5 0.02 270 / 0.15)" strokeWidth="6" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#gradScore)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 264" }}
                    animate={{ strokeDasharray: `${(84 / 100) * 264} 264` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradScore" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.2 295)" />
                      <stop offset="100%" stopColor="oklch(0.7 0.18 200)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center">
                  <div className="font-display text-5xl font-bold gradient-text">84</div>
                  <div className="text-xs text-muted-foreground">/ 100</div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Impact", value: 92 },
                  { label: "Clarity", value: 78 },
                  { label: "Keyword fit", value: 65 },
                  { label: "Formatting", value: 95 },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="font-medium">{m.value}</span>
                    </div>
                    <Progress value={m.value} className="h-1.5" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">Upload your resume to see your detailed score.</p>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
