import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { Badge } from "../components/ui/badge";
import { formatMontant } from "../data/mockData";
import {
  Users, Plus, Search, DollarSign, UserPlus, User, Phone, Mail, MapPin, Calendar, X, FileText, CreditCard, Check, Wallet, Clock,
} from "lucide-react";

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
  const [addForm, setAddForm] = useState({ nom: "", prenom: "", poste: "", email: "", telephone: "", salaire: "", mot_de_passe: "", role: "" });
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

  const handleSubmitAdd = async () => {
    if (!addForm.nom || !addForm.prenom || !addForm.poste || submittingAdd) return;
    setSubmittingAdd(true);
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
          role: addForm.role || "serveur",
          salaire: salaire,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAdd(false);
        setAddForm({ nom: "", prenom: "", poste: "", email: "", telephone: "", salaire: "", mot_de_passe: "", role: "" });
        fetchPersonnel();
        fetchSalaires();
      } else {
        console.error("Register failed:", data);
        alert("Erreur: " + (data.message || "Inconnue"));
      }
    } catch (err) {
      console.error("Erreur ajout employé:", err);
      alert("Erreur réseau: " + err.message);
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedEmp?.id || submittingEdit) return;
    setSubmittingEdit(true);
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
    } finally {
      setSubmittingEdit(false);
    }
  };

  const filtered = personnel.filter((p) =>
    !search || `${p.nom} ${p.prenom} ${p.poste}`.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    actif: personnel.filter((p) => p.actif).length,
    inactif: personnel.filter((p) => !p.actif).length,
  };

  const totalSalaires = salariesMois.reduce((s, sal) => s + sal.montant, 0);
  const pays = salariesMois.filter((s) => s.statut === "paye").length;
  const enAttente = salariesMois.filter((s) => s.statut === "en attente").length;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Personnel</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestion des employés et salaires</p>
        </div>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-11 px-5 rounded-lg bg-brand-500 text-black text-sm font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
          <UserPlus size={18} />
          Ajouter employé
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: "Total", value: personnel.length, icon: Users },
          { label: "Actifs", value: counts.actif, icon: Check },
          { label: "Inactifs", value: counts.inactif, icon: X },
          { label: "Salaires", value: salariesMois.length, icon: Wallet },
        ].map((s) => (
          <motion.div key={s.label} variants={itemVariants} initial="hidden" animate="show" className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/5 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{s.label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                <s.icon size={16} className="text-zinc-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-50">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-zinc-900/50 backdrop-blur-md rounded-xl p-1 mb-6 w-fit border border-white/5">
        <button onClick={() => setTab("equipe")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === "equipe" ? "bg-brand-500 text-black shadow-md shadow-brand-500/20" : "text-zinc-400 hover:text-zinc-100"}`}>
          Équipe ({personnel.length})
        </button>
        <button onClick={() => setTab("salaires")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === "salaires" ? "bg-brand-500 text-black shadow-md shadow-brand-500/20" : "text-zinc-400 hover:text-zinc-100"}`}>
          Salaires ({salariesMois.length})
        </button>
      </div>

      {/* ── Tab: Équipe ── */}
      {tab === "equipe" && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          {/* Search */}
          <div className="relative w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un employé..." className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 pl-11 pr-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all shadow-sm" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((emp) => (
              <motion.div key={emp.id} variants={itemVariants}
                onClick={() => setSelectedEmp(emp)}
                className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/5 p-5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer card-hover flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-black font-black text-lg shadow-[0_0_15px_rgba(212,168,83,0.3)]">
                    {emp.prenom?.[0] || ""}{emp.nom?.[0] || ""}
                    {emp.online && (
                      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-zinc-900"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-zinc-50 truncate">{emp.prenom} {emp.nom}</p>
                    <p className="text-xs font-medium text-zinc-400 mt-0.5">{emp.poste}
                      {emp.role && emp.role !== "admin" && (
                        <span className="ml-1 text-zinc-500">· {emp.role}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-auto">
                    <div className="flex justify-between items-center mb-3">
                        <Badge variant={emp.statut || (emp.actif ? "actif" : "inactif")}>{emp.statut || (emp.actif ? "Actif" : "Inactif")}</Badge>
                    </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 pt-3 border-t border-white/5">
                    <span className="flex items-center gap-1.5"><Calendar size={12}/> {emp.dateEmbauche}</span>
                    <span className="text-brand-500">{formatMontant(emp.salaire)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Tab: Salaires ── */}
      {tab === "salaires" && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/5 shadow-lg overflow-hidden">
          <div className="border-b border-white/5 px-6 py-5 bg-zinc-950/30 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-zinc-50">Salaires du mois</h3>
                <p className="text-sm font-medium text-zinc-400 mt-1">Total à payer: <span className="text-brand-500 font-bold">{formatMontant(totalSalaires)}</span></p>
              </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-950/50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Employé</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Poste</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Montant</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Statut</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {salariesMois.map((sal) => (
                  <tr key={sal.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-50">{sal.employe}</td>
                    <td className="px-6 py-4 font-medium text-zinc-400">{sal.poste}</td>
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
                        className="text-right w-32 h-10 rounded-xl bg-zinc-900 border border-white/10 px-3 text-sm font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                        <Badge variant={sal.statut}>{sal.statut}</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {sal.statut === "en attente" && (
                        <button onClick={() => payerSalaire(sal.id)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-brand-500 text-black text-xs font-bold shadow-[0_0_10px_rgba(212,168,83,0.3)] hover:shadow-[0_0_15px_rgba(212,168,83,0.5)] transition-all">
                          <Wallet size={14} /> Payer
                        </button>
                      )}
                      {sal.statut === "paye" && (
                        <span className="text-xs font-bold text-emerald-500 flex items-center justify-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 w-fit mx-auto"><Check size={14} /> Payé</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Employee Detail Modal ── */}
      <AnimatePresence>
        {selectedEmp && !editMode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => { setSelectedEmp(null); setEditMode(false); }} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[480px] bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-900/50">
                <h3 className="text-lg font-bold text-zinc-50">Fiche employé</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => {
                    setEditMode(true);
                    setEditForm({ nom: selectedEmp.nom, prenom: selectedEmp.prenom, email: selectedEmp.email, telephone: selectedEmp.telephone || "", poste: selectedEmp.poste || "", actif: selectedEmp.actif !== false });
                  }} className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-zinc-800 text-zinc-100 text-xs font-bold hover:bg-zinc-700 transition-colors border border-white/5">
                    <FileText size={14} /> Modifier
                  </button>
                  <button onClick={() => { setSelectedEmp(null); setEditMode(false); }} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={20} /></button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-5 mb-8 bg-zinc-900/50 p-5 rounded-xl border border-white/5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-black text-2xl font-black shadow-[0_0_15px_rgba(212,168,83,0.3)]">
                    {selectedEmp.prenom[0]}{selectedEmp.nom[0]}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-zinc-50">{selectedEmp.prenom} {selectedEmp.nom}</p>
                    <p className="text-sm font-medium text-zinc-400 mt-1">{selectedEmp.poste}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Mail, label: "Email", value: selectedEmp.email || "Non renseigné" },
                    { icon: Phone, label: "Téléphone", value: selectedEmp.telephone || "Non renseigné" },
                    { icon: Calendar, label: "Embauche", value: selectedEmp.dateEmbauche },
                    { icon: DollarSign, label: "Salaire", value: formatMontant(selectedEmp.salaire) },
                    { icon: User, label: "Statut", value: selectedEmp.statut || (selectedEmp.actif ? "Actif" : "Inactif") },
                    { icon: Clock, label: "Arrivée", value: selectedEmp.heureArrivee || "—" },
                  ].map((info) => (
                    <div key={info.label} className="bg-zinc-900 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <info.icon size={14} className="text-zinc-500" />
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{info.label}</span>
                      </div>
                      <p className="text-sm font-bold text-zinc-100 truncate">{info.value}</p>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => { setSelectedEmp(null); setEditMode(false); }} />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[480px] bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-900/50">
                <h3 className="text-lg font-bold text-zinc-50">Modifier l'employé</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => setEditMode(false)} className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">Annuler</button>
                  <button onClick={() => { setSelectedEmp(null); setEditMode(false); }} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={20} /></button>
                </div>
              </div>
              <div className="p-6 space-y-5">
                {["prenom", "nom", "email", "telephone", "poste"].map((field) => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input
                      value={editForm[field]}
                      onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                      className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-2">
                  <label className="text-sm font-bold text-zinc-300">Employé actif</label>
                  <input
                    type="checkbox"
                    checked={editForm.actif}
                    onChange={(e) => setEditForm({ ...editForm, actif: e.target.checked })}
                    className="h-5 w-5 rounded border-white/20 text-brand-500 focus:ring-brand-500/30 bg-zinc-900"
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <button onClick={handleEdit}
                    disabled={submittingEdit}
                    className="flex-1 h-12 rounded-xl bg-brand-500 text-black text-base font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {submittingEdit ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button onClick={() => setEditMode(false)}
                    className="h-12 px-6 rounded-xl bg-zinc-800 text-sm font-bold text-zinc-300 hover:bg-zinc-700 transition-colors">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[480px] bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-900/50">
                <h3 className="text-lg font-bold text-zinc-50">Ajouter un employé</h3>
                <button onClick={() => setShowAdd(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5">
                {["nom", "prenom", "poste", "email", "telephone"].map((field) => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input
                      value={addForm[field]}
                      onChange={(e) => setAddForm({ ...addForm, [field]: e.target.value })}
                      className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Role</label>
                  <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all">
                    <option value="">Sélectionner un rôle...</option>
                    <option value="serveur">Serveur</option>
                    <option value="manager">Manager</option>
                    <option value="cuisinier">Cuisinier</option>
                    <option value="caissier">Caissier</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Mot de passe</label>
                  <input
                    type="password"
                    value={addForm.mot_de_passe}
                    onChange={(e) => setAddForm({ ...addForm, mot_de_passe: e.target.value })}
                    placeholder="Optionnel, sinon prenom123!"
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Salaire</label>
                  <input
                    type="number"
                    value={addForm.salaire}
                    onChange={(e) => setAddForm({ ...addForm, salaire: e.target.value })}
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  />
                </div>
                <div className="pt-2">
                  <button onClick={handleSubmitAdd} className="w-full h-12 rounded-xl bg-brand-500 text-black text-base font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
                    Ajouter l'employé
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
