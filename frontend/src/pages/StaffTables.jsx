import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { Badge } from "../components/ui/badge";
import { Armchair, Plus, X, Users, Grid3X3, Utensils, Coffee, GlassWater, QrCode, Trash2, CheckCircle, Save } from "lucide-react";

export function StaffTables() {
  const tables = useAppStore((s) => s.tables);
  const commandes = useAppStore((s) => s.commandesEnCours);
  const updateTable = useAppStore((s) => s.updateTable);
  const addTable = useAppStore((s) => s.addTable);
  const deleteTable = useAppStore((s) => s.deleteTable);
  const fetchTables = useAppStore((s) => s.fetchTables);
  useEffect(() => { fetchTables(); }, [fetchTables]);

  const [filterZone, setFilterZone] = useState("Tout");
  const [filterStatus, setFilterStatus] = useState("Tout");
  const [showAdd, setShowAdd] = useState(false);
  const [newTable, setNewTable] = useState({ numero: "", places: 2, zone: "Salle principale" });
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const selectedTable = tables.find((t) => t.id === selectedTableId) || null;
  const filtered = tables.filter((t) => {
    if (filterZone !== "Tout" && t.zone !== filterZone) return false;
    if (filterStatus !== "Tout" && t.statut !== filterStatus) return false;
    return true;
  });

  const zones = [...new Set(tables.map((t) => t.zone))];

  const counts = {
    libre: tables.filter((t) => t.statut === "libre").length,
    occupee: tables.filter((t) => t.statut === "occupee").length,
    reservee: tables.filter((t) => t.statut === "reservee").length,
  };

  const statusConfig = {
    libre: { bg: "bg-brand-500/10", border: "border-brand-500/20", text: "text-brand-500", dot: "bg-brand-500", label: "Libre" },
    occupee: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-500", dot: "bg-red-500", label: "Occupee" },
    reservee: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-500", dot: "bg-amber-500", label: "Reservee" },
  };

  const getTableCommande = (num) => commandes.find((c) => c.table_nom === num || c.table_numero === num);

  const handleAdd = () => {
    if (!newTable.numero) return;
    addTable({ id: Date.now(), ...newTable, statut: "libre" });
    setNewTable({ numero: "", places: 2, zone: "Salle principale" });
    setShowAdd(false);
  };

  const zoneIcons = {
    "Salle principale": Armchair,
    Terrasse: Coffee,
    VIP: GlassWater,
    Bar: Utensils,
    Prive: Armchair,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Salles & Tables</h1>
          <p className="text-sm text-zinc-400 mt-1">{tables.length} tables · {zones.length} zones</p>
        </div>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-11 px-5 rounded-lg bg-brand-500 text-black text-sm font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
          <Plus size={18} />
          Ajouter table
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: "Libres", value: counts.libre, color: ["#D4A853"] },
          { label: "Occupees", value: counts.occupee, color: ["#EF4444"] },
          { label: "Reservees", value: counts.reservee, color: ["#F59E0B"] },
          { label: "Total", value: tables.length, color: ["#D4A853"] },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/5 p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-3 w-3 rounded-full shadow-sm" style={{ background: s.color[0] }} />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{s.label}</span>
            </div>
            <p className="text-3xl font-bold text-zinc-50">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 bg-zinc-900/50 backdrop-blur-md p-3 rounded-xl border border-white/5 w-fit">
        <div className="flex items-center gap-3 pr-4 border-r border-white/10">
          <Grid3X3 size={18} className="text-zinc-500" />
          <span className="text-sm font-bold text-zinc-300">Zone:</span>
          <select value={filterZone} onChange={(e) => setFilterZone(e.target.value)}
            className="h-9 rounded-lg border border-white/10 bg-zinc-800 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 px-2 transition-all">
            <option value="Tout">Toutes</option>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-zinc-300">Statut:</span>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-lg border border-white/10 bg-zinc-800 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 px-2 transition-all">
            <option value="Tout">Tous</option>
            <option value="libre">Libre</option>
            <option value="occupee">Occupee</option>
            <option value="reservee">Reservee</option>
          </select>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {filtered.map((table, i) => {
          const sc = statusConfig[table.statut];
          const cmd = getTableCommande(table.numero);
          const ZoneIcon = zoneIcons[table.zone] || Armchair;

          return (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedTableId(table.id)}
              className={`relative rounded-2xl border ${sc.border} ${sc.bg} p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group backdrop-blur-sm`}
            >
              <span className={`absolute top-4 right-4 h-3 w-3 rounded-full ${sc.dot} shadow-sm`} />
              <button
                onClick={(e) => { e.stopPropagation(); if (confirm(`Supprimer la table ${table.numero} ?`)) deleteTable(table.id); }}
                className="absolute top-3 right-9 hidden group-hover:flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors"
              >
                <Trash2 size={12} />
              </button>

              <div className="text-center mt-2">
                <div className="flex justify-center mb-3">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 shadow-inner`}>
                    <ZoneIcon size={24} className={sc.text} />
                  </div>
                </div>
                <p className={`text-xl font-bold ${sc.text}`}>{table.numero}</p>
                <p className="text-xs font-semibold text-zinc-400 mt-1 uppercase tracking-wider">{table.zone}</p>
                <div className="flex items-center justify-center gap-1.5 mt-3 text-xs font-medium text-zinc-500 bg-zinc-900/50 py-1 rounded-full border border-white/5 w-fit mx-auto px-3">
                  <Users size={12} />
                  <span>{table.places} pl.</span>
                </div>
                {cmd && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <span className="text-xs font-bold text-zinc-300 bg-zinc-950/50 py-1 px-2 rounded-md">
                      {cmd.total.toLocaleString()} F · {cmd.items.length} items
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Table Detail Modal */}
      <AnimatePresence>
        {selectedTable && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => setSelectedTableId(null)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed inset-x-4 top-24 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[480px] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-900/50">
                <h3 className="text-xl font-bold text-zinc-50">Table {selectedTable.numero}</h3>
                <button onClick={() => setSelectedTableId(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Status change */}
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Changer le statut</p>
                  <div className="flex gap-3">
                    {["libre", "occupee", "reservee"].map((s) => (
                      <button key={s} onClick={() => updateTable(selectedTable.id, { statut: s })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                          selectedTable.statut === s
                            ? statusConfig[s].bg + " " + statusConfig[s].text + " border-" + statusConfig[s].dot.replace("bg-", "") + "/50"
                            : "bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800"
                        }`}>
                        {statusConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Edit form */}
                {editForm ? (
                  <div className="border border-white/10 bg-zinc-900/50 rounded-xl p-5 space-y-4">
                    <p className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      <Save size={16} className="text-brand-500" /> Modifier la table
                    </p>
                    <div>
                      <label className="text-xs font-medium text-zinc-400">Numero / Nom</label>
                      <input value={editForm.numero} onChange={(e) => setEditForm({ ...editForm, numero: e.target.value })}
                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-zinc-400">Places</label>
                        <input type="number" min="1" value={editForm.places} onChange={(e) => setEditForm({ ...editForm, places: +e.target.value })}
                          className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-400">Zone</label>
                        <select value={editForm.zone} onChange={(e) => setEditForm({ ...editForm, zone: e.target.value })}
                          className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all">
                          {["Salle principale", "Terrasse", "VIP", "Bar", "Prive"].map((z) => <option key={z} value={z}>{z}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button onClick={() => {
                        const diff = {};
                        if (editForm.numero !== selectedTable.numero) diff.numero = editForm.numero;
                        if (editForm.places !== selectedTable.places) diff.places = editForm.places;
                        if (editForm.zone !== selectedTable.zone) diff.zone = editForm.zone;
                        if (editForm.qr_actif !== (selectedTable.qr_actif ? 1 : 0)) diff.qr_actif = !!editForm.qr_actif;
                        if (Object.keys(diff).length > 0) updateTable(selectedTable.id, diff);
                        fetchTables();
                        setEditForm(null);
                      }}
                        className="flex items-center justify-center gap-2 h-11 rounded-xl bg-brand-500 text-black text-sm font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
                        <CheckCircle size={16} /> Sauvegarder
                      </button>
                      <button onClick={() => setEditForm(null)}
                        className="h-11 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-bold hover:bg-zinc-700 hover:text-white transition-colors">
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-white/5 bg-zinc-900/30 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-zinc-100">Informations</p>
                      <button onClick={() => setEditForm({ numero: selectedTable.numero, places: selectedTable.places, zone: selectedTable.zone, qr_actif: selectedTable.qr_actif ? 1 : 0 })}
                        className="text-xs font-bold text-brand-500 hover:text-brand-400 transition-colors">
                        Modifier la table
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-zinc-800/50 rounded-xl p-3 border border-white/5">
                        <span className="text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Zone</span>
                        <span className="font-bold text-zinc-100 text-sm">{selectedTable.zone}</span>
                      </div>
                      <div className="bg-zinc-800/50 rounded-xl p-3 border border-white/5">
                        <span className="text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Places</span>
                        <span className="font-bold text-zinc-100 text-sm">{selectedTable.places}</span>
                      </div>
                      <div className="bg-zinc-800/50 col-span-2 rounded-xl p-3 border border-white/5 flex items-center justify-center gap-2">
                        <QrCode size={16} className="text-brand-500" />
                        <span className="font-bold text-zinc-300 text-sm">QR Code {selectedTable.qr_actif ? "Actif" : "Inactif"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete */}
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => { if (confirm(`Supprimer la table ${selectedTable.numero} ?`)) { deleteTable(selectedTable.id); setSelectedTableId(null); }}}
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-red-500/10 text-red-500 text-sm font-bold border border-red-500/20 hover:bg-red-500/20 transition-colors">
                  <Trash2 size={16} /> Supprimer cette table
                </motion.button>

                {/* Current order */}
                {(() => {
                  const cmd = getTableCommande(selectedTable.numero);
                  if (!cmd) return null;
                  return (
                    <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold text-brand-500">Commande en cours #{cmd.id}</p>
                        <Badge variant={cmd.statut}>{cmd.statut}</Badge>
                      </div>
                      <div className="space-y-2 bg-zinc-950/50 rounded-lg p-3">
                        {cmd.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs font-medium text-zinc-300">
                            <span><span className="text-brand-500 font-bold mr-1">{item.qte}x</span> {item.nom}</span>
                            <span className="text-zinc-400">{(item.qte * (item.prix || 2000)).toLocaleString()} F</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-lg font-black text-zinc-50 mt-4 flex items-center justify-between">
                        <span>Total:</span>
                        <span>{cmd.total.toLocaleString()} F</span>
                      </p>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Table Modal */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[480px] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-900/50">
                <h3 className="text-xl font-bold text-zinc-50">Ajouter une Table</h3>
                <button onClick={() => setShowAdd(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Numero / Nom</label>
                  <input value={newTable.numero} onChange={(e) => setNewTable({ ...newTable, numero: e.target.value })}
                    className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" placeholder="Ex: T12, VIP-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Places</label>
                  <input type="number" min="1" value={newTable.places} onChange={(e) => setNewTable({ ...newTable, places: +e.target.value })}
                    className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Zone</label>
                  <select value={newTable.zone} onChange={(e) => setNewTable({ ...newTable, zone: e.target.value })}
                    className="h-12 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all">
                    {["Salle principale", "Terrasse", "VIP", "Bar", "Prive"].map((z) => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div className="pt-2">
                  <button onClick={handleAdd}
                    className="w-full h-12 rounded-xl bg-brand-500 text-black text-base font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
                    Créer la table
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
