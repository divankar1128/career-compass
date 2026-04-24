import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Trophy,
  Brain,
  Mic,
  Briefcase,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { activityData, progressData, skillData } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import {
  resumeApi,
  roadmapApi,
  interviewApi,
  jobsApi,
  usersApi,
  type Roadmap,
  type Resume,
  type InterviewAnswer,
  type FullUser,
} from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ascend" },
      { name: "description", content: "Your career command center." },
    ],
  }),
  component: Dashboard,
});

const iconMap = { trophy: Trophy, brain: Brain, mic: Mic, briefcase: Briefcase };

function Dashboard() {
  const { user } = useAuth();
  const [fullUser, setFullUser] = useState<FullUser | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [jobsCount, setJobsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled([
        usersApi.me(),
        roadmapApi.get(),
        resumeApi.list(),
        interviewApi.answers(),
        jobsApi.recommended(),
      ]);
      if (cancelled) return;
      if (results[0].status === "fulfilled") setFullUser(results[0].value.user);
      if (results[1].status === "fulfilled") setRoadmap(results[1].value.roadmap);
      if (results[2].status === "fulfilled") setResume(results[2].value.items[0] ?? null);
      if (results[3].status === "fulfilled") setAnswers(results[3].value.items);
      if (results[4].status === "fulfilled") setJobsCount(results[4].value.items.length);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const skillCount = fullUser?.profile?.skills?.length ?? 0;

  const careerScore = useMemo(() => {
    const resumeWeight = resume?.score ?? 0;
    const roadmapWeight = (roadmap?.progress ?? 0) * 100;
    const skillsWeight = skillCount * 4;
    const interviewWeight = answers.length
      ? (answers.reduce((s, a) => s + (a.score ?? 0), 0) / answers.length) * 10
      : 0;
    const score = Math.round(
      0.35 * resumeWeight + 0.25 * roadmapWeight + 0.2 * Math.min(100, skillsWeight) + 0.2 * interviewWeight,
    );
    return Math.min(100, Math.max(0, score));
  }, [resume, roadmap, skillCount, answers]);

  const careerStats = [
    {
      label: "Career Score",
      value: careerScore,
      change: "+12",
      icon: "trophy" as const,
      suffix: "%",
    },
    {
      label: "Skills Mastered",
      value: skillCount,
      change: "+3",
      icon: "brain" as const,
      suffix: "",
    },
    {
      label: "Interview Ready",
      value: answers.length
        ? Math.round((answers.reduce((s, a) => s + (a.score ?? 0), 0) / answers.length) * 10)
        : 0,
      change: "+8%",
      icon: "mic" as const,
      suffix: "%",
    },
    {
      label: "Job Matches",
      value: jobsCount,
      change: "+4",
      icon: "briefcase" as const,
      suffix: "",
    },
  ];

  const upcomingItems =
    roadmap?.items
      ?.filter((i) => !i.done)
      .slice(0, 4)
      .map((i) => ({
        title: i.title,
        progress: i.done ? 100 : 0,
        time: `Week ${i.week}`,
      })) ?? [];

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-sm text-muted-foreground">Good morning, {firstName} ☀️</p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            You're <span className="gradient-text">{careerScore}%</span> career-ready.
          </h1>
        </div>
        <Button asChild className="rounded-full gradient-primary text-primary-foreground shadow-glow">
          <Link to="/chat">
            <Sparkles className="mr-2 h-4 w-4" /> Ask your coach
          </Link>
        </Button>
      </motion.div>

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Syncing your data...
        </div>
      )}

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {careerStats.map((s, i) => {
          const Icon = iconMap[s.icon];
          return (
            <GlassCard key={s.label} delay={i * 0.06} className="p-5">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary shadow-glow">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                  <TrendingUp className="h-3 w-3" /> {s.change}
                </span>
              </div>
              <div className="mt-4 text-3xl font-bold font-display">
                {s.value}
                {s.suffix}
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard delay={0.2} className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Career score trajectory</h3>
              <p className="text-xs text-muted-foreground">Last 8 weeks</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full text-xs">
              This quarter <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.2 295)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.72 0.2 295)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 270 / 0.15)" />
                <XAxis dataKey="week" stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="oklch(0.72 0.2 295)" strokeWidth={2.5} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.3}>
          <h3 className="font-display text-lg font-semibold">Skill balance</h3>
          <p className="text-xs text-muted-foreground">Updated today</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillData}>
                <PolarGrid stroke="oklch(0.5 0.02 270 / 0.2)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "currentColor", fontSize: 10 }} />
                <Radar dataKey="value" stroke="oklch(0.72 0.2 295)" fill="oklch(0.72 0.2 295)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard delay={0.35}>
          <h3 className="font-display text-lg font-semibold">Weekly activity</h3>
          <p className="text-xs text-muted-foreground">Lessons + mocks</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 270 / 0.15)" />
                <XAxis dataKey="day" stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="lessons" fill="oklch(0.72 0.2 295)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="mocks" fill="oklch(0.7 0.18 200)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.4} className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Today's focus</h3>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Calendar className="mr-1 inline h-3 w-3" />
              {new Date().toLocaleDateString(undefined, { month: "long", day: "numeric" })}
            </span>
          </div>
          {upcomingItems.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No active roadmap items.{" "}
              <Link to="/roadmap" className="text-primary hover:underline">
                Generate your roadmap
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcomingItems.map((t, i) => (
                <motion.li
                  key={t.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="group flex items-center gap-4 rounded-xl border border-border/60 bg-background/40 p-3 transition-colors hover:border-primary/40"
                >
                  <CheckCircle2
                    className={`h-5 w-5 shrink-0 ${t.progress === 100 ? "text-success" : "text-muted-foreground"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium">{t.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{t.time}</span>
                    </div>
                    <Progress value={t.progress} className="mt-2 h-1.5" />
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
