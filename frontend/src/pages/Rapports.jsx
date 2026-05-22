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
  especes: { icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500/10", hex: "#10B981" },
  orange_money: { icon: Smartphone, color: "text-amber-500", bg: "bg-amber-500/10", hex: "#F59E0B" },
  mtn_momo: { icon: Smartphone, color: "text-yellow-500", bg: "bg-yellow-500/10", hex: "#EAB308" },
  mobile_money: { icon: Smartphone, color: "text-amber-500", bg: "bg-amber-500/10", hex: "#F59E0B" },
  carte: { icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/10", hex: "#3B82F6" },
  transfert: { icon: Repeat, color: "text-purple-500", bg: "bg-purple-500/10", hex: "#8B5CF6" },
};

const paiementLabels = {
  especes: "Espèces",
  orange_money: "Orange Money",
  mtn_momo: "MTN MoMo",
  mobile_money: "Mobile Money",
  carte: "Carte bancaire",
  transfert: "Transfert",
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 shadow-xl backdrop-blur-md">
      <p className="mb-2 font-bold text-zinc-50">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold flex items-center justify-between gap-4" style={{ color: entry.color }}>
          <span>{entry.name}</span>
          <span>{formatMontant(entry.value)}</span>
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
    <motion.div ref={reportRef} className="max-w-7xl mx-auto" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-brand-500/10 p-2 rounded-xl">
              <BarChart3 className="text-brand-500" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Rapports</h1>
          </div>
          <p className="text-sm font-medium text-zinc-400 capitalize mt-1 ml-[52px]">Rapport {period} — <span className="text-zinc-300 font-bold">{formatDate()}</span></p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={exportCSV}
          className="flex items-center gap-2 h-11 px-5 rounded-xl bg-brand-500 text-black text-sm font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all"
        >
          <Download size={18} />
          Exporter CSV
        </motion.button>
      </motion.div>

      {/* Period tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div className="flex bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-xl p-1.5 shadow-sm">
          {periodTabs.map((pt) => (
            <button key={pt.id} onClick={() => setPeriod(pt.id)}
              className={`flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-bold transition-all ${
                period === pt.id ? "bg-brand-500 text-black shadow-md shadow-brand-500/20" : "text-zinc-400 hover:text-zinc-100"
              }`}>
              <pt.icon size={16} />
              {pt.label}
            </button>
          ))}
        </div>
        {/* Date nav */}
        <div className="flex items-center gap-2 bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-xl p-1.5 shadow-sm">
          <button onClick={() => navigateDate(-1)} className="h-10 w-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"><ChevronLeft size={20} /></button>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="h-10 px-2 text-sm border-none outline-none bg-transparent text-zinc-100 font-bold focus:ring-0 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
          <button onClick={() => navigateDate(1)} className="h-10 w-10 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"><ChevronRight size={20} /></button>
          <div className="h-6 w-px bg-white/10 mx-1"></div>
          <button onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            className="h-10 px-4 text-xs font-bold bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors">
            Aujourd'hui
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(212,168,83,0.5)]" />
        </div>
      )}

      {!loading && rapport && (
        <>
          {/* Stat Cards */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
            <motion.div variants={itemVariants}>
              <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Chiffre d'Affaires</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 shadow-inner">
                    <TrendingUp size={18} className="text-brand-500" />
                  </div>
                </div>
                <p className="text-3xl font-black text-zinc-50">{formatMontant(rapport.ca)}</p>
                {caTrend !== null && (
                  <div className={`flex items-center gap-1.5 mt-2 text-xs font-bold ${parseFloat(caTrend) >= 0 ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"} w-fit px-2 py-1 rounded-md`}>
                    {parseFloat(caTrend) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {caTrend}% vs période préc.
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Dépenses</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 shadow-inner">
                    <TrendingDown size={18} className="text-rose-500" />
                  </div>
                </div>
                <p className="text-3xl font-black text-zinc-50">{formatMontant(rapport.depenses)}</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Bénéfice net</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 shadow-inner">
                    <Receipt size={18} className="text-emerald-500" />
                  </div>
                </div>
                <p className={`text-3xl font-black ${rapport.benefice >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {formatMontant(Math.abs(rapport.benefice))}
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Commandes</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 shadow-inner">
                    <FileText size={18} className="text-violet-500" />
                  </div>
                </div>
                <p className="text-3xl font-black text-zinc-50">{rapport.nombreCommandes}</p>
                <p className="text-xs font-medium text-zinc-400 mt-2">Panier moyen: <span className="font-bold text-zinc-300">{formatMontant(rapport.panierMoyen)}</span></p>
              </div>
            </motion.div>
          </div>

          {/* Paiements par mode + Ventes par categorie */}
          <div className="grid gap-5 xl:grid-cols-2 mb-8">
            {/* Paiements par mode */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg">
              <h3 className="text-base font-bold text-zinc-50 mb-1">Paiements par Mode</h3>
              <p className="text-sm font-medium text-zinc-400 mb-6">Répartition des ventes par moyen de paiement</p>

              {rapport.paiementsParMode && rapport.paiementsParMode.length > 0 ? (
                <div className="space-y-5">
                  {rapport.paiementsParMode.map((pm) => {
                    const cfg = paiementIcons[pm.mode_paiement] || { icon: Receipt, color: "text-zinc-400", bg: "bg-zinc-800", hex: "#A1A1AA" };
                    const total = rapport.paiementsParMode.reduce((s, x) => s + parseFloat(x.total), 0);
                    const pct = total > 0 ? ((parseFloat(pm.total) / total) * 100).toFixed(1) : 0;
                    return (
                      <div key={pm.mode_paiement} className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cfg.bg} shrink-0 shadow-inner border border-white/5`}>
                          <cfg.icon size={20} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-bold text-zinc-200">{paiementLabels[pm.mode_paiement] || pm.mode_paiement}</span>
                            <div className="text-right">
                              <span className="text-sm font-black text-zinc-50">{formatMontant(parseFloat(pm.total))}</span>
                              <span className="ml-2 text-xs font-bold text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded-md">{pct}%</span>
                            </div>
                          </div>
                          <div className="h-2.5 bg-zinc-950 rounded-full overflow-hidden shadow-inner border border-white/5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                              className="h-full rounded-full" style={{ backgroundColor: cfg.hex, boxShadow: `0 0 10px ${cfg.hex}40` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-zinc-950/30 rounded-xl border border-white/5">
                  <CreditCard size={32} className="text-zinc-600 mb-3" />
                  <p className="text-sm font-bold text-zinc-500">Aucun paiement enregistré</p>
                </div>
              )}
            </motion.div>

            {/* Ventes par categorie */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg">
              <h3 className="text-base font-bold text-zinc-50 mb-1">Ventes par Catégorie</h3>
              <p className="text-sm font-medium text-zinc-400 mb-6">Top catégories par Chiffre d'Affaires</p>

              {rapport.ventesParCategorie && rapport.ventesParCategorie.length > 0 ? (
                <div className="space-y-5">
                  {rapport.ventesParCategorie.slice(0, 8).map((cat, i) => {
                    const total = rapport.ventesParCategorie.reduce((s, x) => s + parseFloat(x.total), 0);
                    const pct = total > 0 ? ((parseFloat(cat.total) / total) * 100).toFixed(1) : 0;
                    const colors = ["#D4A853", "#10B981", "#EF4444", "#EC4899", "#3B82F6", "#8B5CF6", "#F59E0B", "#14B8A6"];
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 border border-white/5 shrink-0 shadow-inner">
                          <GlassWater size={20} className="text-brand-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-bold text-zinc-200">{cat.categorie}</span>
                            <div className="text-right">
                              <span className="text-sm font-black text-zinc-50">{formatMontant(parseFloat(cat.total))}</span>
                              <span className="ml-2 text-xs font-bold text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded-md">{pct}%</span>
                            </div>
                          </div>
                          <div className="h-2.5 bg-zinc-950 rounded-full overflow-hidden shadow-inner border border-white/5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.05 }}
                              className="h-full rounded-full" style={{ backgroundColor: colors[i % colors.length], boxShadow: `0 0 10px ${colors[i % colors.length]}40` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-zinc-950/30 rounded-xl border border-white/5">
                  <GlassWater size={32} className="text-zinc-600 mb-3" />
                  <p className="text-sm font-bold text-zinc-500">Aucune vente sur cette période</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Commandes par heure chart */}
          {rapport.commandesParHeure && rapport.commandesParHeure.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg mb-8">
              <h3 className="text-base font-bold text-zinc-50 mb-1">Activité par Heure</h3>
              <p className="text-sm font-medium text-zinc-400 mb-6">Commandes et CA par tranche horaire</p>
              <div className="bg-zinc-950/50 p-4 rounded-xl border border-white/5">
                  <ResponsiveContainer width="100%" height={280}>
                    <RBarChart data={rapport.commandesParHeure} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 4" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="heure" tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                      <Bar dataKey="commandes" name="Commandes" radius={[6, 6, 0, 0]} fill="#D4A853" maxBarSize={40}>
                         {rapport.commandesParHeure.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#colorBrand${index})`} />
                        ))}
                      </Bar>
                      <defs>
                        {rapport.commandesParHeure.map((entry, index) => (
                            <linearGradient key={`colorBrand${index}`} id={`colorBrand${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#D4A853" stopOpacity={1}/>
                              <stop offset="95%" stopColor="#C49742" stopOpacity={0.8}/>
                            </linearGradient>
                        ))}
                      </defs>
                    </RBarChart>
                  </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Top produits */}
          {rapport.topProduits && rapport.topProduits.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-zinc-50">Top Produits</h3>
                  <p className="text-sm font-medium text-zinc-400">Produits les plus vendus</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rapport.topProduits.slice(0, 6).map((prod, i) => (
                  <div key={i} className="flex items-center gap-4 bg-zinc-950/50 rounded-xl p-4 border border-white/5 hover:border-brand-500/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 text-sm font-black shrink-0 shadow-inner border border-brand-500/20">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-zinc-100 truncate">{prod.nom}</p>
                      <p className="text-xs font-semibold text-zinc-500 mt-0.5">{prod.categorie} <span className="mx-1">•</span> <span className="text-brand-500">{prod.quantite_totale} vendus</span></p>
                    </div>
                    <p className="text-base font-black text-zinc-50 shrink-0">{formatMontant(parseFloat(prod.CA))}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Liste des commandes */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-md shadow-lg overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-950/30">
              <div>
                <h3 className="text-lg font-bold text-zinc-50">Liste des Commandes</h3>
                <p className="text-sm font-medium text-zinc-400 mt-1">{rapport.listeCommandes?.length || 0} commande(s)</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-zinc-950/50">
                    <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">#</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Table</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider hidden sm:table-cell">Serveur</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider hidden sm:table-cell">Heure</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Paiement</th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Statut</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(rapport.listeCommandes || []).map((cmd) => (
                    <tr key={cmd.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-500">#{cmd.id}</td>
                      <td className="px-6 py-4 font-bold text-zinc-100">{cmd.table_numero || "-"}</td>
                      <td className="px-6 py-4 font-medium text-zinc-400 hidden sm:table-cell">{cmd.serveur_prenom || "-"}</td>
                      <td className="px-6 py-4 text-zinc-400 hidden sm:table-cell font-medium">
                        <span className="flex items-center gap-1.5 bg-zinc-950 w-fit px-2 py-1 rounded-md border border-white/5"><Clock size={14} className="text-zinc-500" />{cmd.heure || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        {cmd.mode_paiement ? (
                          <span className="inline-flex items-center gap-2 text-xs font-bold bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-white/5">
                            {(() => {
                              const cfg = paiementIcons[cmd.mode_paiement];
                              if (!cfg) return <span className="text-zinc-300">{cmd.mode_paiement}</span>;
                              const ElIcon = cfg.icon;
                              return <><ElIcon size={14} className={cfg.color} /><span className="text-zinc-300">{paiementLabels[cmd.mode_paiement]}</span></>;
                            })()}
                          </span>
                        ) : <span className="text-zinc-600 font-medium">-</span>}
                      </td>
                      <td className="px-6 py-4 text-center"><Badge variant={cmd.statut}>{cmd.statut}</Badge></td>
                      <td className="px-6 py-4 text-right font-black text-zinc-50">{formatMontant(cmd.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {!loading && !rapport && (
        <div className="flex flex-col items-center justify-center py-32 bg-zinc-900/30 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="bg-zinc-950 p-6 rounded-full mb-6 border border-white/5 shadow-inner">
             <BarChart3 size={48} className="text-zinc-600" />
          </div>
          <p className="text-xl font-bold text-zinc-300">Aucune donnée pour cette période</p>
          <p className="text-sm font-medium text-zinc-500 mt-2">Sélectionnez une autre date ou période pour voir les rapports</p>
        </div>
      )}
    </motion.div>
  );
}
