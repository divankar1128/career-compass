import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{ title: "Onboarding — Ascend" }],
  }),
  component: Onboarding,
});

const steps = [
  { title: "What's your role?", key: "role" },
  { title: "Pick your goals", key: "goals" },
  { title: "Where are you headed?", key: "target" },
];

const roles = ["Engineer", "Designer", "Product Manager", "Data Scientist", "Founder", "Other"];
const goalChips = ["Switch jobs", "Get promoted", "Salary bump", "Build skills", "Network", "Go remote"];
const targets = ["FAANG / Big Tech", "High-growth startup", "Remote-first", "Founder path", "Freelance"];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("Engineer");
  const [goals, setGoals] = useState<string[]>(["Switch jobs", "Salary bump"]);
  const [target, setTarget] = useState("High-growth startup");

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      toast.success("You're all set, Alex!");
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 aurora-bg" />
      <div className="relative grid min-h-screen place-items-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold">Ascend</span>
          </div>

          <div className="mb-8 flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s.key} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition-all",
                    i <= step
                      ? "gradient-primary text-primary-foreground shadow-glow"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: i < step ? "100%" : "0%" }}
                      className="h-full gradient-primary"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="glass-strong rounded-3xl p-8 shadow-elegant">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-display text-3xl font-bold">{steps[step].title}</h2>
                <p className="mt-2 text-muted-foreground">This helps us personalize your experience.</p>

                <div className="mt-8">
                  {step === 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {roles.map((r) => (
                        <button
                          key={r}
                          onClick={() => setRole(r)}
                          className={cn(
                            "rounded-xl border p-4 text-sm font-medium transition-all",
                            role === r
                              ? "border-primary bg-primary/10 text-foreground shadow-soft"
                              : "border-border hover:border-primary/40",
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                  {step === 1 && (
                    <div className="flex flex-wrap gap-2">
                      {goalChips.map((g) => {
                        const active = goals.includes(g);
                        return (
                          <button
                            key={g}
                            onClick={() =>
                              setGoals((prev) => (active ? prev.filter((x) => x !== g) : [...prev, g]))
                            }
                            className={cn(
                              "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                              active
                                ? "border-primary gradient-primary text-primary-foreground shadow-glow"
                                : "border-border hover:border-primary/40",
                            )}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {targets.map((t) => (
                          <button
                            key={t}
                            onClick={() => setTarget(t)}
                            className={cn(
                              "rounded-xl border p-4 text-left text-sm font-medium transition-all",
                              target === t
                                ? "border-primary bg-primary/10 shadow-soft"
                                : "border-border hover:border-primary/40",
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Target salary (USD)</Label>
                        <Input placeholder="$180,000" defaultValue="$180,000" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="rounded-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={next}
                className="rounded-full gradient-primary text-primary-foreground shadow-glow"
              >
                {step === steps.length - 1 ? "Finish" : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
