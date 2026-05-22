import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function StatCard({ title, value, icon, trend, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-5 shadow-lg card-hover", className)}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-400">{title}</p>
        <div className="rounded-lg p-2 text-black bg-brand-500 shadow-[0_0_10px_rgba(212,168,83,0.3)]">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold text-zinc-50">{value}</p>
      {trend !== null && trend !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          <span className={cn("text-xs font-semibold", trend >= 0 ? "text-brand-500" : "text-red-400")}>
            {trend >= 0 ? "↑" : "↓"} {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
          <span className="text-xs text-zinc-500">vs mois dernier</span>
        </div>
      )}
    </motion.div>
  );
}
