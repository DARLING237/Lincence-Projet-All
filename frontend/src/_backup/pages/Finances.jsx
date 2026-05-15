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
  ArrowUpRight,
  ArrowDownRight,
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

/* ── Tooltip helpers ── */

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

function BeneficeTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-sm" style={{ color: val >= 0 ? "#10B981" : "#EF4444" }}>
        B&eacute;n&eacute;fice : {formatMontant(Math.abs(val))}
      </p>
    </div>
  );
}

/* ── Page ── */

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

  /* benefice mensuel derivee */
  const beneficeMensuel = revenusData.map((d) => ({
    mois: d.mois,
    benefice: d.ca - d.depenses,
  }));

  /* depenses breakdown */
  const depensesBreakdown = [
    {
      label: "Fournisseurs",
      amount: statsMensuelles.depensesFournisseurs,
      color: "bg-indigo-500",
      hexColor: "#6366F1",
      icon: <CreditCard size={14} className="text-indigo-600" />,
    },
    {
      label: "Salaires",
      amount: statsMensuelles.depensesStaff,
      color: "bg-emerald-500",
      hexColor: "#10B981",
      icon: <FileText size={14} className="text-emerald-600" />,
    },
    {
      label: "Imp&ocirc;ts & Taxes",
      amount: statsMensuelles.depensesImpots,
      color: "bg-amber-500",
      hexColor: "#F59E0B",
      icon: <DollarSign size={14} className="text-amber-600" />,
    },
  ];

  const totalDepenses = statsMensuelles.depenses;
  const margeBrute = statsMensuelles.margeBrute;

  /* donut data */
  const donutData = ventesParCategorie.map((c) => ({
    name: c.nom,
    value: c.montant,
    fill: c.couleur,
  }));

  /* impots en retard */
  const impotsEnRetard = impots.filter((i) => i.statut === "en retard");

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="text-indigo-500" size={22} />
            <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
          </div>
          <p className="text-sm text-gray-500">
            Tableau de bord financier — D&eacute;cembre 2025
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.print()}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors shadow-sm"
        >
          <Download size={16} />
          Exporter le rapport
        </motion.button>
      </motion.div>

      {/* ── Alert banner for overdue taxes ── */}
      {impotsEnRetard.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-3"
        >
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">{impotsEnRetard.length} imp&ocirc;t(s) en retard :</span>{" "}
            {impotsEnRetard.map((i) => i.libelle).join(", ")}
          </p>
        </motion.div>
      )}

      {/* ── 4 Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <motion.div variants={itemVariants}>
          <StatCard
            title="Chiffre d'Affaires"
            value={formatMontant(statsMensuelles.ca)}
            icon={<TrendingUp size={20} />}
            trend={caTrend ? parseFloat(caTrend) : 0}
            color="indigo"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="D&eacute;penses totales"
            value={formatMontant(statsMensuelles.depenses)}
            icon={<Receipt size={20} />}
            trend={null}
            color="rose"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="B&eacute;n&eacute;fice net"
            value={formatMontant(statsMensuelles.benefice)}
            icon={<Wallet size={20} />}
            trend={beneficeTrend ? parseFloat(beneficeTrend) : 0}
            color="emerald"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Marge brute"
            value={`${margeBrute}%`}
            icon={<BarChart3 size={20} />}
            trend={null}
            color="violet"
          />
        </motion.div>
      </div>

      {/* ── CA vs Depenses area chart + Benefice mensuel bar chart ── */}
      <div className="grid gap-4 xl:grid-cols-2 mb-8">
        {/* CA vs Depenses */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                CA vs D&eacute;penses
              </h3>
              <p className="mt-0.5 text-xs text-gray-400">
                Comparaison sur 12 mois
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />{" "}
                CA
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />{" "}
                D&eacute;penses
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenusData}>
              <defs>
                <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 4" stroke="#f3f4f6" />
              <XAxis
                dataKey="mois"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="ca"
                name="Chiffre d'Affaires"
                stroke="#6366F1"
                strokeWidth={2.5}
                fill="url(#gradCA)"
              />
              <Area
                type="monotone"
                dataKey="depenses"
                name="D&eacute;penses"
                stroke="#F43F5E"
                strokeWidth={2}
                fill="url(#gradDep)"
                strokeDasharray="5 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Benefice mensuel */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900">
              B&eacute;n&eacute;fice Mensuel
            </h3>
            <p className="mt-0.5 text-xs text-gray-400">
              Profit r&eacute;alis&eacute; par mois
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={beneficeMensuel}>
              <CartesianGrid strokeDasharray="3 4" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="mois"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => (v / 1000).toFixed(0) + "k"}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<BeneficeTooltip />} />
              <Bar
                dataKey="benefice"
                name="B&eacute;n&eacute;fice"
                radius={[6, 6, 0, 0]}
                fill="#10B981"
                fillOpacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Depenses breakdown + Ventes par categorie ── */}
      <div className="grid gap-4 xl:grid-cols-2 mb-8">
        {/* Depenses Breakdown */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <Receipt size={18} className="text-rose-500" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                R&eacute;partition des D&eacute;penses
              </h3>
              <p className="text-xs text-gray-400">
                Total : {formatMontant(totalDepenses)}
              </p>
            </div>
          </div>
          <div className="space-y-5">
            {depensesBreakdown.map((dep) => {
              const pct = totalDepenses > 0 ? ((dep.amount / totalDepenses) * 100).toFixed(1) : 0;
              return (
                <div key={dep.label} className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 shrink-0`}>
                    {dep.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">
                        {dep.label}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatMontant(dep.amount)}
                        </span>
                        <span className="ml-1 text-xs text-gray-400">
                          ({pct}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className={`h-full rounded-full ${dep.color}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Ventes par Categorie – Donut */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <PieChart size={18} className="text-indigo-500" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Ventes par Cat&eacute;gorie
              </h3>
              <p className="text-xs text-gray-400">
                R&eacute;partition du chiffre d&apos;affaires
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RPieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatMontant(value)} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-gray-600">{value}</span>
                )}
              />
            </RPieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {ventesParCategorie.map((cat) => (
              <div key={cat.nom} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.couleur }}
                  />
                  <span className="text-gray-600">{cat.nom}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {cat.part}% — {formatMontant(cat.montant)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Historique des Transactions ── */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-gray-200 bg-white shadow-sm mb-8"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <ListChecks size={18} className="text-indigo-500" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Historique des Transactions
              </h3>
              <p className="text-xs text-gray-400">
                {transactions.length} transaction(s)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setFilterType(""); fetchTransactions(); }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                !filterType
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => { setFilterType("entree"); fetchTransactions({ type_op: "entree" }); }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                filterType === "entree"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Entrées
            </button>
            <button
              onClick={() => { setFilterType("sortie"); fetchTransactions({ type_op: "sortie" }); }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                filterType === "sortie"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Sorties
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Référence
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Description
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 text-gray-500">
                    {tx.date
                      ? new Date(tx.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    {tx.type_op === "entree" ? (
                      <Badge variant="success">Entrée</Badge>
                    ) : (
                      <Badge variant="error">Sortie</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {tx.categorie}
                  </td>
                  <td className="px-6 py-4 text-gray-500 hidden md:table-cell font-mono text-xs">
                    {tx.reference || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 hidden lg:table-cell max-w-[200px] truncate">
                    {tx.description || "—"}
                  </td>
                  <td className={`px-6 py-4 text-right font-semibold ${
                    tx.type_op === "entree"
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}>
                    {tx.type_op === "entree" ? "+" : "–"}{formatMontant(tx.montant)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Aucune transaction enregistrée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Total row */}
        {transactions.length > 0 && (() => {
          const totalEntrees = transactions.filter((t) => t.type_op === "entree").reduce((s, t) => s + Number(t.montant), 0);
          const totalSorties = transactions.filter((t) => t.type_op === "sortie").reduce((s, t) => s + Number(t.montant), 0);
          return (
            <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50 rounded-b-2xl">
              <div className="flex gap-6 text-sm">
                <span>
                  <span className="text-emerald-600 font-medium">Entrées: +{formatMontant(totalEntrees)}</span>
                </span>
                <span>
                  <span className="text-rose-600 font-medium">Sorties: –{formatMontant(totalSorties)}</span>
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                Solde: {formatMontant(totalEntrees - totalSorties)}
              </span>
            </div>
          );
        })()}
      </motion.div>

      {/* ── Impots & Taxes Table ── */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-amber-500" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Imp&ocirc;ts & Taxes
              </h3>
              <p className="text-xs text-gray-400">
                {impots.length} &eacute;ch&eacute;ances &agrave; venir
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {impotsEnRetard.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                <AlertTriangle size={12} />
                {impotsEnRetard.length} en retard
              </span>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Libell&eacute;
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  &Eacute;ch&eacute;ance
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {impots.map((imp) => {
                const isLate = imp.statut === "en retard";
                const echeanceFormatted = new Date(imp.echeance).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <tr key={imp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isLate && (
                          <AlertTriangle size={14} className="text-red-400 shrink-0" />
                        )}
                        <span className="font-medium text-gray-900">
                          {imp.libelle}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatMontant(imp.montant)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">
                      {echeanceFormatted}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={imp.statut}>{imp.statut}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Total row */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50 rounded-b-2xl">
          <span className="text-sm font-semibold text-gray-700">Total</span>
          <span className="text-lg font-bold text-gray-900">
            {formatMontant(impots.reduce((sum, i) => sum + i.montant, 0))}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
