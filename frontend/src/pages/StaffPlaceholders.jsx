import { motion } from "framer-motion";
import { Armchair, ClipboardList, GlassWater } from "lucide-react";

const config = {
  tables: { icon: Armchair, title: "Salles & Tables", desc: "Plan de salle interactif, statuts des tables en temps reel, vue par zones" },
  commandes: { icon: ClipboardList, title: "Commandes", desc: "Prise de commande, suivi, historique et changement de statut" },
  bar: { icon: GlassWater, title: "Bar Display", desc: "Ecran bar — boissons a preparer avec timer" },
};

export function StaffPlaceholder({ page }) {
  const c = config[page] || config.tables;
  const Icon = c.icon;

  return (
    <div className="p-6 lg:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 mb-6 mx-auto">
          <Icon size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{c.title}</h1>
        <p className="mt-3 text-gray-500 max-w-md mx-auto leading-relaxed">{c.desc}</p>
        <p className="mt-8 text-sm text-gray-400">En attente de developpement</p>
      </motion.div>
    </div>
  );
}
