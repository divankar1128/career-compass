import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Camera, Edit3, MapPin, Briefcase, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { usersApi, ApiError, type FullUser } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Ascend" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user: authUser, refresh } = useAuth();
  const [user, setUser] = useState<FullUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skillsText, setSkillsText] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user } = await usersApi.me();
        if (cancelled) return;
        setUser(user);
        setName(user.name ?? "");
        setHeadline(user.profile?.headline ?? "");
        setBio(user.profile?.bio ?? "");
        setLocation(user.profile?.location ?? "");
        setCurrentRole(user.profile?.currentRole ?? "");
        setTargetRole(user.profile?.targetRole ?? "");
        setSkillsText((user.profile?.skills ?? []).join(", "));
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Could not load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = (name || authUser?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const save = async () => {
    setSaving(true);
    try {
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const { user } = await usersApi.update({
        name,
        profile: {
          headline,
          bio,
          location,
          currentRole,
          targetRole,
          skills,
        },
      });
      setUser(user);
      await refresh();
      setEditing(false);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const onAvatar = async (file: File) => {
    try {
      const { user } = await usersApi.uploadAvatar(file);
      setUser(user);
      await refresh();
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="grid h-64 place-items-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AppShell>
    );
  }

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
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={name}
                    className="h-24 w-24 rounded-2xl object-cover ring-4 ring-background shadow-glow sm:h-32 sm:w-32"
                  />
                ) : (
                  <div className="grid h-24 w-24 place-items-center rounded-2xl gradient-primary text-3xl font-bold text-primary-foreground shadow-glow ring-4 ring-background sm:h-32 sm:w-32 sm:text-4xl">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-card shadow-soft hover:bg-muted"
                  aria-label="Change avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onAvatar(f);
                    e.target.value = "";
                  }}
                />
              </div>
              <div className="pb-1">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">{name || "Your name"}</h1>
                <p className="text-sm text-muted-foreground capitalize">
                  {currentRole || "Set your role"} · {user?.plan ?? "free"} plan
                </p>
              </div>
            </div>
            <Button
              onClick={() => (editing ? void save() : setEditing(true))}
              disabled={saving}
              className="rounded-full"
              variant={editing ? "default" : "outline"}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Edit3 className="mr-2 h-4 w-4" />
              )}
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
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Current role</Label>
              <Input
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                disabled={!editing}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Target role</Label>
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                disabled={!editing}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Headline</Label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                disabled={!editing}
                placeholder="Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={!editing}
                placeholder="Brooklyn, NY"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Bio</Label>
              <Textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={!editing}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Skills (comma-separated)</Label>
              <Input
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                disabled={!editing}
                placeholder="React, TypeScript, Node.js"
              />
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <h3 className="font-display text-lg font-semibold">Quick stats</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-primary" />
                {user?.profile?.experienceYears ?? 0} years experience
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                {location || "Add your location"}
              </li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h3 className="font-display text-lg font-semibold">Top skills</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(user?.profile?.skills ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">No skills added yet.</p>
              ) : (
                (user?.profile?.skills ?? []).map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
