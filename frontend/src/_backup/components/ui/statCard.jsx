import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function StatCard({ title, value, icon, trend, trendValue, color = "indigo", className }) {
  const colorMap = {
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
    blue: "from-blue-500 to-blue-600",
    violet: "from-violet-500 to-violet-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("rounded-2xl border border-gray-200 bg-white p-5 shadow-sm", className)}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={cn("rounded-xl p-2 text-white bg-gradient-to-br", colorMap[color] || colorMap.indigo)}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
      {trend !== null && trend !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          <span className={cn("text-xs font-semibold", trend >= 0 ? "text-green-600" : "text-red-500")}>
            {trend >= 0 ? "↑" : "↓"} {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
          <span className="text-xs text-gray-400">vs mois dernier</span>
        </div>
      )}
    </motion.div>
  );
}
