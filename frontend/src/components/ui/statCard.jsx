import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function StatCard({ title, value, icon, trend, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("rounded-2xl border border-[#D4A853]/10 bg-[#1A1714] p-5 shadow-sm", className)}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-lounge-400">{title}</p>
        <div className="rounded-xl p-2 text-lounge-950 bg-gradient-to-br from-[#D4A853] to-[#C49742]">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-lounge-100">{value}</p>
      {trend !== null && trend !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          <span className={cn("text-xs font-semibold", trend >= 0 ? "text-[#D4A853]" : "text-red-400")}>
            {trend >= 0 ? "↑" : "↓"} {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
          <span className="text-xs text-lounge-400">vs mois dernier</span>
        </div>
      )}
    </motion.div>
  );
}
