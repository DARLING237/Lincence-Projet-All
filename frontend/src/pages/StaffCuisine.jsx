import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { UtensilsCrossed, Clock, Check, AlertTriangle, X, ChefHat } from "lucide-react";

function DishTicket({ ordre, onComplete, onCancel }) {
  const [elapsed, setElapsed] = useState(ordre.temps || 0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const isUrgent = elapsed >= 15; // Les plats prennent plus de temps que les boissons, urgence à 15 min
  const isMedium = elapsed >= 8 && elapsed < 15;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`rounded-2xl border p-5 shadow-lg backdrop-blur-md ${
        isUrgent
          ? "border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse"
          : isMedium
          ? "border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          : "border-white/5 bg-zinc-900/50"
      }`}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black text-zinc-50 tracking-tight">#{ordre.id}</span>
          <span className="flex items-center gap-1.5 text-sm font-bold text-zinc-400 bg-zinc-950 px-2 py-1 rounded-lg border border-white/5">
            <UtensilsCrossed size={14} className="text-brand-500" /> Table {ordre.table_nom || ordre.table}
          </span>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-black border shadow-inner ${
            isUrgent
              ? "bg-red-500/20 border-red-500/40 text-red-400"
              : isMedium
              ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
              : "bg-brand-500/10 border-brand-500/20 text-brand-500"
          }`}
        >
          <Clock size={12} />
          {elapsed} min
        </div>
      </div>

      {/* Dish Items */}
      <div className="space-y-2.5 mb-6 bg-zinc-950/50 p-4 rounded-xl border border-white/5 shadow-inner">
        {ordre.items &&
          ordre.items
            .filter((i) => i.type_poste === "cuisine")
            .map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 text-sm font-black text-brand-500 flex-shrink-0 border border-brand-500/30">
                  x{item.qte || item.quantite}
                </span>
                <span className="text-zinc-100 font-bold flex-1 text-sm">{item.nom}</span>
              </div>
            ))}
        {isUrgent && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-red-500/20">
            <AlertTriangle size={14} className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
            <span className="text-xs text-red-400 font-black uppercase tracking-wider">En retard — Priorité haute</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onComplete(ordre.id)}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-brand-500 text-black font-black text-sm shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all"
        >
          <Check size={18} />
          Prêt / Servi
        </button>
        <button
          onClick={() => onCancel(ordre.id)}
          className="flex items-center justify-center h-11 w-11 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 border border-red-500/20 hover:text-white transition-all shadow-sm"
        >
          <X size={20} className="font-bold" />
        </button>
      </div>
    </motion.div>
  );
}

export function StaffCuisine() {
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

  const cuisineCommandes = commandes
    .filter(
      (c) =>
        c.items &&
        c.items.some((i) => i.type_poste === "cuisine") &&
        c.statut !== "payee" &&
        c.statut !== "annulee" &&
        c.statut !== "servie"
    )
    .sort((a, b) => a.temps - b.temps);

  const stats = {
    total: cuisineCommandes.length,
    enAttente: cuisineCommandes.filter((c) => c.statut === "en attente").length,
    enPrep: cuisineCommandes.filter((c) => c.statut === "en preparation").length,
    platsChauds: cuisineCommandes.filter(
      (c) =>
        c.items &&
        c.items.some(
          (i) =>
            i.type_poste === "cuisine" && !/salade|glace|dessert|creme/i.test(i.nom)
        )
    ).length,
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 shadow-[0_0_15px_rgba(212,168,83,0.3)] border border-brand-500/20">
            <ChefHat size={28} className="text-black font-bold" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-50 tracking-tight">Cuisine</h1>
            <p className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-wider">{stats.total} commandes en cours</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Plats", value: stats.total },
          { label: "En attente", value: stats.enAttente },
          { label: "En cuisine", value: stats.enPrep },
          { label: "Plats Chauds", value: stats.platsChauds },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-5 shadow-lg flex flex-col items-center justify-center text-center"
          >
            <p className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">{s.label}</p>
            <p className="text-3xl font-black text-brand-500 drop-shadow-[0_0_5px_rgba(212,168,83,0.3)]">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tickets Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {cuisineCommandes.map((cmd) => (
            <DishTicket
              key={cmd.id}
              ordre={cmd}
              onComplete={(id) => updateStatut(id, "servie")}
              onCancel={(id) => updateStatut(id, "annulee")}
            />
          ))}
        </AnimatePresence>
        {cuisineCommandes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-32 bg-zinc-900/30 rounded-3xl border border-white/5 border-dashed">
            <div className="bg-zinc-800/50 p-6 rounded-full mb-6">
               <UtensilsCrossed size={56} className="text-zinc-600" />
            </div>
            <p className="text-zinc-300 font-bold text-xl mb-2">Aucun plat à préparer</p>
            <p className="text-zinc-500 text-sm font-medium">Les commandes de nourriture apparaîtront ici</p>
          </div>
        )}
      </div>
    </div>
  );
}
