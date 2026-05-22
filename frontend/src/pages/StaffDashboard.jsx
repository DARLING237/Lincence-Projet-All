import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { formatMontant } from "../data/mockData";
import {
  ClipboardList,
  Clock,
  TrendingUp,
  Armchair,
  GlassWater,
  ChevronRight,
  Plus,
  UtensilsCrossed,
  Utensils,
  Coffee,
} from "lucide-react";
import { Badge } from "../components/ui/badge";

export function StaffDashboard() {
  const user = useAppStore((s) => s.user);
  const stats = useAppStore((s) => s.statsStaff);
  const commandes = useAppStore((s) => s.commandesEnCours);
  const tables = useAppStore((s) => s.tables);
  const navigate = useNavigate();

  const fetchCommandesEnCours = useAppStore((s) => s.fetchCommandesEnCours);
  const fetchStatsJournalier = useAppStore((s) => s.fetchStatsJournalier);
  const fetchTables = useAppStore((s) => s.fetchTables);

  useEffect(() => {
    fetchCommandesEnCours();
    fetchStatsJournalier();
    fetchTables();
  }, [fetchCommandesEnCours, fetchStatsJournalier, fetchTables]);

  const mesCommandes = commandes.filter((c) => c.serveur === (user?.prenom || ""));
  const tablesLibres = tables.filter((t) => t.statut === "libre").length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-medium text-brand-500 mb-1 tracking-wide">{greeting()},</p>
          <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">
            {user?.prenom} {user?.nom}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {user?.poste} — {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/staff/commandes")}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-brand-500 text-black font-bold text-sm shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all"
        >
          <Plus size={18} />
          Nouvelle commande
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {[
          { label: "Mes commandes", value: mesCommandes.length, icon: ClipboardList, delta: `${stats.commandesDuJour} aujourd'hui` },
          { label: "CA du jour", value: formatMontant(stats.caJour), icon: TrendingUp, delta: `vs ${formatMontant(stats.caJourPrecedent)} hier` },
          { label: "Tables libres", value: tablesLibres, icon: Armchair, delta: `sur ${tables.length}` },
          { label: "Temps moyen prep", value: `${stats.tempsMoyenPrep ? Math.round(stats.tempsMoyenPrep / 60) : 0} min`, icon: Clock, delta: stats.tempsMoyenPrep ? "Moy. par commande" : "Pas de données" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-5 shadow-lg card-hover"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{stat.label}</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                <stat.icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-50">{stat.value}</p>
            <p className="text-xs font-medium text-zinc-500 mt-2">{stat.delta}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Mes commandes en cours */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md shadow-lg flex flex-col"
        >
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/10 rounded-lg">
                <ClipboardList size={18} className="text-brand-500" />
              </div>
              <h3 className="text-base font-semibold text-zinc-50">Commandes en cours</h3>
            </div>
            <button className="flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-400 transition-colors">
              Toutes <ChevronRight size={14} />
            </button>
          </div>

          {commandes.length > 0 ? (
            <div className="flex-1 overflow-auto divide-y divide-white/5">
              {commandes.slice(0, 5).map((cmd) => (
                <div key={cmd.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-zinc-100">#{cmd.id}</span>
                      <Badge variant={cmd.statut}>{cmd.statut}</Badge>
                    </div>
                    <span className="text-base font-bold text-zinc-50">{formatMontant(cmd.total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span className="font-medium">Table {cmd.table_nom || cmd.table} <span className="mx-2 text-zinc-600">•</span> {cmd.temps} min</span>
                    <span>{cmd.heure}</span>
                  </div>
                  {cmd.items && cmd.items.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {cmd.items.slice(0, 3).map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 bg-zinc-800/50 border border-white/5 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-300">
                          {item.type_poste === "cuisine" ? (
                            <UtensilsCrossed size={12} className="text-brand-500" />
                          ) : (
                            <GlassWater size={12} className="text-brand-500" />
                          )}
                          {item.nom} <span className="text-zinc-500">x{item.qte}</span>
                        </span>
                      ))}
                      {cmd.items.length > 3 && (
                        <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-zinc-500 bg-zinc-800/30">
                          +{cmd.items.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="h-16 w-16 mx-auto bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                 <UtensilsCrossed size={28} className="text-zinc-500" />
              </div>
              <p className="text-base font-medium text-zinc-300">Aucune commande en cours</p>
              <p className="text-sm text-zinc-500 mt-1">Les nouvelles commandes s'afficheront ici</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions + Status */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg"
          >
            <h3 className="text-base font-semibold text-zinc-50 mb-5">Accès rapide</h3>
            <div className="grid grid-cols-2 gap-4">
              {(() => {
                const actions = [
                  { icon: Armchair, label: "Voir la salle", labelSub: "Plan de salle", route: "/staff/tables" }
                ];
                
                if (!role || role === "admin" || role === "manager" || role === "serveur" || role === "caissier" || role === "cuisinier") {
                  actions.push({ icon: Utensils, label: "Cuisine Display", labelSub: "Plats à préparer", route: "/staff/kitchen" });
                }
                
                actions.push({ icon: Plus, label: "Nouvelle commande", labelSub: "Prendre une commande", route: "/staff/commandes", highlight: true });
                
                return actions.map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(action.route)}
                    className={`flex flex-col items-center gap-3 rounded-xl border p-5 transition-all text-center ${
                      action.highlight 
                        ? "col-span-2 bg-brand-500/10 border-brand-500/30 hover:bg-brand-500/20" 
                        : "bg-zinc-800/30 border-white/5 hover:bg-zinc-800/60 hover:border-white/10"
                    }`}
                  >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${
                    action.highlight
                      ? "bg-brand-500 text-black shadow-[0_0_15px_rgba(212,168,83,0.3)]"
                      : "bg-zinc-800 text-zinc-300 border border-white/5"
                  }`}>
                    <action.icon size={22} />
                  </div>
                  <div>
                     <p className={`text-sm font-bold ${action.highlight ? "text-brand-500" : "text-zinc-100"}`}>{action.label}</p>
                     <p className="text-xs font-medium text-zinc-500 mt-0.5">{action.labelSub}</p>
                  </div>
                </motion.button>
              ))
              })()}
            </div>
          </motion.div>

          {/* Etat salle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg"
          >
            <h3 className="text-base font-semibold text-zinc-50 mb-4">État des tables</h3>
            <div className="space-y-3">
              {[
                { zone: "Salle principale", icon: UtensilsCrossed, tables: tables.filter((t) => t.zone === "Salle principale") },
                { zone: "Terrasse", icon: Coffee, tables: tables.filter((t) => t.zone === "Terrasse") },
                { zone: "VIP", icon: Utensils, tables: tables.filter((t) => t.zone === "VIP") },
              ].map((zone) => (
                <div key={zone.zone} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-zinc-800/50 rounded-md border border-white/5">
                       <zone.icon size={14} className="text-zinc-400" />
                    </div>
                    <span className="text-sm font-medium text-zinc-300">{zone.zone}</span>
                  </div>
                  <div className="flex gap-2">
                    {zone.tables.map((t) => (
                      <div
                        key={t.id}
                        className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold shadow-sm ${
                          t.statut === "libre"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : t.statut === "occupee"
                            ? "bg-red-500 text-white"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                        title={t.numero}
                      >
                        {t.numero.split("").pop()}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
