import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { resumeApi, ApiError, type Resume } from "@/lib/api";

export const Route = createFileRoute("/resume")({
  head: () => ({ meta: [{ title: "Resume Analyzer — Ascend" }] }),
  component: ResumePage,
});

function ResumePage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState<Resume[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollTimer = useRef<number | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const { items } = await resumeApi.list();
      setHistory(items);
      const latest = items[0];
      if (latest && (!resume || latest._id !== resume._id)) setResume(latest);
    } catch {
      // ignore
    }
  }, [resume]);

  useEffect(() => {
    void loadHistory();
    return () => {
      if (pollTimer.current) window.clearInterval(pollTimer.current);
    };
  }, [loadHistory]);

  // Poll status until ready/failed
  useEffect(() => {
    if (!resume || resume.status === "ready" || resume.status === "failed") return;
    if (pollTimer.current) window.clearInterval(pollTimer.current);
    pollTimer.current = window.setInterval(async () => {
      try {
        const { resume: fresh } = await resumeApi.get(resume._id);
        setResume(fresh);
        if (fresh.status === "ready") {
          toast.success(`Resume analyzed — score ${fresh.score ?? "?"}/100`);
          window.clearInterval(pollTimer.current!);
          void loadHistory();
        } else if (fresh.status === "failed") {
          toast.error(fresh.error || "Analysis failed");
          window.clearInterval(pollTimer.current!);
        }
      } catch {
        // keep polling
      }
    }, 2500);
    return () => {
      if (pollTimer.current) window.clearInterval(pollTimer.current);
    };
  }, [resume, loadHistory]);

  const onUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("PDF files only");
      return;
    }
    setUploading(true);
    try {
      const { resume: created } = await resumeApi.upload(file);
      setResume(created);
      toast.info("Resume queued for analysis");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const score = resume?.score ?? 0;
  const isAnalyzing =
    !!resume && (resume.status === "queued" || resume.status === "processing" || uploading);
  const isReady = resume?.status === "ready";

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Resume Analyzer</h1>
        <p className="mt-1 text-muted-foreground">
          Upload your resume — get a recruiter-grade score in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div
            onClick={() => !isAnalyzing && fileRef.current?.click()}
            className="group relative cursor-pointer rounded-2xl border-2 border-dashed border-border p-12 text-center transition-all hover:border-primary hover:bg-primary/5"
          >
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onUpload(f);
                e.target.value = "";
              }}
            />
            <motion.div
              animate={{ y: isAnalyzing ? [0, -8, 0] : 0 }}
              transition={{ repeat: isAnalyzing ? Infinity : 0, duration: 1.2 }}
              className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-primary shadow-glow"
            >
              {isAnalyzing ? (
                <Loader2 className="h-7 w-7 animate-spin text-primary-foreground" />
              ) : (
                <Upload className="h-7 w-7 text-primary-foreground" />
              )}
            </motion.div>
            <h3 className="mt-6 font-display text-xl font-semibold">
              {uploading
                ? "Uploading..."
                : isAnalyzing
                  ? "Analyzing your resume..."
                  : "Drop your resume here"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">PDF up to 10MB</p>
            {!isAnalyzing && (
              <Button className="mt-6 rounded-full gradient-primary text-primary-foreground shadow-glow">
                <Upload className="mr-2 h-4 w-4" /> Choose file
              </Button>
            )}
          </div>

          {isReady && resume && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <h3 className="font-display text-lg font-semibold">AI Suggestions</h3>
              <ul className="mt-4 space-y-3">
                {(resume.strengths ?? []).map((s, i) => (
                  <motion.li
                    key={`s-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-3 rounded-xl border border-border bg-background/40 p-3"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                    <span className="text-sm">{s}</span>
                  </motion.li>
                ))}
                {(resume.gaps ?? []).map((g, i) => (
                  <motion.li
                    key={`g-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (i + (resume.strengths?.length ?? 0)) * 0.05 }}
                    className="flex gap-3 rounded-xl border border-border bg-background/40 p-3"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
                    <span className="text-sm">{g}</span>
                  </motion.li>
                ))}
                {(resume.suggestions ?? []).map((s, i) => (
                  <motion.li
                    key={`sg-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-3 rounded-xl border border-border bg-background/40 p-3"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{s}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {history.length > 1 && (
            <div className="mt-8">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Previous uploads</h3>
              <ul className="space-y-2">
                {history.slice(0, 5).map((r) => (
                  <li
                    key={r._id}
                    className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{r.filename}</span>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">
                      {r.status} {r.score ? `· ${r.score}/100` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Your score</h3>
          </div>
          {isReady && resume ? (
            <>
              <div className="relative mx-auto mt-6 grid h-44 w-44 place-items-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="oklch(0.5 0.02 270 / 0.15)"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#gradScore)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 264" }}
                    animate={{ strokeDasharray: `${(score / 100) * 264} 264` }}
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
                  <div className="font-display text-5xl font-bold gradient-text">{score}</div>
                  <div className="text-xs text-muted-foreground">/ 100</div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Impact", value: resume.breakdown?.impact ?? 0 },
                  { label: "Content", value: resume.breakdown?.content ?? 0 },
                  { label: "Structure", value: resume.breakdown?.structure ?? 0 },
                  { label: "Keywords", value: resume.breakdown?.keywords ?? 0 },
                  { label: "Formatting", value: resume.breakdown?.formatting ?? 0 },
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
            <p className="mt-6 text-sm text-muted-foreground">
              {isAnalyzing
                ? "Hang tight — your resume is being analyzed."
                : "Upload your resume to see your detailed score."}
            </p>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
