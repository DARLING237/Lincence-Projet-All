import { cn } from "../../lib/utils";

const badgeVariants = {
  // Table status
  libre: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  reservee: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  occupee: "bg-red-500/15 text-red-400 border-red-500/30",
  // Commandes
  "en attente": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "en preparation": "bg-[#D4A853]/15 text-[#D4A853] border-[#D4A853]/30",
  servie: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  payee: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  annulee: "bg-lounge-600/30 text-lounge-400 border-lounge-600/40",
  // Personnel
  present: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  absent: "bg-red-500/15 text-red-400 border-red-500/30",
  conge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  // Impots
  "en retard": "bg-red-500/15 text-red-400 border-red-500/30",
  // Semantic
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  error: "bg-red-500/15 text-red-400 border-red-500/30",
  // Rôles
  admin: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  staff: "bg-[#D4A853]/15 text-[#D4A853] border-[#D4A853]/30",
  // Default
  default: "bg-lounge-600/30 text-lounge-300 border-lounge-600/40",
  secondary: "bg-lounge-600/30 text-lounge-300 border-lounge-600/40",
};

export function Badge({ children, variant = "default", className, ...props }) {
  const colorClass = badgeVariants[variant] || badgeVariants.default;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
