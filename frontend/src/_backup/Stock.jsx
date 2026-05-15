import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { formatMontant } from "../data/mockData";
import { Badge } from "../components/ui/badge";
import {
  Package, AlertTriangle, Truck, Search, ArrowUpRight, TrendingDown,
  ClipboardList, FileText, Calendar, MapPin, Phone, Mail, Building2, Plus, X, Check,
  DollarSign,
} from "lucide-react";

const colorClasses = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-500" },
  red: { bg: "bg-red-50", text: "text-red-500" },
  amber: { bg: "bg-amber-50", text: "text-amber-500" },
};

export function Stock() {
  const alertesStock = useAppStore((s) => s.alertesStock);
  const stockProduits = useAppStore((s) => s.stockProduits);
  const fournisseurs = useAppStore((s) => s.fournisseurs);
  const ravitaillements = useAppStore((s) => s.ravitaillements);
  const createRavitaillement = useAppStore((s) => s.createRavitaillement);
  const [tab, setTab] = useState("stock");
  const [searchStock, setSearchStock] = useState("");
  const [searchFournisseur, setSearchFournisseur] = useState("");
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [showRavitaillModal, setShowRavitaillModal] = useState(false);
  const [ravForm, setRavForm] = useState({ fournisseur_id: "", details: [{ produit_stock_id: "", quantite: 1 }] });

  const fetchStock = useAppStore((s) => s.fetchStock);
  const fetchAlertesStock = useAppStore((s) => s.fetchAlertesStock);
  const fetchRavitaillements = useAppStore((s) => s.fetchRavitaillements);
  const fetchFournisseurs = useAppStore((s) => s.fetchFournisseurs);

  useEffect(() => {
    fetchStock();
    fetchAlertesStock();
    fetchRavitaillements();
    fetchFournisseurs();
  }, [fetchStock, fetchAlertesStock, fetchRavitaillements, fetchFournisseurs]);

  const filteredStock = stockProduits.filter((p) =>
    !searchStock || p.nom.toLowerCase().includes(searchStock.toLowerCase())
  );
  const filteredFournisseurs = fournisseurs.filter((f) =>
    !searchFournisseur || f.nom.toLowerCase().includes(searchFournisseur.toLowerCase())
  );

  const alertesCount = alertesStock.length;
  const stockOk = stockProduits.filter((p) => p.stockActuel >= p.stockMin).length;
  const totalRavitaillements = ravitaillements.length;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock & Fournisseurs</h1>
          <p className="text-sm text-gray-500">Gestion des stocks et suivi des livraisons</p>
        </div>
        <motion.button whileTap={{ scale: 0.96 }}
          onClick={() => setShowRavitaillModal(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/20">
          <Truck size={16} />
          Nouveau ravitaillement
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: "Produits en stock", value: stockProduits.length, color: "indigo", icon: Package },
          { label: "Stock OK", value: stockOk, color: "emerald", icon: Check },
          { label: "Alertes", value: alertesCount, color: "red", icon: AlertTriangle },
          { label: "Fournisseurs", value: fournisseurs.length, color: "amber", icon: Truck },
        ].map((s) => (
          <motion.div key={s.label} variants={itemVariants} initial="hidden" animate="show" className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">{s.label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50">
                <s.icon size={14} className={`text-${s.color}-500`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Alertes Banner */}
      {alertesCount > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-3">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-700">
                {alertesCount} produit(s) en rupture imminente — Commande urgente requise
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                {alertesStock.map((a) => `${a.produit} (${a.stockActuel} restant${a.stockActuel > 1 ? "s" : ""})`).join(" · ")}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button onClick={() => setTab("stock")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "stock" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          Stock ({stockProduits.length})
        </button>
        <button onClick={() => setTab("fournisseurs")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "fournisseurs" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          Fournisseurs ({fournisseurs.length})
        </button>
      </div>

      {/* ── Tab: Stock ── */}
      {tab === "stock" && (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <div className="mb-4">
            <div className="relative w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchStock} onChange={(e) => setSearchStock(e.target.value)} placeholder="Rechercher un produit..." className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Produit</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stock actuel</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stock min</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Unité</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Dernier ravitaillement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStock.map((prod) => {
                  const isAlert = prod.stockActuel < prod.stockMin;
                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{prod.nom}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${isAlert ? "text-red-600" : "text-gray-900"}`}>{prod.stockActuel}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">{prod.stockMin}</td>
                      <td className="px-6 py-4 text-center text-gray-400">{prod.unite}</td>
                      <td className="px-6 py-4 text-center">
                        {isAlert ? (
                          <Badge variant="en retard">Rupture</Badge>
                        ) : (
                          <Badge variant="payee">OK</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">{prod.dernierRavitaillement}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Tab: Fournisseurs ── */}
      {tab === "fournisseurs" && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          {/* Search */}
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchFournisseur} onChange={(e) => setSearchFournisseur(e.target.value)} placeholder="Rechercher..." className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredFournisseurs.map((f) => (
              <motion.div key={f.id} variants={itemVariants}
                onClick={() => setSelectedFournisseur(f)}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs">
                    {f.nom.substring(0, 3).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{f.nom}</p>
                    <p className="text-xs text-gray-400">{f.type}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                  {f.livraisons > 0 && (
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <Truck size={12} className="mx-auto text-gray-400 mb-1" />
                      <span className="font-semibold text-gray-900">{f.livraisons}</span>
                      <p>livraisons</p>
                    </div>
                  )}
                  {f.totalAchats > 0 && (
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <DollarSign size={12} className="mx-auto text-gray-400 mb-1" />
                      <span className="font-semibold text-gray-900">{formatMontant(f.totalAchats)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent ravitaillements */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900">Ravitaillements Récents</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fournisseur</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Facture</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ravitaillements.map((rav) => (
                  <tr key={rav.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{rav.fournisseur}</td>
                    <td className="px-6 py-3 text-gray-500">{rav.date}</td>
                    <td className="px-6 py-3 text-gray-500 font-mono text-xs">{rav.nbFacture}</td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-900">{formatMontant(rav.montant)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      )}

      {/* ── Ravitaillement Modal ── */}
      <AnimatePresence>
        {showRavitaillModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowRavitaillModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[520px] bg-white rounded-2xl shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">Nouveau ravitaillement</h3>
                <button onClick={() => setShowRavitaillModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Fournisseur</label>
                  <select value={ravForm.fournisseur_id} onChange={(e) => setRavForm({ ...ravForm, fournisseur_id: +e.target.value })}
                    className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100">
                    <option value="">Sélectionner...</option>
                    {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Produits &amp; quantités</label>
                  <div className="space-y-2">
                    {ravForm.details.map((det, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <select value={det.produit_stock_id} onChange={(e) => {
                          const newDetails = [...ravForm.details];
                          newDetails[i] = { ...det, produit_stock_id: +e.target.value };
                          setRavForm({ ...ravForm, details: newDetails });
                        }} className="h-9 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100">
                          <option value="">Produit...</option>
                          {stockProduits.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                        </select>
                        <input type="number" min="1" value={det.quantite} onChange={(e) => {
                          const newDetails = [...ravForm.details];
                          newDetails[i] = { ...det, quantite: +e.target.value };
                          setRavForm({ ...ravForm, details: newDetails });
                        }} className="h-9 w-20 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                        {ravForm.details.length > 1 && (
                          <button onClick={() => {
                            const newDetails = ravForm.details.filter((_, j) => j !== i);
                            setRavForm({ ...ravForm, details: newDetails });
                          }} className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => setRavForm({ ...ravForm, details: [...ravForm.details, { produit_stock_id: "", quantite: 1 }] })}
                      className="text-xs text-indigo-600 font-medium hover:text-indigo-700">
                      + Ajouter produit
                    </button>
                  </div>
                </div>
                <button onClick={() => {
                  if (!ravForm.fournisseur_id) return;
                  const validDetails = ravForm.details.filter((d) => d.produit_stock_id && d.quantite > 0);
                  if (validDetails.length === 0) return;
                  createRavitaillement({ ...ravForm, details: validDetails });
                  setRavForm({ fournisseur_id: "", details: [{ produit_stock_id: "", quantite: 1 }] });
                  setShowRavitaillModal(false);
                }}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/20">
                  Valider
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Fournisseur Detail Modal ── */}
      <AnimatePresence>
        {selectedFournisseur && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedFournisseur(null)} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[480px] bg-white rounded-2xl shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">Fiche fournisseur</h3>
                <button onClick={() => setSelectedFournisseur(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 size={20} className="text-indigo-600" />
                  <h4 className="text-lg font-bold text-gray-900">{selectedFournisseur.nom}</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Phone, label: "Contact", value: selectedFournisseur.contact },
                    { icon: Mail, label: "Email", value: selectedFournisseur.email },
                    { icon: MapPin, label: "Adresse", value: selectedFournisseur.adresse },
                    { icon: Truck, label: "Type", value: selectedFournisseur.type },
                    { icon: ArrowUpRight, label: "Livraisons", value: `${selectedFournisseur.livraisons}` },
                    { icon: DollarSign, label: "Total achats", value: formatMontant(selectedFournisseur.totalAchats) },
                  ].map((info) => (
                    <div key={info.label} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <info.icon size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-400">{info.label}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{info.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
