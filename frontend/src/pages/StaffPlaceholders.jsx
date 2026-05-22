import { motion } from "framer-motion";
import { Armchair, ClipboardList, GlassWater } from "lucide-react";

const config = {
  tables: { icon: Armchair, title: "Salles & Tables", desc: "Plan de salle interactif, statuts des tables en temps réel, vue par zones" },
  commandes: { icon: ClipboardList, title: "Commandes", desc: "Prise de commande, suivi, historique et changement de statut" },
  bar: { icon: GlassWater, title: "Bar Display", desc: "Écran bar — boissons à préparer avec timer" },
};

export function StaffPlaceholder({ page }) {
  const c = config[page] || config.tables;
  const Icon = c.icon;

  return (
    <div className="p-6 lg:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-zinc-900/50 backdrop-blur-md border border-white/5 p-12 rounded-3xl shadow-xl max-w-md w-full">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-500 mb-6 mx-auto shadow-inner">
          <Icon size={40} />
        </div>
        <h1 className="text-3xl font-black text-zinc-50">{c.title}</h1>
        <p className="mt-4 text-sm font-medium text-zinc-400 mx-auto leading-relaxed">{c.desc}</p>
        <p className="mt-8 text-xs font-bold text-zinc-600 uppercase tracking-widest">En attente de développement</p>
      </motion.div>
    </div>
  );
}
