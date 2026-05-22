import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { StatCard } from "../components/ui/statCard";
import { Badge } from "../components/ui/badge";
import { ConnectionAlert } from "../components/ui/ConnectionAlert";
import {
  Calendar,
  Download,
  AlertTriangle,
  Clock,
  User,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Activity,
  FileSpreadsheet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

const GOLD = "#D4A853";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 shadow-xl backdrop-blur-md">
      <p className="mb-2 font-bold text-zinc-50">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold flex items-center justify-between gap-4" style={{ color: entry.color }}>
          <span>{entry.name}</span>
          <span>{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function ConnectionHistory() {
  const connectionHistory = useAppStore((s) => s.connectionHistory);
  const fetchConnectionHistory = useAppStore((s) => s.fetchConnectionHistory);
  const personnel = useAppStore((s) => s.personnel);

  const [filters, setFilters] = useState({
    dateDebut: "",
    dateFin: "",
    utilisateur: "",
  });
  const [stats, setStats] = useState({
    totalConnexions: 0,
    moyenneDuree: 0,
    sessionsLongues: 0,
    utilisateursActifs: 0,
  });

  const [sessionsLongues, setSessionsLongues] = useState([]);

  useEffect(() => {
    fetchConnectionHistory();
  }, []);

  useEffect(() => {
    if (connectionHistory.length > 0) {
      calculerStats();
    }
  }, [connectionHistory]);

  const calculerStats = () => {
    const totalConnexions = connectionHistory.length;
    const durees = connectionHistory.map(h => h.duree_session || 0);
    const moyenneDuree = durees.reduce((a, b) => a + b, 0) / totalConnexions;
    const sessionsLongues = connectionHistory.filter(h => (h.duree_session || 0) > 3600);
    const utilisateursUniques = new Set(connectionHistory.map(h => h.utilisateur_id)).size;

    setStats({
      totalConnexions,
      moyenneDuree: Math.round(moyenneDuree),
      sessionsLongues: sessionsLongues.length,
      utilisateursActifs: utilisateursUniques,
    });
    setSessionsLongues(sessionsLongues);
  };

  const handleFilter = () => {
    fetchConnectionHistory(filters);
  };

  const exportToCSV = () => {
    const headers = ["ID", "Utilisateur", "Email", "Rôle", "Date de connexion", "Heure de connexion", "Durée (min)", "Adresse IP", "Appareil"];
    const csvData = [
      headers.join(","),
      ...connectionHistory.map(h => [
        h.id,
        h.utilisateur_nom,
        h.utilisateur_email,
        h.utilisateur_role,
        h.date_connexion,
        h.heure_connexion,
        Math.round((h.duree_session || 0) / 60),
        h.adresse_ip,
        h.appareil
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `historique_connexions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const preparerDonneesGraphique = () => {
    const parJour = {};
    connectionHistory.forEach(h => {
      const jour = h.date_connexion;
      if (!parJour[jour]) {
        parJour[jour] = 0;
      }
      parJour[jour]++;
    });

    return Object.entries(parJour).map(([date, count]) => ({
      date,
      connexions: count,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const preparerDonneesHeures = () => {
    const parHeure = Array(24).fill(0);
    connectionHistory.forEach(h => {
      const heure = new Date(h.heure_connexion).getHours();
      parHeure[heure]++;
    });

    return parHeure.map((count, heure) => ({
      heure: `${heure}:00`,
      connexions: count,
    }));
  };

  const preparerDonneesUtilisateurs = () => {
    const statsUtilisateurs = {};
    connectionHistory.forEach(h => {
      if (!statsUtilisateurs[h.utilisateur_nom]) {
        statsUtilisateurs[h.utilisateur_nom] = {
          nom: h.utilisateur_nom,
          role: h.utilisateur_role,
          connexions: 0,
          dureeTotale: 0,
        };
      }
      statsUtilisateurs[h.utilisateur_nom].connexions++;
      statsUtilisateurs[h.utilisateur_nom].dureeTotale += h.duree_session || 0;
    });

    return Object.values(statsUtilisateurs).map(u => ({
      nom: u.nom,
      role: u.role,
      connexions: u.connexions,
      dureeMoyenne: Math.round(u.dureeTotale / u.connexions / 60),
    })).sort((a, b) => b.connexions - a.connexions).slice(0, 10);
  };

  const connexionsParJour = preparerDonneesGraphique();
  const connexionsParHeure = preparerDonneesHeures();
  const statsUtilisateurs = preparerDonneesUtilisateurs();

  const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div className="max-w-7xl mx-auto" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="bg-brand-500/10 p-2 rounded-xl">
               <Activity className="text-brand-500" size={24} />
             </div>
            <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Historique des Connexions</h1>
          </div>
          <p className="text-sm font-medium text-zinc-400 mt-1 ml-[52px]">Suivi des sessions utilisateur et statistiques</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportToCSV}
          className="flex items-center gap-2 h-11 px-5 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-white/10 text-sm font-bold text-zinc-200 hover:border-brand-500/50 hover:bg-zinc-800 transition-all shadow-sm"
        >
          <Download size={18} />
          Exporter CSV
        </motion.button>
      </motion.div>

      {/* Filtres */}
      <motion.div
        variants={itemVariants}
        className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 mb-8 shadow-lg"
      >
        <h3 className="text-base font-bold text-zinc-50 mb-5 flex items-center gap-2">
           <Filter size={18} className="text-zinc-400" /> Filtres de recherche
        </h3>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Date de début</label>
            <input
              type="date"
              value={filters.dateDebut}
              onChange={(e) => setFilters({...filters, dateDebut: e.target.value})}
              className="w-full h-11 px-4 rounded-xl bg-zinc-950 border border-white/10 text-sm font-medium text-zinc-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Date de fin</label>
            <input
              type="date"
              value={filters.dateFin}
              onChange={(e) => setFilters({...filters, dateFin: e.target.value})}
              className="w-full h-11 px-4 rounded-xl bg-zinc-950 border border-white/10 text-sm font-medium text-zinc-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Utilisateur</label>
            <select
              value={filters.utilisateur}
              onChange={(e) => setFilters({...filters, utilisateur: e.target.value})}
              className="w-full h-11 px-4 rounded-xl bg-zinc-950 border border-white/10 text-sm font-medium text-zinc-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all shadow-inner appearance-none"
            >
              <option value="">Tous les utilisateurs</option>
              {personnel.map(p => (
                <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFilter}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-brand-500/10 text-sm font-bold text-brand-500 border border-brand-500/20 hover:bg-brand-500/20 transition-colors shadow-sm"
          >
            <Search size={18} />
            Rechercher
          </motion.button>
        </div>
      </motion.div>

      {/* Alertes sessions longues */}
      {sessionsLongues.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <AlertTriangle className="text-red-500" size={18} />
            Sessions anormalement longues
          </h3>
          <div className="space-y-3">
            {sessionsLongues.slice(0, 5).map((connection) => (
              <ConnectionAlert key={connection.id} connection={connection} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Statistiques */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <motion.div variants={itemVariants}>
           <StatCard
             title="Connexions totales"
             value={stats.totalConnexions}
             icon={<Activity size={20} />}
             trend={null}
             color="amber"
           />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Durée moyenne"
            value={`${Math.round(stats.moyenneDuree / 60)} min`}
            icon={<Clock size={20} />}
            trend={null}
            color="stone"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Sessions longues"
            value={stats.sessionsLongues}
            icon={<AlertTriangle size={20} />}
            trend={null}
            color="red"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Utilisateurs actifs"
            value={stats.utilisateursActifs}
            icon={<User size={20} />}
            trend={null}
            color="emerald"
          />
        </motion.div>
      </div>

      {/* Graphiques */}
      <div className="grid gap-5 xl:grid-cols-5 mb-8">
        {/* Connexions par jour */}
        <motion.div
          variants={itemVariants}
          className="xl:col-span-3 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-lg"
        >
          <h3 className="text-base font-bold text-zinc-50 mb-1">Évolution des connexions</h3>
          <p className="text-sm font-medium text-zinc-400 mb-6">Nombre de sessions par jour</p>
          <div className="bg-zinc-950/30 p-4 rounded-xl border border-white/5">
             <ResponsiveContainer width="100%" height={260}>
               <AreaChart data={connexionsParJour} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="gradConnexions" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor={GOLD} stopOpacity={0.4} />
                     <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 4" stroke="#27272a" vertical={false} />
                 <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                 <YAxis tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                 <Tooltip content={<CustomTooltip />} cursor={{stroke: 'rgba(255,255,255,0.1)'}} />
                 <Area type="monotone" dataKey="connexions" name="Connexions" stroke={GOLD} strokeWidth={3} fill="url(#gradConnexions)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Connexions par heure */}
        <motion.div
          variants={itemVariants}
          className="xl:col-span-2 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-lg"
        >
          <h3 className="text-base font-bold text-zinc-50 mb-1">Heures d'activité</h3>
          <p className="text-sm font-medium text-zinc-400 mb-6">Connexions par heure</p>
          <div className="bg-zinc-950/30 p-4 rounded-xl border border-white/5 h-[292px] flex items-center">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={connexionsParHeure} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 4" stroke="#27272a" vertical={false} />
                 <XAxis dataKey="heure" tick={{ fontSize: 11, fill: "#a1a1aa", fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                 <YAxis tick={{ fontSize: 11, fill: "#a1a1aa", fontWeight: 600 }} axisLine={false} tickLine={false} tickCount={4} dx={-10} />
                 <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', fontWeight: 'bold', color: '#fafafa'}} itemStyle={{color: '#fafafa'}} />
                 <Bar dataKey="connexions" name="Connexions" radius={[4, 4, 0, 0]} fill={GOLD} fillOpacity={0.9} maxBarSize={30} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Top utilisateurs */}
      <motion.div
        variants={itemVariants}
        className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 mb-8 shadow-lg"
      >
        <h3 className="text-base font-bold text-zinc-50 mb-1">Top des utilisateurs</h3>
        <p className="text-sm font-medium text-zinc-400 mb-6">Nombre de sessions par utilisateur</p>
        <div className="bg-zinc-950/30 p-4 rounded-xl border border-white/5">
           <ResponsiveContainer width="100%" height={300}>
             <BarChart data={statsUtilisateurs} layout="horizontal" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 4" stroke="#27272a" horizontal={false} />
               <XAxis type="number" tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600 }} axisLine={false} tickLine={false} />
               <YAxis
                 dataKey="nom"
                 type="category"
                 tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600 }}
                 axisLine={false}
                 tickLine={false}
                 width={120}
               />
               <Tooltip
                 cursor={{fill: 'rgba(255,255,255,0.05)'}}
                 contentStyle={{backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', fontWeight: 'bold', color: '#fafafa'}}
                 formatter={(value, name) => [value, name === "connexions" ? "Sessions" : "Durée moyenne (min)"]}
                 labelFormatter={(label) => `Utilisateur: ${label}`}
               />
               <Bar dataKey="connexions" radius={[0, 4, 4, 0]} fill={GOLD} fillOpacity={0.9} maxBarSize={20} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Tableau des connexions */}
      <motion.div
        variants={itemVariants}
        className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-white/5 bg-zinc-950/30 flex items-center justify-between">
           <div>
             <h3 className="text-lg font-bold text-zinc-50">Détail des connexions</h3>
             <p className="mt-0.5 text-sm font-medium text-zinc-400">Liste complète des sessions utilisateur</p>
           </div>
           <div className="bg-brand-500/10 p-2 rounded-xl">
               <FileSpreadsheet size={20} className="text-brand-500" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-zinc-400 bg-zinc-950/50 border-b border-white/5">
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Heure</th>
                <th className="px-6 py-4 text-right">Durée</th>
                <th className="px-6 py-4">IP</th>
                <th className="px-6 py-4">Appareil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {connectionHistory.map((h) => (
                <tr key={h.id} className="text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-100">{h.utilisateur_nom}</td>
                  <td className="px-6 py-4">
                    <Badge variant={h.utilisateur_role === "admin" ? "default" : "secondary"}>
                      {h.utilisateur_role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{h.date_connexion}</td>
                  <td className="px-6 py-4">{h.heure_connexion}</td>
                  <td className="px-6 py-4 text-right font-black text-zinc-50">
                    {Math.round((h.duree_session || 0) / 60)} min
                  </td>
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{h.adresse_ip}</td>
                  <td className="px-6 py-4 text-zinc-400 max-w-[200px] truncate" title={h.appareil}>{h.appareil}</td>
                </tr>
              ))}
              {connectionHistory.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-zinc-500 font-bold bg-zinc-950/20">Aucun historique trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}