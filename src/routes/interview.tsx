import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Play, Loader2, Send, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  interviewApi,
  ApiError,
  type InterviewQuestion,
  type InterviewAnswer,
} from "@/lib/api";

export const Route = createFileRoute("/interview")({
  head: () => ({ meta: [{ title: "Interview Prep — Ascend" }] }),
  component: InterviewPage,
});

const difficultyClass = {
  easy: "bg-success/15 text-success",
  medium: "bg-warning/15 text-warning",
  hard: "bg-destructive/15 text-destructive",
} as const;

function InterviewPage() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<InterviewQuestion | null>(null);
  const [transcript, setTranscript] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [latestAnswer, setLatestAnswer] = useState<InterviewAnswer | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [q, a] = await Promise.all([interviewApi.questions(), interviewApi.answers()]);
        if (!cancelled) {
          setQuestions(q.items);
          setAnswers(a.items);
        }
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Could not load questions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async () => {
    if (!current || transcript.trim().length < 10) {
      toast.error("Write at least 10 characters before submitting");
      return;
    }
    setSubmitting(true);
    try {
      const { answer } = await interviewApi.submitAnswer({
        questionId: current._id,
        transcript: transcript.trim(),
      });
      setLatestAnswer(answer);
      setAnswers((prev) => [answer, ...prev]);
      setTranscript("");
      toast.success(`Score: ${answer.score}/10`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not score answer");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    done: answers.length,
    avg: answers.length
      ? (answers.reduce((s, a) => s + (a.score ?? 0), 0) / answers.length).toFixed(1)
      : "—",
  };

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Interview Prep</h1>
        <p className="mt-1 text-muted-foreground">
          Practice with AI. Get scored on content, structure, and delivery.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Mocks done", value: String(stats.done) },
          { label: "Avg. score", value: String(stats.avg) },
          { label: "Questions", value: String(questions.length) },
          { label: "Streak", value: answers.length > 0 ? `${Math.min(answers.length, 30)} days` : "—" },
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
          {loading ? (
            <div className="grid h-32 place-items-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : questions.length === 0 ? (
            <GlassCard className="text-center text-sm text-muted-foreground">
              No questions yet. Run the seed script in the backend.
            </GlassCard>
          ) : (
            questions.map((q, i) => (
              <motion.button
                key={q._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  setCurrent(q);
                  setLatestAnswer(null);
                  setTranscript("");
                }}
                className={cn(
                  "w-full rounded-2xl border p-5 text-left transition-all",
                  current?._id === q._id
                    ? "border-primary bg-primary/5 shadow-glow"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                        {q.type}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          difficultyClass[q.difficulty],
                        )}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="mt-3 font-medium">{q.prompt}</p>
                  </div>
                  <Play className="h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
              </motion.button>
            ))
          )}
        </div>

        <GlassCard className="h-fit lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Live mock</h2>
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div
                key={current._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="mt-2 text-sm text-muted-foreground">{current.prompt}</p>
                <Textarea
                  rows={6}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Type or dictate your answer here..."
                  className="mt-4"
                />
                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="mt-4 w-full rounded-full gradient-primary text-primary-foreground shadow-glow"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit for AI scoring
                </Button>
                {latestAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-3 rounded-2xl border border-border bg-background/40 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <span className="font-display text-2xl font-bold gradient-text">
                        {latestAnswer.score}/10
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {(["content", "structure", "delivery"] as const).map((k) => (
                        <div key={k} className="rounded-lg bg-muted/40 p-2 text-center">
                          <div className="text-muted-foreground capitalize">{k}</div>
                          <div className="font-semibold">{latestAnswer.breakdown?.[k] ?? "—"}</div>
                        </div>
                      ))}
                    </div>
                    {latestAnswer.feedback && (
                      <p className="text-sm">{latestAnswer.feedback}</p>
                    )}
                    {latestAnswer.suggestions && latestAnswer.suggestions.length > 0 && (
                      <ul className="space-y-1 text-sm">
                        {latestAnswer.suggestions.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-primary">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center"
              >
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-muted">
                  <Mic className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Pick a question to start your mock interview.
                </p>
                {questions.length > 0 && (
                  <Button
                    onClick={() => {
                      const random = questions[Math.floor(Math.random() * questions.length)];
                      setCurrent(random);
                      setLatestAnswer(null);
                    }}
                    className="mt-4 rounded-full gradient-primary text-primary-foreground shadow-glow"
                  >
                    Start random
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </AppShell>
  );
}
