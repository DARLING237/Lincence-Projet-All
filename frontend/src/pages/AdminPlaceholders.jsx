import { motion } from "framer-motion";
import { BarChart3, Users, Package, BookOpen, QrCode } from "lucide-react";

const config = {
  finances: { icon: BarChart3, title: "Finances", desc: "CA, dépenses, bénéfice, impôts et rapports détaillés" },
  personnel: { icon: Users, title: "Personnel & Salaires", desc: "Fiches employés, pointages, paie mensuelle" },
  stock: { icon: Package, title: "Stock & Fournisseurs", desc: "Inventaire, alertes, ravitaillements et suivi fournisseurs" },
  menu: { icon: BookOpen, title: "Menu", desc: "Gestion des produits, catégories, prix et disponibilités" },
  qrcodes: { icon: QrCode, title: "QR Codes", desc: "Génération et gestion des QR codes par table" },
};

export function AdminPlaceholder({ page }) {
  const c = config[page] || config.finances;
  const Icon = c.icon;

  return (
    <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-zinc-900/50 backdrop-blur-md border border-white/5 p-12 rounded-3xl shadow-xl max-w-md w-full">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-500 mb-6 mx-auto shadow-inner">
          <Icon size={36} />
        </div>
        <h1 className="text-2xl font-black text-zinc-50">{c.title}</h1>
        <p className="mt-3 text-sm font-medium text-zinc-400 mx-auto">{c.desc}</p>
        <p className="mt-8 text-xs font-bold text-zinc-600 uppercase tracking-widest">Page en attente de développement</p>
      </motion.div>
    </div>
  );
}
