import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Map,
  Briefcase,
  Mic,
  User,
  Sparkles,
  Menu,
  X,
  Search,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "AI Coach", icon: MessageSquare },
  { to: "/resume", label: "Resume", icon: FileText },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/interview", label: "Interview", icon: Mic },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-lg font-semibold">Ascend</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(open || typeof window === "undefined") && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl lg:hidden"
            >
              <SidebarContent currentPath={location.pathname} onNavigate={() => setOpen(false)} />
            </motion.aside>
          )}
        </AnimatePresence>

        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
          <SidebarContent currentPath={location.pathname} />
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-border/60 bg-background/70 px-8 backdrop-blur-xl lg:flex">
            <div className="relative w-96 max-w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search skills, jobs, lessons..." className="rounded-full pl-9" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <div className="ml-2 flex items-center gap-3 rounded-full border border-border bg-card px-3 py-1.5">
                <div className="grid h-7 w-7 place-items-center rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
                  AK
                </div>
                <div className="hidden text-sm xl:block">
                  <div className="font-medium leading-none">Alex Kim</div>
                  <div className="text-xs text-muted-foreground">Pro plan</div>
                </div>
              </div>
            </div>
          </header>
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ currentPath, onNavigate }: { currentPath: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Logo />
        <div>
          <div className="font-display text-lg font-semibold leading-none">Ascend</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Career OS</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin">
        <div className="px-2 pb-2 pt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        {nav.map((item) => {
          const active = currentPath === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="active-pill"
                  className="absolute inset-y-1 left-0 w-1 rounded-r-full gradient-primary"
                />
              )}
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="m-4 rounded-2xl border border-sidebar-border glass p-4">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Upgrade to Pro+
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Unlock unlimited mock interviews and weekly 1:1 coaching.
        </p>
        <Button size="sm" className="mt-3 w-full rounded-full gradient-primary text-primary-foreground shadow-glow">
          Upgrade
        </Button>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary shadow-glow">
      <Sparkles className="h-4 w-4 text-primary-foreground" />
    </div>
  );
}
