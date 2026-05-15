import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { Badge } from "../components/ui/badge";
import { formatMontant } from "../data/mockData";
import {
  Users, Plus, Search, DollarSign, UserPlus, User, Phone, Mail, MapPin, Calendar, X, FileText, CreditCard, Check, Wallet, Clock,
} from "lucide-react";

const colorClasses = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-500" },
  red: { bg: "bg-red-50", text: "text-red-500" },
  amber: { bg: "bg-amber-50", text: "text-amber-500" },
};

export function Personnel() {
  const personnel = useAppStore((s) => s.personnel);
  const salariesMois = useAppStore((s) => s.salariesMois);
  const fetchPersonnel = useAppStore((s) => s.fetchPersonnel);
  const fetchSalaires = useAppStore((s) => s.fetchSalaires);
  const payerSalaire = useAppStore((s) => s.payerSalaire);
  const updateSalaire = useAppStore((s) => s.updateSalaireMontant);
  const [tab, setTab] = useState("equipe");

  useEffect(() => {
    fetchPersonnel();
    fetchSalaires();
    // refresh toutes les 5s pour voir les connexions/deconnexions
    const interval = setInterval(fetchPersonnel, 5000);
    return () => clearInterval(interval);
  }, [fetchPersonnel, fetchSalaires]);
  const [search, setSearch] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ nom: "", prenom: "", email: "", telephone: "", poste: "", actif: true });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ nom: "", prenom: "", poste: "", email: "", telephone: "", salaire: "", mot_de_passe: "" });

  const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

  const handleSubmitAdd = async () => {
    if (!addForm.nom || !addForm.prenom || !addForm.poste) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const salaire = parseInt(addForm.salaire) || 200000;
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          nom: addForm.nom,
          prenom: addForm.prenom,
          poste: addForm.poste,
          email: addForm.email,
          telephone: addForm.telephone,
          date_embauche: today,
          mot_de_passe: addForm.mot_de_passe || `${addForm.prenom}123!`,
          role: "serveur",
          salaire: salaire,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAdd(false);
        setAddForm({ nom: "", prenom: "", poste: "", email: "", telephone: "", salaire: "", mot_de_passe: "" });
        fetchPersonnel();
        fetchSalaires();
      } else {
        console.error("Register failed:", data);
        alert("Erreur: " + (data.message || "Inconnue"));
      }
    } catch (err) {
      console.error("Erreur ajout employé:", err);
      alert("Erreur réseau: " + err.message);
    }
  };

  const handleEdit = async () => {
    if (!selectedEmp?.id) return;
    try {
      const res = await fetch(`${API_URL}/personnel/${selectedEmp.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setEditMode(false);
        setSelectedEmp({ ...selectedEmp, ...editForm });
        fetchPersonnel();
      }
    } catch (err) {
      console.error("Erreur modification employé:", err);
    }
  };

  const filtered = personnel.filter((p) =>
    !search || `${p.nom} ${p.prenom} ${p.poste}`.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    present: personnel.filter((p) => p.statut === "present").length,
    absent: personnel.filter((p) => p.statut === "absent").length,
    conge: personnel.filter((p) => p.statut === "conge").length,
  };

  const totalSalaires = salariesMois.reduce((s, sal) => s + sal.montant, 0);
  const pays = salariesMois.filter((s) => s.statut === "paye").length;
  const enAttente = salariesMois.filter((s) => s.statut === "en attente").length;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personnel</h1>
          <p className="text-sm text-gray-500">Gestion des employés et salaires</p>
        </div>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/20">
          <UserPlus size={16} />
          Ajouter employé
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: "Total", value: personnel.length, color: "indigo", icon: Users },
          { label: "Présents", value: counts.present, color: "emerald", icon: Check },
          { label: "Absents", value: counts.absent, color: "red", icon: X },
          { label: "En congé", value: counts.conge, color: "amber", icon: Calendar },
        ].map((s) => (
          <motion.div key={s.label} variants={itemVariants} initial="hidden" animate="show" className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">{s.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClasses[s.color]?.bg || "bg-gray-50"}`}>
                <s.icon size={14} className={colorClasses[s.color]?.text || "text-gray-500"} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button onClick={() => setTab("equipe")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "equipe" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          Équipe ({personnel.length})
        </button>
        <button onClick={() => setTab("salaires")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "salaires" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          Salaires ({salariesMois.length})
        </button>
      </div>

      {/* ── Tab: Équipe ── */}
      {tab === "equipe" && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          {/* Search */}
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((emp) => (
              <motion.div key={emp.id} variants={itemVariants}
                onClick={() => setSelectedEmp(emp)}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-sm">
                    {emp.prenom[0]}{emp.nom[0]}
                    {emp.online && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{emp.prenom} {emp.nom}</p>
                    <p className="text-xs text-gray-500">{emp.poste}
                      {emp.role && emp.role !== "admin" && (
                        <span className="ml-1 text-gray-400">· {emp.role}</span>
                      )}
                    </p>
                  </div>
                  <Badge variant={emp.statut}>{emp.statut}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{emp.dateEmbauche}</span>
                  <span className="font-medium text-gray-600">{formatMontant(emp.salaire)}/mois</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Tab: Salaires ── */}
      {tab === "salaires" && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900">Salaires du mois</h3>
            <p className="text-xs text-gray-400">Janvier 2026 — Total: {formatMontant(totalSalaires)}</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Employé</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Poste</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {salariesMois.map((sal) => (
                <tr key={sal.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{sal.employe}</td>
                  <td className="px-6 py-4 text-gray-500">{sal.poste}</td>
                  <td className="px-6 py-4 text-right">
                    <input
                      type="number"
                      defaultValue={sal.montant}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        if (val && val !== sal.montant) updateSalaire(sal.id, val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = parseInt(e.target.value);
                          if (val && val !== sal.montant) updateSalaire(sal.id, val);
                          e.target.blur();
                        }
                      }}
                      className="text-right w-28 h-8 rounded-lg bg-gray-50 border border-gray-200 px-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    />
                  </td>
                  <td className="px-6 py-4 text-center"><Badge variant={sal.statut}>{sal.statut}</Badge></td>
                  <td className="px-6 py-4 text-center">
                    {sal.statut === "en attente" && (
                      <button onClick={() => payerSalaire(sal.id)} className="flex items-center gap-1 h-7 px-3 rounded-md bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600">
                        <Wallet size={12} /> Payer
                      </button>
                    )}
                    {sal.statut === "paye" && (
                      <span className="text-xs text-gray-400 flex items-center justify-center gap-1"><Check size={12} /> Payé</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* ── Employee Detail Modal ── */}
      <AnimatePresence>
        {selectedEmp && !editMode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => { setSelectedEmp(null); setEditMode(false); }} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[480px] bg-white rounded-2xl shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">Fiche employe</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    setEditMode(true);
                    setEditForm({ nom: selectedEmp.nom, prenom: selectedEmp.prenom, email: selectedEmp.email, telephone: selectedEmp.telephone || "", poste: selectedEmp.poste || "", actif: selectedEmp.actif !== false });
                  }} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition-colors">
                    <FileText size={12} /> Modifier
                  </button>
                  <button onClick={() => { setSelectedEmp(null); setEditMode(false); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xl font-bold">
                    {selectedEmp.prenom[0]}{selectedEmp.nom[0]}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{selectedEmp.prenom} {selectedEmp.nom}</p>
                    <p className="text-sm text-gray-500">{selectedEmp.poste}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Mail, label: "Email", value: selectedEmp.email },
                    { icon: Phone, label: "Telephone", value: selectedEmp.telephone },
                    { icon: Calendar, label: "Embauche", value: selectedEmp.dateEmbauche },
                    { icon: DollarSign, label: "Salaire", value: formatMontant(selectedEmp.salaire) },
                    { icon: User, label: "Statut", value: selectedEmp.statut },
                    { icon: Clock, label: "Arrivee", value: selectedEmp.heureArrivee || "—" },
                  ].map((info) => (
                    <div key={info.label} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <info.icon size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-400">{info.label}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{info.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* ── Employee Edit Modal ── */}
        {selectedEmp && editMode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => { setSelectedEmp(null); setEditMode(false); }} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[480px] bg-white rounded-2xl shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">Modifier l'employe</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditMode(false)} className="text-sm text-gray-500 hover:text-gray-700">Annuler</button>
                  <button onClick={() => { setSelectedEmp(null); setEditMode(false); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {["prenom", "nom", "email", "telephone", "poste"].map((field) => (
                  <div key={field}>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input
                      value={editForm[field]}
                      onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                      className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Actif</label>
                  <input
                    type="checkbox"
                    checked={editForm.actif}
                    onChange={(e) => setEditForm({ ...editForm, actif: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-100"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleEdit}
                    className="flex-1 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/20">
                    Enregistrer
                  </button>
                  <button onClick={() => setEditMode(false)}
                    className="h-10 px-6 rounded-xl bg-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-200">
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Add Employee Modal ── */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[480px] bg-white rounded-2xl shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">Ajouter un employé</h3>
                <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                {["nom", "prenom", "poste", "email", "telephone"].map((field) => (
                  <div key={field}>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input
                      value={addForm[field]}
                      onChange={(e) => setAddForm({ ...addForm, [field]: e.target.value })}
                      className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                ))}
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={addForm.mot_de_passe}
                    onChange={(e) => setAddForm({ ...addForm, mot_de_passe: e.target.value })}
                    placeholder="Optionnel, sinon prenom123!"
                    className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Salaire</label>
                  <input
                    type="number"
                    value={addForm.salaire}
                    onChange={(e) => setAddForm({ ...addForm, salaire: e.target.value })}
                    className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <button onClick={handleSubmitAdd} className="w-full h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/20">
                  Ajouter
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
