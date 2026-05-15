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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 mb-6 mx-auto">
          <Icon size={36} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{c.title}</h1>
        <p className="mt-2 text-gray-500 max-w-md mx-auto">{c.desc}</p>
        <p className="mt-6 text-sm text-gray-400">Page en attente de développement</p>
      </motion.div>
    </div>
  );
}
