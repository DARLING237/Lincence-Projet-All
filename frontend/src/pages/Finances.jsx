import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { StatCard } from "../components/ui/statCard";
import { Badge } from "../components/ui/badge";
import { formatMontant, formatPourcentage } from "../data/mockData";
import {
  TrendingUp,
  Wallet,
  Receipt,
  Download,
  BarChart3,
  PieChart,
  DollarSign,
  CreditCard,
  FileText,
  AlertTriangle,
  ListChecks,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const GOLD = "#D4A853";
const RED = "#EF4444";

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

function BeneficeTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 shadow-xl backdrop-blur-md">
      <p className="font-bold text-zinc-50 mb-2">{label}</p>
      <p className="text-sm font-semibold flex items-center justify-between gap-4" style={{ color: val >= 0 ? GOLD : RED }}>
        <span>Bénéfice</span>
        <span>{formatMontant(Math.abs(val))}</span>
      </p>
    </div>
  );
}

export function Finances() {
  const statsMensuelles = useAppStore((s) => s.statsMensuelles);
  const revenusData = useAppStore((s) => s.revenusData);
  const ventesParCategorie = useAppStore((s) => s.ventesParCategorie);
  const impots = useAppStore((s) => s.impots);
  const transactions = useAppStore((s) => s.transactions);
  const fetchRevenus = useAppStore((s) => s.fetchRevenus);
  const fetchImpots = useAppStore((s) => s.fetchImpots);
  const fetchStats = useAppStore((s) => s.fetchStats);
  const fetchTransactions = useAppStore((s) => s.fetchTransactions);
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    fetchRevenus();
    fetchImpots();
    fetchStats();
    fetchTransactions();
  }, [fetchRevenus, fetchImpots, fetchStats, fetchTransactions]);

  const caTrend = formatPourcentage(statsMensuelles.ca, statsMensuelles.caMoisPrecedent);
  const beneficeTrend = formatPourcentage(statsMensuelles.benefice, statsMensuelles.beneficeMoisPrecedent);

  const beneficeMensuel = revenusData.map((d) => ({
    mois: d.mois,
    benefice: d.ca - d.depenses,
  }));

  const depensesBreakdown = [
    { label: "Fournisseurs", amount: statsMensuelles.depensesFournisseurs, color: "bg-brand-500", hexColor: GOLD, icon: <CreditCard size={18} className="text-brand-500" /> },
    { label: "Salaires", amount: statsMensuelles.depensesStaff, color: "bg-emerald-500", hexColor: "#10B981", icon: <FileText size={18} className="text-emerald-500" /> },
    { label: "Impôts & Taxes", amount: statsMensuelles.depensesImpots, color: "bg-amber-500", hexColor: "#F59E0B", icon: <DollarSign size={18} className="text-amber-500" /> },
  ];

  const totalDepenses = statsMensuelles.depenses;
  const margeBrute = statsMensuelles.margeBrute;
  const donutData = ventesParCategorie.map((c) => ({ name: c.nom, value: c.montant, fill: c.couleur }));
  const impotsEnRetard = impots.filter((i) => i.statut === "en retard");

  const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div className="max-w-7xl mx-auto" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="bg-brand-500/10 p-2 rounded-xl">
              <DollarSign className="text-brand-500" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Finances</h1>
          </div>
          <p className="text-sm font-medium text-zinc-400 mt-1 ml-[52px]">Tableau de bord financier — <span className="text-zinc-300 font-bold">Décembre 2025</span></p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => window.print()}
          className="flex items-center gap-2 h-11 px-5 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-white/10 text-sm font-bold text-zinc-200 hover:border-brand-500/50 hover:bg-zinc-800 transition-all shadow-sm">
          <Download size={18} />
          Exporter le rapport
        </motion.button>
      </motion.div>

      {/* Alert banner */}
      {impotsEnRetard.length > 0 && (
        <motion.div variants={itemVariants}
          className="mb-8 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 backdrop-blur-md shadow-lg">
          <AlertTriangle size={20} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-200">
            <span className="font-bold text-red-400">{impotsEnRetard.length} impôt(s) en retard :</span>{" "}
            {impotsEnRetard.map((i) => i.libelle).join(", ")}
          </p>
        </motion.div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <motion.div variants={itemVariants}>
          <StatCard title="Chiffre d'Affaires" value={formatMontant(statsMensuelles.ca)} icon={<TrendingUp size={20} />} trend={caTrend ? parseFloat(caTrend) : 0} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Dépenses totales" value={formatMontant(statsMensuelles.depenses)} icon={<Receipt size={20} />} trend={null} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Bénéfice net" value={formatMontant(statsMensuelles.benefice)} icon={<Wallet size={20} />} trend={beneficeTrend ? parseFloat(beneficeTrend) : 0} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Marge brute" value={`${margeBrute}%`} icon={<BarChart3 size={20} />} trend={null} />
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-5 xl:grid-cols-2 mb-8">
        {/* CA vs Depenses */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-50">CA vs Dépenses</h3>
              <p className="mt-1 text-sm font-medium text-zinc-400">Comparaison sur 12 mois</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-zinc-300 bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-white/5">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full shadow-[0_0_8px_#D4A853]" style={{ background: GOLD }} /> CA</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full shadow-[0_0_8px_#EF4444]" style={{ background: RED }} /> Dépenses</span>
            </div>
          </div>
          <div className="bg-zinc-950/30 p-4 rounded-xl border border-white/5">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenusData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GOLD} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradDep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={RED} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={RED} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 4" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"} tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <Area type="monotone" dataKey="ca" name="Chiffre d'Affaires" stroke={GOLD} strokeWidth={3} fill="url(#gradCA)" />
                  <Area type="monotone" dataKey="depenses" name="Dépenses" stroke={RED} strokeWidth={2} fill="url(#gradDep)" strokeDasharray="6 4" />
                </AreaChart>
              </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Benefice mensuel */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg">
          <div className="mb-6">
            <h3 className="text-base font-bold text-zinc-50">Bénéfice Mensuel</h3>
            <p className="mt-1 text-sm font-medium text-zinc-400">Profit réalisé par mois</p>
          </div>
          <div className="bg-zinc-950/30 p-4 rounded-xl border border-white/5">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={beneficeMensuel} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 4" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<BeneficeTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="benefice" name="Bénéfice" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {beneficeMensuel.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.benefice >= 0 ? "url(#colorGold)" : "url(#colorRed)"} />
                      ))}
                  </Bar>
                  <defs>
                      <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GOLD} stopOpacity={1}/>
                        <stop offset="95%" stopColor="#C49742" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={RED} stopOpacity={1}/>
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0.8}/>
                      </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Depenses breakdown + Ventes par categorie */}
      <div className="grid gap-5 xl:grid-cols-2 mb-8">
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-brand-500/10 p-2 rounded-xl">
               <Receipt size={24} className="text-brand-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-50">Répartition des Dépenses</h3>
              <p className="text-sm font-medium text-zinc-400 mt-1">Total : <span className="font-bold text-zinc-200">{formatMontant(totalDepenses)}</span></p>
            </div>
          </div>
          <div className="space-y-6">
            {depensesBreakdown.map((dep) => {
              const pct = totalDepenses > 0 ? ((dep.amount / totalDepenses) * 100).toFixed(1) : 0;
              return (
                <div key={dep.label} className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 border border-white/5 shadow-inner shrink-0`}>
                      {dep.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-bold text-zinc-200">{dep.label}</span>
                      <div className="text-right">
                        <span className="text-sm font-black text-zinc-50">{formatMontant(dep.amount)}</span>
                        <span className="ml-2 text-xs font-bold text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded-md">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-zinc-950 rounded-full overflow-hidden shadow-inner border border-white/5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.7 }} className={`h-full rounded-full ${dep.color}`} style={{boxShadow: `0 0 10px ${dep.hexColor}40`}} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Ventes par Categorie */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-500/10 p-2 rounded-xl">
               <PieChart size={24} className="text-brand-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-50">Ventes par Catégorie</h3>
              <p className="text-sm font-medium text-zinc-400 mt-1">Répartition du chiffre d'affaires</p>
            </div>
          </div>
          <div className="bg-zinc-950/30 rounded-xl p-4 border border-white/5 flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="rgba(0,0,0,0.2)">
                        {donutData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
                      </Pie>
                      <Tooltip formatter={(value) => formatMontant(value)} contentStyle={{backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', fontWeight: 'bold', color: '#fafafa'}} itemStyle={{color: '#fafafa'}} />
                    </RPieChart>
                  </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                {ventesParCategorie.map((cat) => (
                  <div key={cat.nom} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: cat.couleur, boxShadow: `0 0 8px ${cat.couleur}60` }} />
                      <span className="font-bold text-zinc-200">{cat.nom}</span>
                    </div>
                    <div className="text-right flex flex-col">
                        <span className="font-black text-zinc-50">{formatMontant(cat.montant)}</span>
                        <span className="text-xs font-semibold text-zinc-500">{cat.part}%</span>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </motion.div>
      </div>

      {/* Historique des Transactions */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-md shadow-lg mb-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-950/30 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500/10 p-2 rounded-xl">
               <ListChecks size={20} className="text-brand-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-50">Historique des Transactions</h3>
              <p className="text-sm font-medium text-zinc-400 mt-0.5">{transactions.length} transaction(s)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-xl border border-white/5 w-fit">
            <button onClick={() => { setFilterType(""); fetchTransactions(); }}
              className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${!filterType ? "bg-brand-500 text-black shadow-md shadow-brand-500/20" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"}`}>
              Tout
            </button>
            <button onClick={() => { setFilterType("entree"); fetchTransactions({ type_op: "entree" }); }}
              className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${filterType === "entree" ? "bg-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/10" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"}`}>
              Entrées
            </button>
            <button onClick={() => { setFilterType("sortie"); fetchTransactions({ type_op: "sortie" }); }}
              className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${filterType === "sortie" ? "bg-red-500/20 text-red-400 shadow-md shadow-red-500/10" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"}`}>
              Sorties
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-950/50">
                <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Catégorie</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider hidden md:table-cell">Référence</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Description</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 text-zinc-300 font-medium">{tx.date ? new Date(tx.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                  <td className="px-6 py-4">{tx.type_op === "entree" ? <Badge variant="success">Entrée</Badge> : <Badge variant="error">Sortie</Badge>}</td>
                  <td className="px-6 py-4 font-bold text-zinc-100">{tx.categorie}</td>
                  <td className="px-6 py-4 text-zinc-500 hidden md:table-cell font-mono text-xs font-bold bg-zinc-950 rounded-md w-fit inline-block mt-2 border border-white/5 px-2 py-1">{tx.reference || "—"}</td>
                  <td className="px-6 py-4 text-zinc-400 hidden lg:table-cell max-w-[200px] truncate font-medium">{tx.description || "—"}</td>
                  <td className={`px-6 py-4 text-right font-black ${tx.type_op === "entree" ? "text-emerald-400" : "text-red-400"}`}>
                    {tx.type_op === "entree" ? "+" : "–"}{formatMontant(tx.montant)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-zinc-500 font-bold bg-zinc-950/20">Aucune transaction enregistrée</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {transactions.length > 0 && (() => {
          const totalEntrees = transactions.filter((t) => t.type_op === "entree").reduce((s, t) => s + Number(t.montant), 0);
          const totalSorties = transactions.filter((t) => t.type_op === "sortie").reduce((s, t) => s + Number(t.montant), 0);
          return (
            <div className="border-t border-white/5 px-6 py-5 flex items-center justify-between bg-zinc-950/30">
              <div className="flex gap-6 text-sm">
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">Entrées: +{formatMontant(totalEntrees)}</span>
                <span className="text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">Sorties: –{formatMontant(totalSorties)}</span>
              </div>
              <span className="text-xl font-black text-zinc-50">Solde: <span className={totalEntrees - totalSorties >= 0 ? "text-emerald-400" : "text-red-400"}>{formatMontant(totalEntrees - totalSorties)}</span></span>
            </div>
          );
        })()}
      </motion.div>

      {/* Impots & Taxes */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-md shadow-lg overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-950/30">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500/10 p-2 rounded-xl">
              <FileText size={20} className="text-brand-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-50">Impôts & Taxes</h3>
              <p className="text-sm font-medium text-zinc-400 mt-0.5">{impots.length} échéance(s) à venir</p>
            </div>
          </div>
          {impotsEnRetard.length > 0 && (
            <span className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/15 px-3 py-1.5 rounded-lg border border-red-500/20">
              <AlertTriangle size={14} />{impotsEnRetard.length} en retard
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-950/50">
                <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Libellé</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Montant</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider hidden sm:table-cell">Échéance</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {impots.map((imp) => {
                const isLate = imp.statut === "en retard";
                const echeance = new Date(imp.echeance).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
                return (
                  <tr key={imp.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {isLate && <div className="bg-red-500/20 p-1.5 rounded-lg border border-red-500/30"><AlertTriangle size={16} className="text-red-400 shrink-0" /></div>}
                        <span className="font-bold text-zinc-100">{imp.libelle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-zinc-50">{formatMontant(imp.montant)}</td>
                    <td className="px-6 py-4 text-zinc-400 font-medium hidden sm:table-cell bg-zinc-950 rounded-md w-fit inline-block mt-2 border border-white/5 px-3 py-1.5">{echeance}</td>
                    <td className="px-6 py-4 text-center"><Badge variant={imp.statut}>{imp.statut}</Badge></td>
                  </tr>
                );
              })}
              {impots.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-zinc-500 font-bold bg-zinc-950/20">Aucun impôt enregistré</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-white/5 px-6 py-5 flex items-center justify-between bg-zinc-950/30">
          <span className="text-sm font-bold text-zinc-300">Total</span>
          <span className="text-xl font-black text-zinc-50">{formatMontant(impots.reduce((sum, i) => sum + i.montant, 0))}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
