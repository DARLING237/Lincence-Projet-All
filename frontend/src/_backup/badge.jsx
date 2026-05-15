import { cn } from "../../lib/utils";

const badgeVariants = {
  // General
  libree: "bg-emerald-100 text-emerald-700 border-emerald-200",
  reservee: "bg-amber-100 text-amber-700 border-amber-200",
  occupee: "bg-red-100 text-red-700 border-red-200",
  // Commandes
  "en attente": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "en preparation": "bg-blue-100 text-blue-700 border-blue-200",
  servie: "bg-green-100 text-green-700 border-green-200",
  payee: "bg-emerald-100 text-emerald-700 border-emerald-200",
  annulee: "bg-gray-100 text-gray-600 border-gray-200",
  // Personnel
  present: "bg-green-100 text-green-700 border-green-200",
  absent: "bg-red-100 text-red-700 border-red-200",
  conge: "bg-purple-100 text-purple-700 border-purple-200",
  // Impots
  "en retard": "bg-red-100 text-red-700 border-red-200",
  // Default
  default: "bg-gray-100 text-gray-600 border-gray-200",
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
