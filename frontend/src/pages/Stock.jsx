import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { formatMontant } from "../data/mockData";
import { Badge } from "../components/ui/badge";
import {
  Package, AlertTriangle, Truck, Search, ArrowUpRight, TrendingDown,
  ClipboardList, FileText, Calendar, MapPin, Phone, Mail, Building2, Plus, X, Check,
  DollarSign, Pencil,
} from "lucide-react";

export function Stock() {
  const alertesStock = useAppStore((s) => s.alertesStock);
  const stockProduits = useAppStore((s) => s.stockProduits);
  const fournisseurs = useAppStore((s) => s.fournisseurs);
  const ravitaillements = useAppStore((s) => s.ravitaillements);
  const createRavitaillement = useAppStore((s) => s.createRavitaillement);
  const updateStockIngredient = useAppStore((s) => s.updateStockIngredient);
  const createStockIngredient = useAppStore((s) => s.createStockIngredient);
  const [tab, setTab] = useState("stock");
  const [searchStock, setSearchStock] = useState("");
  const [searchFournisseur, setSearchFournisseur] = useState("");
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [showRavitaillModal, setShowRavitaillModal] = useState(false);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [editIngredient, setEditIngredient] = useState(null);
  const [ravForm, setRavForm] = useState({ fournisseur_id: "", details: [{ produit_stock_id: "", quantite: 1, prix: 0 }] });

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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Stock & Fournisseurs</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestion des stocks et suivi des livraisons</p>
        </div>
        <motion.button whileTap={{ scale: 0.96 }}
          onClick={() => setShowRavitaillModal(true)}
          className="flex items-center gap-2 h-11 px-5 rounded-lg bg-brand-500 text-black text-sm font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
          <Truck size={18} />
          Nouveau ravitaillement
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: "Produits en stock", value: stockProduits.length, icon: Package },
          { label: "Stock OK", value: stockOk, icon: Check },
          { label: "Alertes", value: alertesCount, icon: AlertTriangle },
          { label: "Fournisseurs", value: fournisseurs.length, icon: Truck },
        ].map((s) => (
          <motion.div key={s.label} variants={itemVariants} initial="hidden" animate="show" className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/5 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{s.label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                <s.icon size={16} className="text-zinc-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-50">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Alertes Banner */}
      {alertesCount > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-red-500">
                {alertesCount} produit(s) en rupture imminente — Commande urgente requise
              </p>
              <p className="text-xs font-medium text-red-400/80 mt-1">
                {alertesStock.map((a) => `${a.produit} (${a.stockActuel} restant${a.stockActuel > 1 ? "s" : ""})`).join(" · ")}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-zinc-900/50 backdrop-blur-md rounded-xl p-1 mb-6 w-fit border border-white/5">
        <button onClick={() => setTab("stock")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === "stock" ? "bg-brand-500 text-black shadow-md shadow-brand-500/20" : "text-zinc-400 hover:text-zinc-100"}`}>
          Stock ({stockProduits.length})
        </button>
        <button onClick={() => setTab("fournisseurs")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === "fournisseurs" ? "bg-brand-500 text-black shadow-md shadow-brand-500/20" : "text-zinc-400 hover:text-zinc-100"}`}>
          Fournisseurs ({fournisseurs.length})
        </button>
      </div>

      {/* ── Tab: Stock ── */}
      {tab === "stock" && (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="relative w-80">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input value={searchStock} onChange={(e) => setSearchStock(e.target.value)} placeholder="Rechercher un produit..." className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 text-zinc-100 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
            </div>
            <button onClick={() => setShowAddIngredient(true)}
              className="flex items-center gap-1.5 h-11 px-4 rounded-xl bg-zinc-800 text-zinc-200 border border-white/5 hover:bg-zinc-700 hover:text-white transition-all text-sm font-bold shadow-sm">
              <Plus size={16} /> Ajouter Ingrédient
            </button>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/5 shadow-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-950/50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Produit</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Stock actuel</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Stock min</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Unité</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Dernier Prix d'Achat</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider hidden sm:table-cell">Dernier ravitaillement</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStock.map((prod) => {

                  const isAlert = prod.stockActuel < prod.stockMin;
                  return (
                    <tr key={prod.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-zinc-50">{prod.nom}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold text-lg ${isAlert ? "text-red-500" : "text-zinc-50"}`}>{prod.stockActuel}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-zinc-400">{prod.stockMin}</td>
                      <td className="px-6 py-4 text-center font-medium text-zinc-400">{prod.unite}</td>
                      <td className="px-6 py-4 text-right font-bold text-brand-500">
                        {prod.dernierPrixAchat && parseFloat(prod.dernierPrixAchat) > 0 ? formatMontant(prod.dernierPrixAchat) : "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isAlert ? (
                          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-500 border border-red-500/20">Rupture</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/20">OK</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 hidden sm:table-cell font-medium">{prod.dernierRavitaillement}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => setEditIngredient(prod)}
                          className="h-8 w-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 inline-flex items-center justify-center transition-colors">
                          <Pencil size={14} />
                        </button>
                      </td>
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
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          {/* Search */}
          <div className="relative w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={searchFournisseur} onChange={(e) => setSearchFournisseur(e.target.value)} placeholder="Rechercher un fournisseur..." className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 text-zinc-100 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredFournisseurs.map((f) => (
              <motion.div key={f.id} variants={itemVariants}
                onClick={() => setSelectedFournisseur(f)}
                className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/5 p-5 shadow-lg card-hover cursor-pointer flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-black font-bold text-sm shadow-[0_0_15px_rgba(212,168,83,0.3)]">
                    {f.nom.substring(0, 3).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-zinc-50 truncate">{f.nom}</p>
                    <p className="text-xs font-medium text-zinc-400">{f.type}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400 mt-auto">
                  {f.livraisons > 0 && (
                    <div className="bg-zinc-800 rounded-xl p-2.5 text-center border border-white/5">
                      <Truck size={14} className="mx-auto text-zinc-500 mb-1.5" />
                      <span className="font-bold text-zinc-100 block">{f.livraisons}</span>
                      <span className="opacity-80">livraisons</span>
                    </div>
                  )}
                  {f.totalAchats > 0 && (
                    <div className="bg-zinc-800 rounded-xl p-2.5 text-center border border-white/5">
                      <DollarSign size={14} className="mx-auto text-zinc-500 mb-1.5" />
                      <span className="font-bold text-brand-500 block">{formatMontant(f.totalAchats)}</span>
                      <span className="opacity-80">total</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent ravitaillements */}
          <motion.div variants={itemVariants} className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/5 shadow-lg overflow-hidden">
            <div className="border-b border-white/5 px-6 py-5 bg-zinc-950/30">
              <h3 className="text-base font-bold text-zinc-50">Ravitaillements Récents</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-950/50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Fournisseur</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Facture</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ravitaillements.map((rav) => (
                  <tr key={rav.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-50">{rav.fournisseur}</td>
                    <td className="px-6 py-4 font-medium text-zinc-400">{rav.date}</td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">{rav.nb_facture || "—"}</td>
                    <td className="px-6 py-4 text-right font-bold text-brand-500">{formatMontant(rav.montant)}</td>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => setShowRavitaillModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[640px] bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-900/50">
                <h3 className="text-lg font-bold text-zinc-50 flex items-center gap-2"><Truck size={20} className="text-brand-500" /> Nouveau ravitaillement</h3>
                <button onClick={() => setShowRavitaillModal(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Fournisseur</label>
                  <select value={ravForm.fournisseur_id} onChange={(e) => setRavForm({ ...ravForm, fournisseur_id: +e.target.value })}
                    className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 text-zinc-100 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all">
                    <option value="">Sélectionner un fournisseur...</option>
                    {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Produits &amp; quantités</label>
                  <div className="space-y-3">
                    {ravForm.details.map((det, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <select value={det.produit_stock_id} onChange={(e) => {
                          const newDetails = [...ravForm.details];
                          newDetails[i] = { ...det, produit_stock_id: +e.target.value };
                          setRavForm({ ...ravForm, details: newDetails });
                        }} className="h-11 flex-1 rounded-xl border border-white/10 bg-zinc-900 text-zinc-100 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all">
                          <option value="">Produit...</option>
                          {stockProduits.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                        </select>
                        <input type="number" min="1" placeholder="Qté" value={det.quantite} onChange={(e) => {
                          const newDetails = [...ravForm.details];
                          newDetails[i] = { ...det, quantite: +e.target.value };
                          setRavForm({ ...ravForm, details: newDetails });
                        }} className="h-11 w-20 rounded-xl border border-white/10 bg-zinc-900 text-zinc-100 px-2 text-center font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                        <input type="number" min="0" placeholder="Prix (F)" value={det.prix || ""} onChange={(e) => {
                          const newDetails = [...ravForm.details];
                          newDetails[i] = { ...det, prix: +e.target.value };
                          setRavForm({ ...ravForm, details: newDetails });
                        }} className="h-11 w-28 rounded-xl border border-white/10 bg-zinc-900 text-zinc-100 px-3 text-right font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-zinc-600" />
                        {ravForm.details.length > 1 && (
                          <button onClick={() => {
                            const newDetails = ravForm.details.filter((_, j) => j !== i);
                            setRavForm({ ...ravForm, details: newDetails });
                          }} className="h-11 w-11 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => setRavForm({ ...ravForm, details: [...ravForm.details, { produit_stock_id: "", quantite: 1, prix: 0 }] })}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-500 hover:text-brand-400 mt-2 transition-colors">
                      <Plus size={16} /> Ajouter un produit
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <button onClick={() => {
                    if (!ravForm.fournisseur_id) return;
                    const validDetails = ravForm.details.filter((d) => d.produit_stock_id && d.quantite > 0);
                    if (validDetails.length === 0) return;
                    createRavitaillement({ ...ravForm, details: validDetails });
                    setRavForm({ fournisseur_id: "", details: [{ produit_stock_id: "", quantite: 1, prix: 0 }] });
                    setShowRavitaillModal(false);
                  }}
                    className="w-full h-12 rounded-xl bg-brand-500 text-black text-base font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
                    Valider le ravitaillement
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Fournisseur Detail Modal ── */}
      <AnimatePresence>
        {selectedFournisseur && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => setSelectedFournisseur(null)} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[480px] bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-900/50">
                <h3 className="text-lg font-bold text-zinc-50">Fiche fournisseur</h3>
                <button onClick={() => setSelectedFournisseur(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 bg-zinc-900 rounded-xl p-4 border border-white/5">
                  <div className="h-12 w-12 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 text-brand-500">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-zinc-50">{selectedFournisseur.nom}</h4>
                    <p className="text-sm font-medium text-zinc-400">{selectedFournisseur.type}</p>
                  </div>
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
                    <div key={info.label} className="bg-zinc-900 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <info.icon size={14} className="text-brand-500" />
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{info.label}</span>
                      </div>
                      <p className="text-sm font-bold text-zinc-100 truncate">{info.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Add Ingredient Modal ── */}
      <AnimatePresence>
        {showAddIngredient && (
          <StockIngredientModal
            ingredient={null}
            onSave={(data) => createStockIngredient(data)}
            onClose={() => setShowAddIngredient(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Edit Ingredient Modal ── */}
      <AnimatePresence>
        {editIngredient && (
          <StockIngredientModal
            ingredient={editIngredient}
            onSave={(data) => updateStockIngredient(editIngredient.id, data)}
            onClose={() => setEditIngredient(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StockIngredientModal({ ingredient, onSave, onClose }) {
  const [form, setForm] = useState(() => ingredient || {
    nom: "", unite: "Kg", stockActuel: 0, stockMin: 0
  });

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/85 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[480px] bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-900/50">
          <h3 className="text-lg font-bold text-zinc-50">{ingredient ? "Modifier l'ingrédient" : "Nouvel ingrédient"}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          {!ingredient && (
            <>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Nom de l'ingrédient</label>
                <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex: Filet de Boeuf"
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Unité de mesure</label>
                <select value={form.unite} onChange={(e) => setForm({ ...form, unite: e.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all">
                  <option value="Kg">Kilogrammes (Kg)</option>
                  <option value="Litre">Litres (L)</option>
                  <option value="Regime">Régimes</option>
                  <option value="Sac">Sacs</option>
                  <option value="Alveole">Alvéoles</option>
                  <option value="Boite">Boîtes</option>
                  <option value="Piece">Pièces</option>
                </select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Stock Actuel</label>
              <input type="number" min="0" step="0.01" value={form.stockActuel} onChange={(e) => setForm({ ...form, stockActuel: +e.target.value })}
                className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Seuil de Rupture (Min)</label>
              <input type="number" min="0" step="0.01" value={form.stockMin} onChange={(e) => setForm({ ...form, stockMin: +e.target.value })}
                className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
            </div>
          </div>

          <div className="pt-2">
            <button onClick={() => { onSave(form); onClose(); }}
              disabled={!form.nom && !ingredient}
              className="w-full h-12 rounded-xl bg-brand-500 text-black text-base font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] disabled:opacity-40 transition-all">
              {ingredient ? "Enregistrer les modifications" : "Créer l'ingrédient"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
