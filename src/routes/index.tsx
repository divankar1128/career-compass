import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Map,
  Briefcase,
  Mic,
  FileText,
  MessageSquare,
  Star,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ascend — AI Career Coach for Ambitious Humans" },
      {
        name: "description",
        content:
          "AI-powered career coaching: personalized roadmaps, resume scoring, mock interviews, and curated jobs. Land your next role 3× faster.",
      },
      { property: "og:title", content: "Ascend — AI Career Coach" },
      { property: "og:description", content: "Personalized roadmaps, resume scoring, mock interviews, and curated jobs." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">Ascend</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Stories</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="rounded-full">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="rounded-full gradient-primary text-primary-foreground shadow-glow">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              New · GPT-5 powered career intelligence
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Your AI co-pilot for{" "}
              <span className="gradient-text">the career you actually want.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Personalized roadmaps, resume scoring, mock interviews, and curated jobs — all in one
              calm, beautifully designed workspace.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/signup">
                <Button size="lg" className="rounded-full gradient-primary text-primary-foreground shadow-glow hover:scale-[1.02] transition-transform">
                  Start free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="rounded-full">
                  Live demo
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              {["Stripe", "Linear", "Vercel", "Notion", "Figma"].map((b) => (
                <span key={b} className="font-display font-semibold tracking-widest opacity-60">
                  {b.toUpperCase()}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Floating preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative mx-auto mt-20 max-w-5xl"
          >
            <div className="absolute -inset-x-10 -top-10 h-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative glass rounded-3xl p-2 shadow-elegant">
              <div className="rounded-2xl bg-card p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    { label: "Career Score", value: "87", trend: "+12 this week", color: "from-primary to-primary-glow" },
                    { label: "Skills mastered", value: "24", trend: "3 new", color: "from-accent to-primary" },
                    { label: "Interview ready", value: "94%", trend: "Top 5%", color: "from-primary to-accent" },
                  ].map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="rounded-xl border border-border bg-background/50 p-5"
                    >
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                      <div className={`mt-2 bg-gradient-to-r ${s.color} bg-clip-text text-4xl font-bold text-transparent`}>
                        {s.value}
                      </div>
                      <div className="mt-1 text-xs text-success">{s.trend}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Platform</div>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            One workspace. Every career move.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built for engineers, designers, and operators who treat their career like a product.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Brain, title: "AI Coach", desc: "24/7 conversational coach that knows your goals, history, and blockers." },
            { icon: FileText, title: "Resume Analyzer", desc: "Get scored against the JD. Rewrite bullets in your tone." },
            { icon: Map, title: "Personalized Roadmap", desc: "Step-by-step plan that adapts as you grow." },
            { icon: Briefcase, title: "Curated Jobs", desc: "Roles that match your skills, salary, and remote preferences." },
            { icon: Mic, title: "Mock Interviews", desc: "Live simulated interviews with instant feedback." },
            { icon: MessageSquare, title: "Negotiation playbooks", desc: "Scripts and tactics to land 18% more on average." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-elegant"
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary shadow-glow">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">
            People who <span className="gradient-text">leveled up</span>.
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { name: "Maya R.", role: "L5 → L6 at Stripe", quote: "I went from doom-scrolling LinkedIn to a 35% raise in 9 weeks. The roadmap is unreal." },
              { name: "Daniel O.", role: "PM at Linear", quote: "The mock interviews caught every weakness I had. Best money I've spent on my career." },
              { name: "Priya S.", role: "Designer → Founder", quote: "It feels like having a senior mentor on call, but they actually remember everything." },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex gap-0.5 text-warning">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full gradient-primary text-sm font-semibold text-primary-foreground">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Simple, fair pricing.</h2>
          <p className="mt-4 text-muted-foreground">Start free. Upgrade when you're ready to ship your career.</p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { name: "Free", price: "$0", desc: "Forever free", features: ["AI chat (50/mo)", "1 resume scan", "Basic roadmap"], cta: "Get started", highlight: false },
            { name: "Pro", price: "$19", desc: "per month", features: ["Unlimited AI chat", "Resume rewrites", "Personalized roadmap", "Mock interviews", "Curated jobs"], cta: "Start Pro", highlight: true },
            { name: "Pro+", price: "$49", desc: "per month", features: ["Everything in Pro", "1:1 human coach", "Salary negotiation", "Priority support"], cta: "Talk to us", highlight: false },
          ].map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl border p-8 ${
                p.highlight
                  ? "border-primary bg-card shadow-glow"
                  : "border-border bg-card"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
                  Most popular
                </div>
              )}
              <div className="font-display text-lg font-semibold">{p.name}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">/{p.desc}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button
                  className={`mt-8 w-full rounded-full ${
                    p.highlight ? "gradient-primary text-primary-foreground shadow-glow" : ""
                  }`}
                  variant={p.highlight ? "default" : "outline"}
                >
                  {p.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-card p-12 text-center shadow-elegant">
          <div className="absolute inset-0 aurora-bg opacity-60" />
          <div className="relative">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Your next role is <span className="gradient-text">12 weeks away</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join 47,000+ ambitious people building careers they're proud of.
            </p>
            <Link to="/signup">
              <Button size="lg" className="mt-8 rounded-full gradient-primary text-primary-foreground shadow-glow">
                Start free — no card needed <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <div>© 2026 Ascend Labs Inc.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
