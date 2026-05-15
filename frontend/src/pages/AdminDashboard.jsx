import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { StatCard } from "../components/ui/statCard";
import { Badge } from "../components/ui/badge";
import { formatMontant, formatPourcentage } from "../data/mockData";
import {
  TrendingUp,
  Wallet,
  Receipt,
  Target,
  AlertTriangle,
  Clock,
  ChevronRight,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Package,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
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

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl border border-lounge-600 bg-lounge-900 p-3 shadow-lg">
      <p className="font-semibold text-lounge-100">{label} heure</p>
      <p className="text-sm text-lounge-400">
        {payload[0]?.value} commandes
      </p>
    </div>
  );
}

export function AdminDashboard() {
  const stats = useAppStore((s) => s.statsMensuelles);
  const recentCmds = useAppStore((s) => s.commandesRecentes);
  const revenus = useAppStore((s) => s.revenusData);
  const ventesCatStore = useAppStore((s) => s.ventesParCategorie);
  const alertes = useAppStore((s) => s.alertesStock);
  const commandesHeure = useAppStore((s) => s.commandesHeure);

  const fetchStats = useAppStore((s) => s.fetchStats);
  const fetchRevenus = useAppStore((s) => s.fetchRevenus);
  const fetchCommandesHeure = useAppStore((s) => s.fetchCommandesHeure);

  useEffect(() => {
    fetchStats();
    fetchRevenus();
    fetchCommandesHeure();
  }, [fetchStats, fetchRevenus, fetchCommandesHeure]);

  const ventesCatFallback = [
    { nom: "Cocktails", montant: 0, couleur: "#8B5CF6", part: 0 },
    { nom: "Bières", montant: 0, couleur: "#3B82F6", part: 0 },
    { nom: "Softs", montant: 0, couleur: "#6366F1", part: 0 },
  ];
  const ventesCat = ventesCatStore.length > 0 ? ventesCatStore : ventesCatFallback;

  const depensesFournisseurs = stats.depensesFournisseurs || 0;
  const depensesStaff = stats.depensesStaff || 0;
  const depensesImpots = stats.depensesImpots || 0;

  const caTrend = formatPourcentage(stats.ca, stats.caMoisPrecedent);
  const beneficeTrend = formatPourcentage(stats.benefice, stats.beneficeMoisPrecedent);
  const cmdTrend = formatPourcentage(stats.nombreCommandes, stats.nombreCommandesMoisPrecedent);

  const statusIcon = {
    payee: <Wallet size={14} />,
    "en preparation": <Clock size={14} />,
    "en attente": <AlertTriangle size={14} />,
    servie: <Receipt size={14} />,
    annulee: <AlertTriangle size={14} />,
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="text-[#D4A853]" size={22} />
            <h1 className="text-2xl font-bold text-lounge-100">Tableau de bord</h1>
          </div>
          <p className="text-sm text-lounge-400">Vue d'ensemble — Décembre 2025</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.print()}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#1A1714] border border-[#D4A853]/10 text-sm font-medium text-lounge-200 hover:border-[#D4A853]/15 transition-colors shadow-sm"
        >
          <ArrowUpRight size={16} />
          Exporter le rapport
        </motion.button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard
          title="Chiffre d'Affaires"
          value={formatMontant(stats.ca)}
          icon={<TrendingUp size={20} />}
          trend={caTrend ? parseFloat(caTrend) : 0}
          color="amber"
        />
        <StatCard
          title="Bénéfice Net"
          value={formatMontant(stats.benefice)}
          icon={<Wallet size={20} />}
          trend={beneficeTrend ? parseFloat(beneficeTrend) : 0}
          color="emerald"
        />
        <StatCard
          title="Commandes du mois"
          value={stats.nombreCommandes}
          icon={<Receipt size={20} />}
          trend={cmdTrend ? parseFloat(cmdTrend) : 0}
          color="amber"
        />
        <StatCard
          title="Panier Moyen"
          value={formatMontant(stats.panierMoyen)}
          icon={<Target size={20} />}
          trend={null}
          color="stone"
        />
      </div>

      {/* ── KPI Breakdown Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid gap-4 sm:grid-cols-3 mb-8"
      >
        <div className="rounded-2xl border border-[#D4A853]/10 bg-[#1A1714] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-lounge-400">Marge brute</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4A853]/10">
              <Target size={16} className="text-[#D4A853]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-lounge-100">{stats.margeBrute}%</p>
          <div className="mt-2 h-2 bg-lounge-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.margeBrute}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full rounded-full bg-gradient-to-r from-[#D4A853] to-[#C49742]"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#D4A853]/10 bg-[#1A1714] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-lounge-400">Tables actives</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Receipt size={16} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-lounge-100">{stats.tablesOccupees}<span className="text-lg text-lounge-400 font-normal"> / {stats.tablesTotal}</span></p>
          <div className="mt-2 h-2 bg-lounge-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.tablesOccupees / stats.tablesTotal) * 100}%` }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-full rounded-full bg-gradient-to-r from-[#D4A853] to-[#C49742]"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#D4A853]/10 bg-[#1A1714] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-lounge-400">Alertes stock</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
              <Package size={16} className="text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-400">{alertes.length}</p>
          <p className="text-xs text-lounge-400 mt-1">Produits en rupture imminente</p>
        </div>
      </motion.div>

      {/* ── Charts Row ── */}
      <div className="grid gap-4 xl:grid-cols-5 mb-8">
        {/* CA vs Dépenses */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-3 bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-lounge-100">Revenus & Dépenses</h3>
              <p className="mt-0.5 text-xs text-lounge-400">Évolution sur 12 mois</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#D4A853]" /> CA
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Dépenses
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenus}>
              <defs>
                <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A853" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#D4A853" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 4" strokeOpacity="0.1" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#6B5D50" }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"}
                tick={{ fontSize: 11, fill: "#6B5D50" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ca" name="Chiffre d'Affaires" stroke="#D4A853" strokeWidth={2.5} fill="url(#gradCA)" />
              <Area type="monotone" dataKey="depenses" name="Dépenses" stroke="#EF4444" strokeWidth={2} fill="url(#gradDep)" strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Ventes par Catégorie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 p-6 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-lounge-100 mb-1">Ventes par Catégorie</h3>
          <p className="text-xs text-lounge-400 mb-4">Répartition du CA</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={ventesCat} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="montant">
                {ventesCat.map((_, i) => (
                  <Cell key={i} fill={ventesCat[i].couleur} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatMontant(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {ventesCat.map((cat) => (
              <div key={cat.nom} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.couleur }} />
                  <span className="text-lounge-300">{cat.nom}</span>
                </div>
                <span className="font-semibold text-lounge-100">{cat.part}% — {formatMontant(cat.montant)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Peak Hours + Recent + Alerts ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Peak Hours */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 p-6 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-lounge-100 mb-1">Heures d'affluence</h3>
          <p className="text-xs text-lounge-400 mb-5">Commandes moyennes par heure</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={commandesHeure}>
              <CartesianGrid strokeDasharray="3 4" strokeOpacity="0.1" vertical={false} />
              <XAxis dataKey="heure" tick={{ fontSize: 10, fill: "#6B5D50" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6B5D50" }} axisLine={false} tickLine={false} tickCount={4} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="commandes" radius={[4, 4, 0, 0]} fill="#D4A853" fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Commands */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[#D4A853]/8 px-6 py-4">
            <div>
              <h3 className="text-sm font-semibold text-lounge-100">Commandes Récentes</h3>
              <p className="mt-0.5 text-xs text-lounge-400">Dernières transactions</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-[#D4A853] hover:text-gold-300 cursor-pointer">
              Voir tout <ChevronRight size={14} />
            </span>
          </div>
          <div className="divide-y divide-[#D4A853]/5">
            {recentCmds.slice(0, 6).map((cmd) => (
              <div key={cmd.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-[#D4A853]/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A853]/10 text-[#D4A853]">
                    {statusIcon[cmd.statut] || <Receipt size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-lounge-100">{cmd.id}</p>
                    <p className="text-xs text-lounge-400">{cmd.table_nom} · {cmd.heure}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={cmd.statut}>{cmd.statut}</Badge>
                  <span className="text-sm font-semibold text-lounge-100">{formatMontant(cmd.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Alerts Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 grid gap-4 sm:grid-cols-2"
      >
        {/* Stock Alerts */}
        <div className="bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} className="text-[#D4A853]" />
            <h3 className="text-sm font-semibold text-lounge-100">Alertes Stock</h3>
          </div>
          <div className="space-y-3">
            {alertes.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl bg-red-500/5 p-3">
                <div>
                  <p className="text-sm font-medium text-lounge-100">{a.nom}</p>
                  <p className="text-xs text-lounge-400">{a.alerte ? "Stock bas" : "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-400">{a.stockActuel} <span className="text-xs font-normal text-lounge-400">/ {a.stockMin}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dépenses Breakdown */}
        <div className="bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={18} className="text-rose-400" />
            <h3 className="text-sm font-semibold text-lounge-100">Dépenses du mois</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Fournisseurs", amount: depensesFournisseurs, color: "bg-[#D4A853]" },
              { label: "Salaires", amount: depensesStaff, color: "bg-emerald-400" },
              { label: "Impôts & Taxes", amount: depensesImpots, color: "bg-[#D4A853]" },
            ].map((dep) => (
              <div key={dep.label} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${dep.color}`} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-lounge-300">{dep.label}</span>
                    <span className="text-sm font-semibold text-lounge-100">{formatMontant(dep.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-lounge-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${dep.color}`}
                      style={{ width: `${stats.depenses ? (dep.amount / stats.depenses) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
