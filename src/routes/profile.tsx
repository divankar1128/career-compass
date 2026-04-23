import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Camera, Edit3, MapPin, Briefcase, Github, Linkedin, Globe } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Ascend" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [editing, setEditing] = useState(false);
  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant"
      >
        <div className="h-40 aurora-bg sm:h-48" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col items-start gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="grid h-24 w-24 place-items-center rounded-2xl gradient-primary text-3xl font-bold text-primary-foreground shadow-glow ring-4 ring-background sm:h-32 sm:w-32 sm:text-4xl">
                  AK
                </div>
                <button className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-card shadow-soft hover:bg-muted">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="pb-1">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">Alex Kim</h1>
                <p className="text-sm text-muted-foreground">Senior Frontend Engineer · Pro plan</p>
              </div>
            </div>
            <Button
              onClick={() => {
                if (editing) toast.success("Profile saved");
                setEditing(!editing);
              }}
              className="rounded-full"
              variant={editing ? "default" : "outline"}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              {editing ? "Save changes" : "Edit profile"}
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">About</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input defaultValue="Alex Kim" disabled={!editing} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input defaultValue="alex@ascend.app" disabled={!editing} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input defaultValue="Senior Frontend Engineer" disabled={!editing} />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input defaultValue="Brooklyn, NY" disabled={!editing} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Bio</Label>
              <Textarea
                rows={4}
                disabled={!editing}
                defaultValue="Building delightful frontends for 7 years. Currently obsessed with design systems, animations that mean something, and helping teams ship faster."
              />
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <h3 className="font-display text-lg font-semibold">Quick stats</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-primary" /> 7 years experience
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" /> Brooklyn, NY
              </li>
              <li className="flex items-center gap-3">
                <Github className="h-4 w-4 text-primary" /> github.com/alexkim
              </li>
              <li className="flex items-center gap-3">
                <Linkedin className="h-4 w-4 text-primary" /> linkedin.com/in/alexkim
              </li>
              <li className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-primary" /> alexkim.dev
              </li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h3 className="font-display text-lg font-semibold">Top skills</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {["React", "TypeScript", "Next.js", "Design Systems", "Tailwind", "GraphQL", "Testing", "Animations"].map(
                (s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs font-medium"
                  >
                    {s}
                  </span>
                ),
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
