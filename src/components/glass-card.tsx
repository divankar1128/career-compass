import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  delay = 0,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -3 } : undefined}
      className={cn(
        "glass rounded-2xl p-6 shadow-soft transition-shadow hover:shadow-elegant",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
