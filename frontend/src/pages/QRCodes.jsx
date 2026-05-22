import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode, Printer, Copy, ToggleLeft, ToggleRight, Download, MapPin, ScanQrCode, X, Check, Share2,
} from "lucide-react";

export function QRCodes() {
  const tables = useAppStore((s) => s.tables);
  const updateTable = useAppStore((s) => s.updateTable);
  const fetchTables = useAppStore((s) => s.fetchTables);
  const [zoneFilter, setZoneFilter] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTables()
      .finally(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [fetchTables]);

  const getQrUrl = (tableNum) => {
    return `${window.location.origin}/qr/${tableNum}`;
  };

  const zones = tables.length > 0 ? [...new Set(tables.map((t) => t.zone))] : [];
  const active = tables.filter((t) => t.qr_actif).length;
  const inactive = tables.filter((t) => !t.qr_actif).length;

  const downloadQr = (tableNum) => {
    const svg = document.getElementById(`qr-${tableNum}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = `qr-${tableNum}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const printAll = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
         <div className="animate-spin h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(212,168,83,0.5)]" />
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-zinc-900/50 backdrop-blur-md p-8 rounded-2xl border border-white/5 shadow-xl flex flex-col items-center">
            <div className="bg-zinc-950 p-4 rounded-full mb-4 border border-white/5 shadow-inner">
                 <QrCode size={48} className="text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-200">Aucune table configurée</h2>
            <p className="text-sm font-medium text-zinc-500 mt-2">Les tables apparaîtront ici une fois que la base de données sera renseignée.</p>
            <p className="text-xs font-bold text-zinc-400 mt-6 bg-zinc-950 px-4 py-3 rounded-xl border border-white/5">
            Exécutez le fichier <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 mx-1">database.sql</code> dans MySQL pour créer les tables.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <div className="bg-brand-500/10 p-2 rounded-xl">
               <QrCode className="text-brand-500" size={24} />
             </div>
            <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">QR Codes</h1>
          </div>
          <p className="text-sm font-medium text-zinc-400 mt-1 ml-[52px]">Génération et gestion des QR codes par table</p>
        </div>
        <div className="flex gap-2">
          {active > 0 && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={printAll}
              className="flex items-center gap-2 h-11 px-5 rounded-xl bg-brand-500 text-black text-sm font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
              <Printer size={18} />
              Imprimer
            </motion.button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-3 mb-8">
        {[
          { label: "QR actifs", value: active, dot: "bg-brand-500 shadow-[0_0_8px_#D4A853]" },
          { label: "QR inactifs", value: inactive, dot: "bg-red-500 shadow-[0_0_8px_#EF4444]" },
          { label: "Total tables", value: tables.length, dot: "bg-zinc-500 shadow-[0_0_8px_#71717A]" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <span className={`h-3 w-3 rounded-full ${s.dot}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{s.label}</span>
            </div>
            <p className="text-3xl font-black text-zinc-50">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Zone filter */}
      <div className="flex gap-2 mb-8 flex-wrap bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-xl p-1.5 shadow-sm w-fit">
        <button onClick={() => setZoneFilter(null)}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!zoneFilter ? "bg-brand-500 text-black shadow-md shadow-brand-500/20" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"}`}>
          Toutes zones
        </button>
        {zones.map((z) => (
          <button key={z} onClick={() => setZoneFilter(z)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${zoneFilter === z ? "bg-brand-500 text-black shadow-md shadow-brand-500/20" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"}`}>
            {z}
          </button>
        ))}
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 mb-8 flex items-center gap-3 backdrop-blur-md shadow-lg">
        <ScanQrCode size={20} className="text-amber-500 shrink-0" />
        <p className="text-sm font-medium text-amber-200">
          Cliquez sur un QR code pour l'agrandir et le télécharger. URL : <code className="bg-amber-950/50 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-bold font-mono ml-1 shadow-inner">{getQrUrl("T1")}</code>
        </p>
      </div>

      {/* QR Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {(zoneFilter ? tables.filter((t) => t.zone === zoneFilter) : tables).map((table, i) => (
          <motion.div
            key={table.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => table.qr_actif && setSelectedTable(table)}
            className={`bg-zinc-900/50 backdrop-blur-md rounded-2xl border ${table.qr_actif ? "border-white/5 cursor-pointer hover:border-brand-500/50 hover:shadow-[0_0_15px_rgba(212,168,83,0.15)] transition-all" : "border-white/5 opacity-50 grayscale"} p-5 shadow-lg relative overflow-hidden group`}
          >
            {/* Real QR Code */}
            <div className="flex items-center justify-center mb-5">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-2xl bg-white p-2.5 shadow-inner">
                <QRCodeSVG
                  id={`qr-${table.numero}`}
                  value={getQrUrl(table.numero)}
                  size={112}
                  level="M"
                  includeMargin={false}
                />
                {table.qr_actif && (
                  <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 shadow-md shadow-brand-500/30 border-2 border-white">
                    <Check size={14} className="text-black font-bold" />
                  </span>
                )}
              </div>
            </div>

            {/* Table Info */}
            <div className="text-center mb-4">
              <p className="text-lg font-black text-zinc-50">{table.numero}</p>
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-400 mt-1 bg-zinc-950/50 w-fit mx-auto px-2 py-1 rounded-md border border-white/5">
                <MapPin size={12} className="text-brand-500" />
                {table.zone} <span className="mx-0.5">•</span> {table.places} pl
              </div>
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between gap-2 mb-4 bg-zinc-950/50 rounded-xl p-2.5 border border-white/5">
              <button onClick={(e) => { e.stopPropagation(); updateTable(table.id, { qr_actif: !table.qr_actif }); }}
                className="flex items-center gap-1 cursor-pointer">
                {table.qr_actif ? (
                  <ToggleRight size={28} className="text-brand-500 drop-shadow-[0_0_5px_rgba(212,168,83,0.5)]" />
                ) : (
                  <ToggleLeft size={28} className="text-zinc-600" />
                )}
              </button>
              <span className={`text-xs font-bold ${table.qr_actif ? "text-brand-500" : "text-zinc-500"}`}>
                {table.qr_actif ? "Actif" : "Inactif"}
              </span>
            </div>

            {/* URL + Copy */}
            <div className="flex items-center gap-2">
              <input readOnly value={getQrUrl(table.numero)}
                onClick={(e) => { e.stopPropagation(); e.target.select(); }}
                className="flex-1 text-[10px] bg-zinc-950 rounded-lg px-2.5 py-2 text-zinc-400 font-mono font-bold truncate focus:outline-none border border-white/5 shadow-inner" />
              <button onClick={(e) => {
                e.stopPropagation();
                downloadQr(table.numero);
              }}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors border border-white/5 shadow-inner ${table.qr_actif ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white" : "bg-zinc-950 text-zinc-600"}`}>
                <Download size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* QR Detail Modal */}
      <AnimatePresence>
        {selectedTable && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" onClick={() => setSelectedTable(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[440px] bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-zinc-950/50">
                <div>
                  <h3 className="text-xl font-bold text-zinc-50">QR Code — {selectedTable.numero}</h3>
                  <p className="text-sm font-medium text-zinc-400 mt-1">{selectedTable.zone} <span className="mx-1">•</span> {selectedTable.places} places</p>
                </div>
                <button onClick={() => setSelectedTable(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-800/50 p-2 rounded-lg hover:bg-zinc-800"><X size={20} /></button>
              </div>

              <div className="p-8">
                {/* Big QR */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-6 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <QRCodeSVG
                      value={getQrUrl(selectedTable.numero)}
                      size={256}
                      level="H"
                    />
                  </div>
                </div>

                {/* URL */}
                <div className="flex items-center gap-3 mb-6">
                  <input readOnly value={getQrUrl(selectedTable.numero)}
                    onClick={(e) => e.target.select()}
                    className="flex-1 text-sm bg-zinc-950 rounded-xl px-4 py-3 text-zinc-300 font-mono font-bold focus:outline-none border border-white/10 shadow-inner" />
                  <button onClick={() => navigator.clipboard?.writeText(getQrUrl(selectedTable.numero))}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 border border-white/10 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer shadow-sm">
                    <Copy size={18} />
                  </button>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => downloadQr(selectedTable.numero)}
                    className="flex items-center justify-center gap-2 h-12 rounded-xl bg-brand-500 text-black text-sm font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
                    <Download size={16} /> Télécharger
                  </button>
                  <button onClick={() => {
                    const url = getQrUrl(selectedTable.numero);
                    if (navigator.share) {
                      navigator.share({ title: `QR Table ${selectedTable.numero}`, url });
                    } else {
                      navigator.clipboard.writeText(url);
                    }
                  }}
                    className="flex items-center justify-center gap-2 h-12 rounded-xl border border-white/10 text-zinc-200 text-sm font-bold bg-zinc-900/80 hover:bg-zinc-800 transition-colors shadow-sm">
                    <Share2 size={16} /> Partager
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
