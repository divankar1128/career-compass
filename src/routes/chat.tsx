import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Paperclip, Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialChatMessages } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [{ title: "AI Coach — Ascend" }],
  }),
  component: ChatPage,
});

const suggestions = [
  "Review my Linear interview prep",
  "Negotiate my $190k offer",
  "How do I get to staff in 18 months?",
  "Roast my resume",
];

const aiReplies = [
  "Great question. Let me break this into 3 concrete moves you can ship this week...",
  "Based on your goals and current trajectory, here's what I'd prioritize:\n\n1. Lock in your story bank\n2. Schedule 2 mocks with senior ICs\n3. Send your current draft to Maya for a 24h turnaround.",
  "I love this energy. Here's the playbook top performers use — and the trap most people fall into.",
];

type Message = { id: string; role: "user" | "assistant"; content: string; time: string };

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialChatMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content, time: "Now" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiReplies[Math.floor(Math.random() * aiReplies.length)],
        time: "Now",
      };
      setMessages((prev) => [...prev, reply]);
      setTyping(false);
    }, 1300);
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-9rem)] flex-col lg:h-[calc(100vh-7rem)]">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold">Coach Aria</h1>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Online · GPT-5
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto py-6 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}
              >
                <div
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
                    m.role === "user"
                      ? "gradient-primary text-primary-foreground"
                      : "bg-card border border-border",
                  )}
                >
                  {m.role === "user" ? "AK" : <Sparkles className="h-4 w-4 text-primary" />}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft",
                    m.role === "user"
                      ? "gradient-primary text-primary-foreground"
                      : "glass",
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p className={cn("mt-1 text-[10px] opacity-60")}>{m.time}</p>
                </div>
              </motion.div>
            ))}
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="glass rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        {messages.length <= 2 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft"
        >
          <Button type="button" variant="ghost" size="icon" className="rounded-full">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your career..."
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button type="button" variant="ghost" size="icon" className="rounded-full">
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            size="icon"
            className="rounded-full gradient-primary text-primary-foreground shadow-glow"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
