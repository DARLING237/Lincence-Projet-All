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
    <div className="rounded-xl border border-lounge-600 bg-lounge-900 p-3 shadow-lg">
      <p className="mb-2 font-semibold text-lounge-100">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatMontant(entry.value)}
        </p>
      ))}
    </div>
  );
}

function BeneficeTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="rounded-xl border border-lounge-600 bg-lounge-900 p-3 shadow-lg">
      <p className="font-semibold text-lounge-100">{label}</p>
      <p className="text-sm" style={{ color: val >= 0 ? GOLD : RED }}>
        Benefice : {formatMontant(Math.abs(val))}
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
    { label: "Fournisseurs", amount: statsMensuelles.depensesFournisseurs, color: "bg-[#D4A853]", hexColor: GOLD, icon: <CreditCard size={14} className="text-[#D4A853]" /> },
    { label: "Salaires", amount: statsMensuelles.depensesStaff, color: "bg-emerald-500", hexColor: "#10B981", icon: <FileText size={14} className="text-emerald-500" /> },
    { label: "Impots & Taxes", amount: statsMensuelles.depensesImpots, color: "bg-amber-500", hexColor: "#F59E0B", icon: <DollarSign size={14} className="text-amber-500" /> },
  ];

  const totalDepenses = statsMensuelles.depenses;
  const margeBrute = statsMensuelles.margeBrute;
  const donutData = ventesParCategorie.map((c) => ({ name: c.nom, value: c.montant, fill: c.couleur }));
  const impotsEnRetard = impots.filter((i) => i.statut === "en retard");

  const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div className="p-6 lg:p-8" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="text-[#D4A853]" size={22} />
            <h1 className="text-2xl font-bold text-lounge-100">Finances</h1>
          </div>
          <p className="text-sm text-lounge-400">Tableau de bord financier — Decembre 2025</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => window.print()}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#1A1714] border border-[#D4A853]/15 text-sm font-medium text-lounge-200 hover:border-[#D4A853]/30 transition-colors shadow-sm">
          <Download size={16} />
          Exporter le rapport
        </motion.button>
      </motion.div>

      {/* Alert banner */}
      {impotsEnRetard.length > 0 && (
        <motion.div variants={itemVariants}
          className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">
            <span className="font-semibold">{impotsEnRetard.length} impot(s) en retard :</span>{" "}
            {impotsEnRetard.map((i) => i.libelle).join(", ")}
          </p>
        </motion.div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <motion.div variants={itemVariants}>
          <StatCard title="Chiffre d'Affaires" value={formatMontant(statsMensuelles.ca)} icon={<TrendingUp size={20} />} trend={caTrend ? parseFloat(caTrend) : 0} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Depenses totales" value={formatMontant(statsMensuelles.depenses)} icon={<Receipt size={20} />} trend={null} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Benefice net" value={formatMontant(statsMensuelles.benefice)} icon={<Wallet size={20} />} trend={beneficeTrend ? parseFloat(beneficeTrend) : 0} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Marge brute" value={`${margeBrute}%`} icon={<BarChart3 size={20} />} trend={null} />
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-2 mb-8">
        {/* CA vs Depenses */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-[#D4A853]/10 bg-[#1A1714] p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-lounge-100">CA vs Depenses</h3>
              <p className="mt-0.5 text-xs text-lounge-400">Comparaison sur 12 mois</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-lounge-300">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: GOLD }} /> CA</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: RED }} /> Depenses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenusData}>
              <defs>
                <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={RED} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={RED} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 4" stroke="transparent" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#6B5D50" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"} tick={{ fontSize: 11, fill: "#6B5D50" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ca" name="Chiffre d'Affaires" stroke={GOLD} strokeWidth={2.5} fill="url(#gradCA)" />
              <Area type="monotone" dataKey="depenses" name="Depenses" stroke={RED} strokeWidth={2} fill="url(#gradDep)" strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Benefice mensuel */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-[#D4A853]/10 bg-[#1A1714] p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-lounge-100">Benefice Mensuel</h3>
            <p className="mt-0.5 text-xs text-lounge-400">Profit realise par mois</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={beneficeMensuel}>
              <CartesianGrid strokeDasharray="3 4" stroke="transparent" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#6B5D50" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} tick={{ fontSize: 11, fill: "#6B5D50" }} axisLine={false} tickLine={false} />
              <Tooltip content={<BeneficeTooltip />} />
              <Bar dataKey="benefice" name="Benefice" radius={[6, 6, 0, 0]} fill={GOLD} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Depenses breakdown + Ventes par categorie */}
      <div className="grid gap-4 xl:grid-cols-2 mb-8">
        <motion.div variants={itemVariants} className="rounded-2xl border border-[#D4A853]/10 bg-[#1A1714] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Receipt size={18} className="text-[#D4A853]" />
            <div>
              <h3 className="text-sm font-semibold text-lounge-100">Repartition des Depenses</h3>
              <p className="text-xs text-lounge-400">Total : {formatMontant(totalDepenses)}</p>
            </div>
          </div>
          <div className="space-y-5">
            {depensesBreakdown.map((dep) => {
              const pct = totalDepenses > 0 ? ((dep.amount / totalDepenses) * 100).toFixed(1) : 0;
              return (
                <div key={dep.label} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A853]/10 shrink-0">{dep.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium text-lounge-300">{dep.label}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-lounge-100">{formatMontant(dep.amount)}</span>
                        <span className="ml-1 text-xs text-lounge-400">({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-lounge-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.7 }} className={`h-full rounded-full ${dep.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Ventes par Categorie */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-[#D4A853]/10 bg-[#1A1714] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <PieChart size={18} className="text-[#D4A853]" />
            <div>
              <h3 className="text-sm font-semibold text-lounge-100">Ventes par Categorie</h3>
              <p className="text-xs text-lounge-400">Repartition du chiffre d'affaires</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RPieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {donutData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
              </Pie>
              <Tooltip formatter={(value) => formatMontant(value)} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => (<span className="text-xs text-lounge-300">{value}</span>)} />
            </RPieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {ventesParCategorie.map((cat) => (
              <div key={cat.nom} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.couleur }} />
                  <span className="text-lounge-300">{cat.nom}</span>
                </div>
                <span className="font-semibold text-lounge-100">{cat.part}% — {formatMontant(cat.montant)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Historique des Transactions */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[#D4A853]/10 bg-[#1A1714] shadow-sm mb-8">
        <div className="flex items-center justify-between border-b border-[#D4A853]/8 px-6 py-4">
          <div className="flex items-center gap-2">
            <ListChecks size={18} className="text-[#D4A853]" />
            <div>
              <h3 className="text-sm font-semibold text-lounge-100">Historique des Transactions</h3>
              <p className="text-xs text-lounge-400">{transactions.length} transaction(s)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setFilterType(""); fetchTransactions(); }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${!filterType ? "bg-[#D4A853]/15 text-[#D4A853]" : "bg-lounge-700 text-lounge-400 hover:text-lounge-200"}`}>
              Tout
            </button>
            <button onClick={() => { setFilterType("entree"); fetchTransactions({ type_op: "entree" }); }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filterType === "entree" ? "bg-emerald-500/15 text-emerald-400" : "bg-lounge-700 text-lounge-400 hover:text-lounge-200"}`}>
              Entrees
            </button>
            <button onClick={() => { setFilterType("sortie"); fetchTransactions({ type_op: "sortie" }); }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filterType === "sortie" ? "bg-red-500/15 text-red-400" : "bg-lounge-700 text-lounge-400 hover:text-lounge-200"}`}>
              Sorties
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D4A853]/8">
                <th className="text-left px-6 py-3 text-xs font-semibold text-lounge-400 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-lounge-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-lounge-400 uppercase tracking-wider">Categorie</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-lounge-400 uppercase tracking-wider hidden md:table-cell">Reference</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-lounge-400 uppercase tracking-wider hidden lg:table-cell">Description</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-lounge-400 uppercase tracking-wider">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4A853]/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#D4A853]/5 transition-colors">
                  <td className="px-6 py-4 text-lounge-400">{tx.date ? new Date(tx.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                  <td className="px-6 py-4">{tx.type_op === "entree" ? <Badge variant="success">Entree</Badge> : <Badge variant="error">Sortie</Badge>}</td>
                  <td className="px-6 py-4 font-medium text-lounge-100">{tx.categorie}</td>
                  <td className="px-6 py-4 text-lounge-400 hidden md:table-cell font-mono text-xs">{tx.reference || "—"}</td>
                  <td className="px-6 py-4 text-lounge-400 hidden lg:table-cell max-w-[200px] truncate">{tx.description || "—"}</td>
                  <td className={`px-6 py-4 text-right font-semibold ${tx.type_op === "entree" ? "text-emerald-400" : "text-red-400"}`}>
                    {tx.type_op === "entree" ? "+" : "–"}{formatMontant(tx.montant)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-lounge-400">Aucune transaction enregistree</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {transactions.length > 0 && (() => {
          const totalEntrees = transactions.filter((t) => t.type_op === "entree").reduce((s, t) => s + Number(t.montant), 0);
          const totalSorties = transactions.filter((t) => t.type_op === "sortie").reduce((s, t) => s + Number(t.montant), 0);
          return (
            <div className="border-t border-[#D4A853]/8 px-6 py-4 flex items-center justify-between">
              <div className="flex gap-6 text-sm">
                <span className="text-emerald-400 font-medium">Entrees: +{formatMontant(totalEntrees)}</span>
                <span className="text-red-400 font-medium">Sorties: –{formatMontant(totalSorties)}</span>
              </div>
              <span className="text-lg font-bold text-lounge-100">Solde: {formatMontant(totalEntrees - totalSorties)}</span>
            </div>
          );
        })()}
      </motion.div>

      {/* Impots & Taxes */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-[#D4A853]/10 bg-[#1A1714] shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D4A853]/8 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#D4A853]" />
            <div>
              <h3 className="text-sm font-semibold text-lounge-100">Impots & Taxes</h3>
              <p className="text-xs text-lounge-400">{impots.length} echeances a venir</p>
            </div>
          </div>
          {impotsEnRetard.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/15 px-2.5 py-1 rounded-full">
              <AlertTriangle size={12} />{impotsEnRetard.length} en retard
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D4A853]/8">
                <th className="text-left px-6 py-3 text-xs font-semibold text-lounge-400 uppercase tracking-wider">Libelle</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-lounge-400 uppercase tracking-wider">Montant</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-lounge-400 uppercase tracking-wider hidden sm:table-cell">Echeance</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-lounge-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4A853]/5">
              {impots.map((imp) => {
                const isLate = imp.statut === "en retard";
                const echeance = new Date(imp.echeance).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
                return (
                  <tr key={imp.id} className="hover:bg-[#D4A853]/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isLate && <AlertTriangle size={14} className="text-red-400 shrink-0" />}
                        <span className="font-medium text-lounge-100">{imp.libelle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-lounge-100">{formatMontant(imp.montant)}</td>
                    <td className="px-6 py-4 text-lounge-400 hidden sm:table-cell">{echeance}</td>
                    <td className="px-6 py-4 text-center"><Badge variant={imp.statut}>{imp.statut}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#D4A853]/8 px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-lounge-200">Total</span>
          <span className="text-lg font-bold text-lounge-100">{formatMontant(impots.reduce((sum, i) => sum + i.montant, 0))}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
