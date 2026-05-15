import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { formatMontant } from "../data/mockData";
import {
  ClipboardList,
  Clock,
  TrendingUp,
  AlertCircle,
  Armchair,
  GlassWater,
  ChevronRight,
  Plus,
  UtensilsCrossed,
  Utensils,
  Coffee,
} from "lucide-react";

const colorClasses = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600" },
  violet: { bg: "bg-violet-50", text: "text-violet-600" },
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
};
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
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500 mb-0.5">{greeting()},</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.prenom} {user?.nom}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.poste} — {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/staff/commandes")}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
        >
          <Plus size={16} />
          Nouvelle commande
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {[
          { label: "Mes commandes", value: mesCommandes.length, icon: ClipboardList, color: "emerald", delta: `${stats.commandesDuJour} aujourd'hui` },
          { label: "CA du jour", value: formatMontant(stats.caJour), icon: TrendingUp, color: "amber", delta: `vs ${formatMontant(stats.caJourPrecedent)} hier` },
          { label: "Tables libres", value: tablesLibres, icon: Armchair, color: "violet", delta: `sur ${tables.length}` },
          { label: "Temps moyen prep", value: `${stats.panierMoyen ? Math.round(stats.panierMoyen / 1000) : 0} min`, icon: Clock, color: "blue", delta: "Moy. par commande" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colorClasses[stat.color]?.bg || "bg-gray-50"}`}>
                <stat.icon size={18} className={colorClasses[stat.color]?.text || "text-gray-600"} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.delta}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Mes commandes en cours */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-emerald-600" />
              <h3 className="text-sm font-semibold text-gray-900">Commandes en cours</h3>
            </div>
            <span className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
              Toutes <ChevronRight size={14} />
            </span>
          </div>

          {commandes.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {commandes.slice(0, 5).map((cmd) => (
                <div key={cmd.id} className="px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">#{cmd.id}</span>
                      <Badge variant={cmd.statut}>{cmd.statut}</Badge>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatMontant(cmd.total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Table {cmd.table} · {cmd.temps} min</span>
                    <span>{cmd.heure}</span>
                  </div>
                  {/* Items preview */}
                  {cmd.items && cmd.items.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {cmd.items.slice(0, 3).map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-gray-50 rounded-full px-2 py-0.5 text-xs text-gray-600">
                          <GlassWater size={10} />
                          {item.nom} × {item.qte}
                        </span>
                      ))}
                      {cmd.items.length > 3 && (
                        <span className="text-xs text-gray-400">+{cmd.items.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <UtensilsCrossed size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">Aucune commande en cours</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions + Status */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Accès rapide</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Armchair, label: "Voir la salle", labelSub: "Plan de salle", color: "from-violet-500 to-purple-600", route: "/staff/tables" },
                { icon: GlassWater, label: "Bar Display", labelSub: "Boissons à servir", color: "from-blue-500 to-cyan-600", route: "/staff/bar" },
                { icon: Plus, label: "Nouvelle commande", labelSub: "Prendre une commande", color: "from-emerald-500 to-teal-600", route: "/staff/commandes" },
              ].map((action) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(action.route)}
                  className="flex flex-col items-center gap-2 rounded-xl bg-gray-50 p-4 hover:bg-gray-100 transition-colors cursor-pointer text-center text-left"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg`}>
                    <action.icon size={20} />
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{action.label}</p>
                  <p className="text-[10px] text-gray-400">{action.labelSub}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* État salle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-3">État des tables</h3>
            <div className="space-y-2">
              {[
                { zone: "Salle principale", icon: UtensilsCrossed, tables: tables.filter((t) => t.zone === "Salle principale") },
                { zone: "Terrasse", icon: Coffee, tables: tables.filter((t) => t.zone === "Terrasse") },
                { zone: "VIP", icon: Utensils, tables: tables.filter((t) => t.zone === "VIP") },
              ].map((zone) => (
                <div key={zone.zone} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <zone.icon size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{zone.zone}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {zone.tables.map((t) => (
                      <div
                        key={t.id}
                        className={`flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold text-white ${
                          t.statut === "libre"
                            ? "bg-emerald-500"
                            : t.statut === "occupee"
                            ? "bg-red-500"
                            : "bg-amber-500"
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
