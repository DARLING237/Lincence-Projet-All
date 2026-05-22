import { cn } from "../../lib/utils";

const badgeVariants = {
  // Table status
  libre: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  reservee: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  occupee: "bg-red-500/10 text-red-400 border-red-500/20",
  // Commandes
  "en attente": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "en preparation": "bg-brand-500/10 text-brand-500 border-brand-500/20",
  servie: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  payee: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  annulee: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30",
  // Personnel
  present: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  absent: "bg-red-500/10 text-red-400 border-red-500/20",
  conge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  // Impots
  "en retard": "bg-red-500/10 text-red-400 border-red-500/20",
  // Semantic
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  // Rôles
  admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  staff: "bg-brand-500/10 text-brand-500 border-brand-500/20",
  // Default
  default: "bg-zinc-600/20 text-zinc-300 border-zinc-600/30",
  secondary: "bg-zinc-600/20 text-zinc-300 border-zinc-600/30",
};

export function Badge({ children, variant = "default", className, ...props }) {
  const colorClass = badgeVariants[variant] || badgeVariants.default;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold backdrop-blur-sm",
        colorClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
