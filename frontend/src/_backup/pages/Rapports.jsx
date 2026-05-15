import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { formatMontant } from "../data/mockData";
import { Badge } from "../components/ui/badge";
import {
  BarChart3, Calendar, TrendingUp, TrendingDown, Receipt, CreditCard,
  Smartphone, Banknote, Repeat, GlassWater, Download, Clock,
  ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, FileText,
} from "lucide-react";
import {
  BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend,
} from "recharts";

const periodTabs = [
  { id: "journalier", label: "Journalier", icon: Calendar },
  { id: "mensuel", label: "Mensuel", icon: BarChart3 },
  { id: "annuel", label: "Annuel", icon: FileText },
];

const paiementIcons = {
  especes: { icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50", hex: "#10B981" },
  mobile_money: { icon: Smartphone, color: "text-amber-600", bg: "bg-amber-50", hex: "#F59E0B" },
  carte: { icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50", hex: "#3B82F6" },
  transfert: { icon: Repeat, color: "text-purple-600", bg: "bg-purple-50", hex: "#8B5CF6" },
};

const paiementLabels = {
  especes: "Especes",
  mobile_money: "Mobile Money",
  carte: "Carte bancaire",
  transfert: "Transfert",
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-2 font-semibold text-gray-900">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatMontant(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function Rapports() {
  const fetchRapport = useAppStore((s) => s.fetchRapport);
  const [rapport, setRapport] = useState(null);
  const [period, setPeriod] = useState("journalier");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef(null);

  const loadRapport = useCallback(() => {
    setLoading(true);
    fetchRapport(period, selectedDate)
      .then((r) => setRapport(r))
      .catch(() => setRapport(null))
      .finally(() => setLoading(false));
  }, [period, selectedDate, fetchRapport]);

  useEffect(() => { loadRapport(); }, [loadRapport]);

  const navigateDate = (dir) => {
    const d = new Date(selectedDate);
    if (period === "journalier") d.setDate(d.getDate() + dir);
    else if (period === "mensuel") d.setMonth(d.getMonth() + dir);
    else d.setFullYear(d.getFullYear() + dir);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const formatDate = () => {
    const [y, m, dd] = selectedDate.split("-").map(Number);
    if (period === "journalier") return new Date(y, m - 1, dd).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    if (period === "mensuel") return new Date(y, m - 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return `${y}`;
  };

  const exportCSV = () => {
    if (!rapport) return;
    let csv = "ID,Table,Serveur,Heure,Statut,Mode Paiement,Total\n";
    (rapport.listeCommandes || []).forEach((cmd) => {
      csv += `${cmd.id},${cmd.table_numero || "-"},${cmd.serveur_prenom || ""},${cmd.heure || ""},${cmd.statut},${cmd.mode_paiement || "-"},${cmd.total}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport_${period}_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const caTrend = rapport?.caMoisPrecedent > 0
    ? (((rapport.ca - rapport.caMoisPrecedent) / Math.abs(rapport.caMoisPrecedent)) * 100).toFixed(1)
    : null;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <motion.div ref={reportRef} className="p-6 lg:p-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="text-indigo-500" size={22} />
            <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          </div>
          <p className="text-sm text-gray-500 capitalize">Rapport {period} — {formatDate()}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={exportCSV}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/20"
        >
          <Download size={16} />
          Exporter CSV
        </motion.button>
      </motion.div>

      {/* Period tabs */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex bg-white border border-gray-200 rounded-xl p-1">
          {periodTabs.map((pt) => (
            <button key={pt.id} onClick={() => setPeriod(pt.id)}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium transition-all ${
                period === pt.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              <pt.icon size={14} />
              {pt.label}
            </button>
          ))}
        </div>
        {/* Date nav */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-2 py-1">
          <button onClick={() => navigateDate(-1)} className="text-gray-400 hover:text-gray-700"><ChevronLeft size={16} /></button>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm border-none outline-none bg-transparent text-gray-700 font-medium" />
          <button onClick={() => navigateDate(1)} className="text-gray-400 hover:text-gray-700"><ChevronRight size={16} /></button>
          <button onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg hover:bg-gray-200 font-medium">
            Aujourd'hui
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && rapport && (
        <>
          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Chiffre d'Affaires</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                    <TrendingUp size={14} className="text-indigo-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatMontant(rapport.ca)}</p>
                {caTrend !== null && (
                  <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${parseFloat(caTrend) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {parseFloat(caTrend) >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {caTrend}% vs periode prec.
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Depenses</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
                    <TrendingDown size={14} className="text-rose-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatMontant(rapport.depenses)}</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Benefice net</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                    <Receipt size={14} className="text-emerald-600" />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${rapport.benefice >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatMontant(Math.abs(rapport.benefice))}
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Commandes</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                    <FileText size={14} className="text-violet-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{rapport.nombreCommandes}</p>
                <p className="text-xs text-gray-400 mt-1">Panier moyen: {formatMontant(rapport.panierMoyen)}</p>
              </div>
            </motion.div>
          </div>

          {/* Paiements par mode + Ventes par categorie */}
          <div className="grid gap-4 xl:grid-cols-2 mb-8">
            {/* Paiements par mode */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Paiements par Mode</h3>
              <p className="text-xs text-gray-400 mb-4">Repartition des ventes par moyen de paiement</p>

              {rapport.paiementsParMode && rapport.paiementsParMode.length > 0 ? (
                <div className="space-y-4">
                  {rapport.paiementsParMode.map((pm) => {
                    const cfg = paiementIcons[pm.mode_paiement] || { icon: Receipt, color: "text-gray-600", bg: "bg-gray-50", hex: "#6B7280" };
                    const total = rapport.paiementsParMode.reduce((s, x) => s + parseFloat(x.total), 0);
                    const pct = total > 0 ? ((parseFloat(pm.total) / total) * 100).toFixed(1) : 0;
                    return (
                      <div key={pm.mode_paiement} className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.bg} shrink-0`}>
                          <cfg.icon size={18} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-700">{paiementLabels[pm.mode_paiement] || pm.mode_paiement}</span>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-gray-900">{formatMontant(parseFloat(pm.total))}</span>
                              <span className="ml-1 text-xs text-gray-400">({pct}%)</span>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                              className="h-full rounded-full" style={{ backgroundColor: cfg.hex }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Aucun paiement enregistre</p>
              )}
            </motion.div>

            {/* Ventes par categorie */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Ventes par Categorie</h3>
              <p className="text-xs text-gray-400 mb-4">Top categories par CA</p>

              {rapport.ventesParCategorie && rapport.ventesParCategorie.length > 0 ? (
                <div className="space-y-4">
                  {rapport.ventesParCategorie.slice(0, 8).map((cat, i) => {
                    const total = rapport.ventesParCategorie.reduce((s, x) => s + parseFloat(x.total), 0);
                    const pct = total > 0 ? ((parseFloat(cat.total) / total) * 100).toFixed(1) : 0;
                    const colors = ["#6366F1", "#10B981", "#F59E0B", "#EC4899", "#3B82F6", "#8B5CF6", "#EF4444", "#14B8A6"];
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 shrink-0">
                          <GlassWater size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-700">{cat.categorie}</span>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-gray-900">{formatMontant(parseFloat(cat.total))}</span>
                              <span className="ml-1 text-xs text-gray-400">({pct}%)</span>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.05 }}
                              className="h-full rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Aucune vente sur cette periode</p>
              )}
            </motion.div>
          </div>

          {/* Commandes par heure chart */}
          {rapport.commandesParHeure && rapport.commandesParHeure.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Activite par Heure</h3>
              <p className="text-xs text-gray-400 mb-4">Commandes et CA par tranche horaire</p>
              <ResponsiveContainer width="100%" height={260}>
                <RBarChart data={rapport.commandesParHeure}>
                  <CartesianGrid strokeDasharray="3 4" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="heure" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="commandes" name="Commandes" radius={[6, 6, 0, 0]} fill="#6366F1" fillOpacity={0.8} />
                </RBarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Top produits */}
          {rapport.topProduits && rapport.topProduits.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Top Produits</h3>
                  <p className="text-xs text-gray-400">Produits les plus vendus</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rapport.topProduits.slice(0, 6).map((prod, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{prod.nom}</p>
                      <p className="text-xs text-gray-400">{prod.categorie} | {prod.quantite_totale} vendus</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 shrink-0">{formatMontant(parseFloat(prod.CA))}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Liste des commandes */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Liste des Commandes</h3>
                <p className="text-xs text-gray-400">{rapport.listeCommandes?.length || 0} commande(s)</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Table</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Serveur</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Heure</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paiement</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(rapport.listeCommandes || []).map((cmd) => (
                    <tr key={cmd.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-xs text-gray-500">#{cmd.id}</td>
                      <td className="px-6 py-3.5 font-medium text-gray-900">{cmd.table_numero || "-"}</td>
                      <td className="px-6 py-3.5 text-gray-500 hidden sm:table-cell">{cmd.serveur_prenom || "-"}</td>
                      <td className="px-6 py-3.5 text-gray-500 hidden sm:table-cell">
                        <span className="flex items-center gap-1"><Clock size={12} />{cmd.heure || "-"}</span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">
                        {cmd.mode_paiement ? (
                          <span className="inline-flex items-center gap-1 text-xs">
                            {(() => {
                              const cfg = paiementIcons[cmd.mode_paiement];
                              if (!cfg) return cmd.mode_paiement;
                              const ElIcon = cfg.icon;
                              return <><ElIcon size={12} className={cfg.color} />{paiementLabels[cmd.mode_paiement]}</>;
                            })()}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-3.5 text-center"><Badge variant={cmd.statut}>{cmd.statut}</Badge></td>
                      <td className="px-6 py-3.5 text-right font-semibold text-gray-900">{formatMontant(cmd.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {!loading && !rapport && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <BarChart3 size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucune donnee pour cette periode</p>
          <p className="text-sm mt-1">Selectionnez une autre date ou periode</p>
        </div>
      )}
    </motion.div>
  );
}
