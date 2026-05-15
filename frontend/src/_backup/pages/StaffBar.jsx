import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import {
  GlassWater, Clock, Check, AlertTriangle, X, UtensilsCrossed, Wine,
} from "lucide-react";
import { Badge } from "../components/ui/badge";

function DrinkTicket({ ordre, onComplete, onCancel }) {
  const [elapsed, setElapsed] = useState(ordre.temps || 0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const isUrgent = elapsed >= 10;
  const isMedium = elapsed >= 5 && elapsed < 10;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`rounded-2xl border ${isUrgent ? "border-red-200 bg-red-50 animate-pulse" : isMedium ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"} p-5 shadow-sm`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-900">#{ordre.id}</span>
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <GlassWater size={14} /> Table {ordre.table}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-medium border ${
          isUrgent ? "bg-red-100 border-red-200 text-red-600" : isMedium ? "bg-amber-100 border-amber-200 text-amber-600" : "bg-emerald-100 border-emerald-200 text-emerald-600"
        }`}>
          <Clock size={11} />
          {elapsed} min
        </div>
      </div>

      {/* Drink Items */}
      <div className="space-y-2 mb-5">
        {ordre.items.filter((i) => i.type_poste === "bar").map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-blue-600 flex-shrink-0">
              ×{item.qte}
            </span>
            <span className="text-gray-900 font-medium flex-1 text-sm">{item.nom}</span>
          </div>
        ))}
        {isUrgent && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-red-200">
            <AlertTriangle size={14} className="text-red-500" />
            <span className="text-xs text-red-500 font-medium">En retard — Priorité haute</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => onComplete(ordre.id)}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-medium text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-shadow">
          <Check size={16} />
          Servi
        </button>
        <button onClick={() => onCancel(ordre.id)}
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-100 text-red-500 hover:bg-red-50 transition-colors">
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}

export function StaffBar() {
  const commandes = useAppStore((s) => s.commandesEnCours);
  const updateStatut = useAppStore((s) => s.updateCommandeStatut);
  const [_, setNow] = useState(0);

  const fetchCommandesEnCours = useAppStore((s) => s.fetchCommandesEnCours);

  useEffect(() => {
    fetchCommandesEnCours();
  }, [fetchCommandesEnCours]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const barCommandes = commandes
    .filter((c) => c.items.some((i) => i.type_poste === "bar") && c.statut !== "payee" && c.statut !== "annulee")
    .sort((a, b) => a.temps - b.temps);

  const stats = {
    total: barCommandes.length,
    enAttente: barCommandes.filter((c) => c.statut === "en attente").length,
    enPrep: barCommandes.filter((c) => c.statut === "en preparation").length,
    cocktails: barCommandes.filter((c) => c.items.some((i) => i.type_poste === "bar" && i.nom.toLowerCase().includes("cocktail") || i.nom.toLowerCase().includes("mojito") || i.nom.toLowerCase().includes("spritz"))).length,
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/20">
            <Wine size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bar</h1>
            <p className="text-sm text-gray-500">{stats.total} commandes en cours</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "emerald" },
          { label: "En attente", value: stats.enAttente, color: "amber" },
          { label: "En prep.", value: stats.enPrep, color: "blue" },
          { label: "Cocktails", value: stats.cocktails, color: "violet" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tickets Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {barCommandes.map((cmd) => (
            <DrinkTicket
              key={cmd.id}
              ordre={cmd}
              onComplete={(id) => updateStatut(id, "servie")}
              onCancel={(id) => updateStatut(id, "annulee")}
            />
          ))}
        </AnimatePresence>
        {barCommandes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-24">
            <UtensilsCrossed size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg">Aucune boisson à préparer</p>
            <p className="text-gray-300 text-sm mt-1">Les commandes apparaîtront ici</p>
          </div>
        )}
      </div>
    </div>
  );
}
