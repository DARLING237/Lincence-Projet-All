import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { Badge } from "../components/ui/badge";
import {
  Armchair, Plus, X, Users, Grid3X3, Utensils, Coffee, GlassWater, QrCode, Trash2,
  CheckCircle, Save,
} from "lucide-react";

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
    libre: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", label: "Libre" },
    occupee: { bg: "bg-orange-50", border: "border-red-50", text: "text-red-700", dot: "bg-red-500", label: "Occupée" },
    reservee: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500", label: "Réservée" },
  };

  const getTableCommande = (num) => commandes.find((c) => c.table === num);

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
    Privé: Armchair,
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salles & Tables</h1>
          <p className="text-sm text-gray-500">{tables.length} tables · {zones.length} zones</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/20"
        >
          <Plus size={16} />
          Ajouter table
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: "Libres", value: counts.libre, color: "emerald", dot: "bg-emerald-500" },
          { label: "Occupées", value: counts.occupee, color: "red", dot: "bg-red-500" },
          { label: "Réservées", value: counts.reservee, color: "amber", dot: "bg-amber-500" },
          { label: "Total", value: tables.length, color: "indigo", dot: "bg-indigo-500" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={`h-3 w-3 rounded-full ${s.dot}`} />
              <span className="text-xs font-medium text-gray-500">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold text-gray-900`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Grid3X3 size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Zone:</span>
          <select value={filterZone} onChange={(e) => setFilterZone(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-100">
            <option value="Tout">Toutes</option>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Statut:</span>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-100">
            <option value="Tout">Tous</option>
            <option value="libre">Libre</option>
            <option value="occupee">Occupée</option>
            <option value="reservee">Réservée</option>
          </select>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
              className={`relative rounded-2xl border-2 ${sc.border} ${sc.bg} p-5 cursor-pointer hover:shadow-lg transition-shadow group`}
            >
              {/* Status dot */}
              <span className={`absolute top-3 right-3 h-3 w-3 rounded-full ${sc.dot} animate-pulse`} />
              {/* Quick delete */}
              <button
                onClick={(e) => { e.stopPropagation(); if (confirm(`Supprimer la table ${table.numero} ?`)) deleteTable(table.id); }}
                className="absolute top-2.5 right-7 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-400 hover:bg-red-200 hover:text-red-600 transition-colors"
              >
                <Trash2 size={11} />
              </button>

              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm`}>
                    <ZoneIcon size={22} className={sc.dot.replace("bg-", "text-")} />
                  </div>
                </div>
                <p className={`text-lg font-bold ${sc.text}`}>{table.numero}</p>
                <p className="text-xs text-gray-400 mt-1">{table.zone}</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
                  <Users size={11} />
                  <span>{table.places} pl.</span>
                </div>
                {cmd && (
                  <div className="mt-3 pt-3 border-t border-gray-200/50">
                    <span className="text-xs font-medium text-gray-600">
                      {cmd.total.toLocaleString()} F · {cmd.items.length} items
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Table Detail Modal ── */}
      <AnimatePresence>
        {selectedTable && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedTableId(null)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed inset-x-4 top-24 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[480px] bg-white rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">Table {selectedTable.numero}</h3>
                <button onClick={() => setSelectedTableId(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* ── Status change ── */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Changer le statut</p>
                  <div className="flex gap-2">
                    {["libre", "occupee", "reservee"].map((s) => (
                      <button key={s} onClick={() => updateTable(selectedTable.id, { statut: s })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          selectedTable.statut === s
                            ? statusConfig[s].bg + " " + statusConfig[s].text + " border-2 border-current"
                            : "bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100"
                        }`}>
                        {statusConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Edit form ── */}
                {editForm ? (
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Save size={14} /> Modifier la table
                    </p>
                    <div>
                      <label className="text-xs text-gray-500">Numéro / Nom</label>
                      <input value={editForm.numero} onChange={(e) => setEditForm({ ...editForm, numero: e.target.value })}
                        className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Places</label>
                        <input type="number" min="1" value={editForm.places} onChange={(e) => setEditForm({ ...editForm, places: +e.target.value })}
                          className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Zone</label>
                        <select value={editForm.zone} onChange={(e) => setEditForm({ ...editForm, zone: e.target.value })}
                          className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100">
                          {["Salle principale", "Terrasse", "VIP", "Bar", "Privé"].map((z) => <option key={z} value={z}>{z}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => {
                        const diff = {};
                        if (editForm.numero !== selectedTable.numero) diff.numero = editForm.numero;
                        if (editForm.places !== selectedTable.places) diff.places = editForm.places;
                        if (editForm.zone !== selectedTable.zone) diff.zone = editForm.zone;
                        if (editForm.qr_actif !== (selectedTable.qrActif ? 1 : 0)) diff.qr_actif = !!editForm.qr_actif;
                        if (Object.keys(diff).length > 0) updateTable(selectedTable.id, diff);
                        fetchTables();
                        setEditForm(null);
                      }}
                        className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium shadow-sm">
                        <CheckCircle size={12} /> Sauvegarder
                      </button>
                      <button onClick={() => setEditForm(null)}
                        className="h-9 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200">
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">Informations</p>
                      <button onClick={() => setEditForm({ numero: selectedTable.numero, places: selectedTable.places, zone: selectedTable.zone, qr_actif: selectedTable.qrActif ? 1 : 0 })}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2 cursor-pointer">
                        Modifier
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-400 block mb-0.5">Zone</span>
                        <span className="font-semibold text-gray-900">{selectedTable.zone}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-400 block mb-0.5">Places</span>
                        <span className="font-semibold text-gray-900">{selectedTable.places}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                        <QrCode size={13} className="text-gray-400" />
                        <span className="font-medium text-gray-600">QR {selectedTable.qrActif ? "actif" : "inactif"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete table */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { if (confirm(`Supprimer la table ${selectedTable.numero} ?`)) { deleteTable(selectedTable.id); setSelectedTableId(null); }}}
                  className="flex items-center justify-center gap-2 w-full h-9 rounded-xl bg-red-50 text-red-500 text-xs font-medium border border-red-200 hover:bg-red-100">
                  <Trash2 size={12} /> Supprimer cette table
                </motion.button>

                {/* Current order */}
                {(() => {
                  const cmd = getTableCommande(selectedTable.numero);
                  if (!cmd) return null;
                  return (
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-emerald-700">Commande #{cmd.id}</p>
                        <Badge variant={cmd.statut}>{cmd.statut}</Badge>
                      </div>
                      <div className="space-y-1">
                        {cmd.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                            <span>×{item.qte} {item.nom}</span>
                            <span className="text-gray-400">{(item.qte * (item.prix || 2000)).toLocaleString()} F</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-gray-900 mt-3">Total: {cmd.total.toLocaleString()} F</p>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Add Table Modal ── */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[480px] bg-white rounded-2xl shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">Ajouter Table</h3>
                <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Numéro / Nom</label>
                  <input value={newTable.numero} onChange={(e) => setNewTable({ ...newTable, numero: e.target.value })}
                    className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100" placeholder="Ex: T13" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Places</label>
                  <input type="number" min="1" value={newTable.places} onChange={(e) => setNewTable({ ...newTable, places: +e.target.value })}
                    className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Zone</label>
                  <select value={newTable.zone} onChange={(e) => setNewTable({ ...newTable, zone: e.target.value })}
                    className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100">
                    {["Salle principale", "Terrasse", "VIP", "Bar", "Privé"].map((z) => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <button onClick={handleAdd}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/20">
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
