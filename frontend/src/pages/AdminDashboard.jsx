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
    <div className="rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-md p-3 shadow-xl">
      <p className="mb-2 font-semibold text-zinc-50">{label}</p>
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
    <div className="rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-md p-3 shadow-xl">
      <p className="font-semibold text-zinc-50">{label} heure</p>
      <p className="text-sm text-zinc-400">
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="text-brand-500" size={24} />
            <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Tableau de bord</h1>
          </div>
          <p className="text-sm text-zinc-400">Aperçu en temps réel des performances</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-zinc-900 border border-white/10 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 transition-colors shadow-sm"
        >
          <ArrowUpRight size={16} />
          Exporter
        </motion.button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard
          title="Chiffre d'Affaires"
          value={formatMontant(stats.ca)}
          icon={<TrendingUp size={20} />}
          trend={caTrend ? parseFloat(caTrend) : 0}
        />
        <StatCard
          title="Bénéfice Net"
          value={formatMontant(stats.benefice)}
          icon={<Wallet size={20} />}
          trend={beneficeTrend ? parseFloat(beneficeTrend) : 0}
        />
        <StatCard
          title="Commandes du mois"
          value={stats.nombreCommandes}
          icon={<Receipt size={20} />}
          trend={cmdTrend ? parseFloat(cmdTrend) : 0}
        />
        <StatCard
          title="Panier Moyen"
          value={formatMontant(stats.panierMoyen)}
          icon={<Target size={20} />}
          trend={null}
        />
      </div>

      {/* ── KPI Breakdown Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid gap-4 sm:grid-cols-3 mb-8"
      >
        <div className="rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-5 shadow-lg card-hover">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-zinc-400">Marge brute</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10">
              <Target size={16} className="text-brand-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-50">{stats.margeBrute}%</p>
          <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.margeBrute}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full rounded-full bg-brand-500"
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-5 shadow-lg card-hover">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-zinc-400">Tables actives</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Receipt size={16} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-50">{stats.tablesOccupees}<span className="text-lg text-zinc-500 font-normal"> / {stats.tablesTotal}</span></p>
          <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.tablesOccupees / stats.tablesTotal) * 100}%` }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-5 shadow-lg card-hover">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-zinc-400">Alertes stock</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
              <Package size={16} className="text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-400">{alertes.length}</p>
          <p className="text-xs text-zinc-500 mt-2">Produits en rupture imminente</p>
        </div>
      </motion.div>

      {/* ── Charts Row ── */}
      <div className="grid gap-4 xl:grid-cols-5 mb-8">
        {/* CA vs Dépenses */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-3 rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-50">Revenus & Dépenses</h3>
              <p className="mt-1 text-xs text-zinc-400">Évolution sur 12 mois</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(212,168,83,0.8)]" /> CA
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> Dépenses
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenus} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4a853" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#d4a853" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 4" strokeOpacity="0.1" vertical={false} stroke="#ffffff" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} dy={10} />
              <YAxis
                tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ca" name="Chiffre d'Affaires" stroke="#d4a853" strokeWidth={2.5} fill="url(#gradCA)" />
              <Area type="monotone" dataKey="depenses" name="Dépenses" stroke="#ef4444" strokeWidth={2} fill="url(#gradDep)" strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Ventes par Catégorie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg"
        >
          <h3 className="text-base font-semibold text-zinc-50 mb-1">Ventes par Catégorie</h3>
          <p className="text-xs text-zinc-400 mb-4">Répartition du CA mensuel</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={ventesCat} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="montant" stroke="none">
                {ventesCat.map((_, i) => (
                  <Cell key={i} fill={ventesCat[i].couleur} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatMontant(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 mt-4">
            {ventesCat.map((cat) => (
              <div key={cat.nom} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.couleur, boxShadow: `0 0 8px ${cat.couleur}80` }} />
                  <span className="text-zinc-300 font-medium">{cat.nom}</span>
                </div>
                <span className="font-semibold text-zinc-100">{cat.part}% <span className="text-zinc-500 font-normal ml-2">{formatMontant(cat.montant)}</span></span>
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
          className="rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg"
        >
          <h3 className="text-base font-semibold text-zinc-50 mb-1">Heures d'affluence</h3>
          <p className="text-xs text-zinc-400 mb-6">Commandes moyennes par heure</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={commandesHeure} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 4" strokeOpacity="0.1" vertical={false} stroke="#ffffff" />
              <XAxis dataKey="heure" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} tickCount={4} />
              <Tooltip content={<CustomBarTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Bar dataKey="commandes" radius={[4, 4, 0, 0]} fill="#d4a853" fillOpacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Commands */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md shadow-lg flex flex-col"
        >
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
            <div>
              <h3 className="text-base font-semibold text-zinc-50">Commandes Récentes</h3>
              <p className="mt-1 text-xs text-zinc-400">Dernières transactions</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-400 transition-colors">
              Voir tout <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="divide-y divide-white/5">
              {recentCmds.slice(0, 6).map((cmd) => (
                <div key={cmd.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/50 border border-white/5 text-zinc-400">
                      {statusIcon[cmd.statut] || <Receipt size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{cmd.id}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{cmd.table_nom} · {cmd.heure}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={cmd.statut}>{cmd.statut}</Badge>
                    <span className="text-sm font-bold text-zinc-50">{formatMontant(cmd.total)}</span>
                  </div>
                </div>
              ))}
            </div>
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
        <div className="rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-red-500/10 rounded-lg">
               <Package size={18} className="text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-zinc-50">Alertes Stock</h3>
          </div>
          <div className="space-y-3">
            {alertes.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 border border-red-500/10 p-3.5">
                <div>
                  <p className="text-sm font-medium text-zinc-100">{a.nom}</p>
                  <p className="text-xs text-red-400/80 mt-0.5">{a.alerte ? "Stock critique" : "Stock bas"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-500">{a.stockActuel} <span className="text-xs font-medium text-zinc-500">/ {a.stockMin} min</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dépenses Breakdown */}
        <div className="rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-md p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-brand-500/10 rounded-lg">
               <Wallet size={18} className="text-brand-500" />
            </div>
            <h3 className="text-base font-semibold text-zinc-50">Dépenses du mois</h3>
          </div>
          <div className="space-y-5">
            {[
              { label: "Fournisseurs", amount: depensesFournisseurs, color: "bg-brand-500" },
              { label: "Salaires", amount: depensesStaff, color: "bg-emerald-500" },
              { label: "Impôts & Taxes", amount: depensesImpots, color: "bg-purple-500" },
            ].map((dep) => (
              <div key={dep.label} className="flex items-center gap-4">
                <div className={`h-10 w-1 rounded-full ${dep.color}`} />
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-300">{dep.label}</span>
                    <span className="text-sm font-bold text-zinc-100">{formatMontant(dep.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
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
