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

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl border border-lounge-600 bg-lounge-900 p-3 shadow-lg">
      <p className="mb-2 font-semibold text-lounge-100">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
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

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="text-[#D4A853]" size={22} />
            <h1 className="text-2xl font-bold text-lounge-100">Historique des Connexions</h1>
          </div>
          <p className="text-sm text-lounge-400">Suivi des sessions utilisateur et statistiques</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportToCSV}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#1A1714] border border-[#D4A853]/10 text-sm font-medium text-lounge-200 hover:border-[#D4A853]/15 transition-colors shadow-sm"
        >
          <Download size={16} />
          Exporter CSV
        </motion.button>
      </div>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 p-5 mb-8 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-lounge-100 mb-4">Filtres</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs text-lounge-400 mb-1 block">Date de début</label>
            <input
              type="date"
              value={filters.dateDebut}
              onChange={(e) => setFilters({...filters, dateDebut: e.target.value})}
              className="w-full h-10 px-3 rounded-lg bg-lounge-800 border border-[#D4A853]/10 text-sm text-lounge-100 focus:border-[#D4A853]/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-lounge-400 mb-1 block">Date de fin</label>
            <input
              type="date"
              value={filters.dateFin}
              onChange={(e) => setFilters({...filters, dateFin: e.target.value})}
              className="w-full h-10 px-3 rounded-lg bg-lounge-800 border border-[#D4A853]/10 text-sm text-lounge-100 focus:border-[#D4A853]/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-lounge-400 mb-1 block">Utilisateur</label>
            <select
              value={filters.utilisateur}
              onChange={(e) => setFilters({...filters, utilisateur: e.target.value})}
              className="w-full h-10 px-3 rounded-lg bg-lounge-800 border border-[#D4A853]/10 text-sm text-lounge-100 focus:border-[#D4A853]/30 focus:outline-none"
            >
              <option value="">Tous les utilisateurs</option>
              {personnel.map(p => (
                <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFilter}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#D4A853]/10 text-sm font-medium text-[#D4A853] hover:bg-[#D4A853]/15 transition-colors"
          >
            <Filter size={16} />
            Appliquer les filtres
          </motion.button>
        </div>
      </motion.div>

      {/* Alertes sessions longues */}
      {sessionsLongues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-lounge-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={18} />
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard
          title="Connexions totales"
          value={stats.totalConnexions}
          icon={<Activity size={20} />}
          trend={null}
          color="amber"
        />
        <StatCard
          title="Durée moyenne"
          value={`${Math.round(stats.moyenneDuree / 60)} min`}
          icon={<Clock size={20} />}
          trend={null}
          color="stone"
        />
        <StatCard
          title="Sessions longues"
          value={stats.sessionsLongues}
          icon={<AlertTriangle size={20} />}
          trend={null}
          color="red"
        />
        <StatCard
          title="Utilisateurs actifs"
          value={stats.utilisateursActifs}
          icon={<User size={20} />}
          trend={null}
          color="emerald"
        />
      </div>

      {/* Graphiques */}
      <div className="grid gap-4 xl:grid-cols-5 mb-8">
        {/* Connexions par jour */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-3 bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 p-6 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-lounge-100 mb-1">Évolution des connexions</h3>
          <p className="text-xs text-lounge-400 mb-4">Nombre de sessions par jour</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={connexionsParJour}>
              <defs>
                <linearGradient id="gradConnexions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A853" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#D4A853" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 4" strokeOpacity="0.1" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B5D50" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B5D50" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="connexions" stroke="#D4A853" strokeWidth={2.5} fill="url(#gradConnexions)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Connexions par heure */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2 bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 p-6 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-lounge-100 mb-1">Heures d'activité</h3>
          <p className="text-xs text-lounge-400 mb-4">Connexions par heure</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={connexionsParHeure}>
              <CartesianGrid strokeDasharray="3 4" strokeOpacity="0.1" vertical={false} />
              <XAxis dataKey="heure" tick={{ fontSize: 10, fill: "#6B5D50" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6B5D50" }} axisLine={false} tickLine={false} tickCount={4} />
              <Tooltip />
              <Bar dataKey="connexions" radius={[4, 4, 0, 0]} fill="#D4A853" fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top utilisateurs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 p-6 mb-8 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-lounge-100 mb-1">Top des utilisateurs</h3>
        <p className="text-xs text-lounge-400 mb-4">Nombre de sessions par utilisateur</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statsUtilisateurs} layout="horizontal">
            <CartesianGrid strokeDasharray="3 4" strokeOpacity="0.1" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#6B5D50" }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="nom"
              type="category"
              tick={{ fontSize: 11, fill: "#6B5D50" }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              formatter={(value, name) => [value, name === "connexions" ? "Sessions" : "Durée moyenne (min)"]}
              labelFormatter={(label) => `Utilisateur: ${label}`}
            />
            <Bar dataKey="connexions" radius={[0, 4, 4, 0]} fill="#D4A853" fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Tableau des connexions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[#D4A853]/8">
          <h3 className="text-sm font-semibold text-lounge-100">Détail des connexions</h3>
          <p className="mt-0.5 text-xs text-lounge-400">Liste complète des sessions utilisateur</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-lounge-400 border-b border-[#D4A853]/8">
                <th className="px-6 py-3">Utilisateur</th>
                <th className="px-6 py-3">Rôle</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Heure</th>
                <th className="px-6 py-3 text-right">Durée</th>
                <th className="px-6 py-3">IP</th>
                <th className="px-6 py-3">Appareil</th>
              </tr>
            </thead>
            <tbody>
              {connectionHistory.map((h) => (
                <tr key={h.id} className="text-xs text-lounge-300 border-b border-[#D4A853]/5 hover:bg-[#D4A853]/5 transition-colors">
                  <td className="px-6 py-3 font-medium">{h.utilisateur_nom}</td>
                  <td className="px-6 py-3">
                    <Badge variant={h.utilisateur_role === "admin" ? "default" : "secondary"}>
                      {h.utilisateur_role}
                    </Badge>
                  </td>
                  <td className="px-6 py-3">{h.date_connexion}</td>
                  <td className="px-6 py-3">{h.heure_connexion}</td>
                  <td className="px-6 py-3 text-right">
                    {Math.round((h.duree_session || 0) / 60)} min
                  </td>
                  <td className="px-6 py-3">{h.adresse_ip}</td>
                  <td className="px-6 py-3">{h.appareil}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}