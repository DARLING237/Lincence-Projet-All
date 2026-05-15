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
    const port = window.location.port || '5174';
    return `http://${window.location.hostname}:${port}/qr/${tableNum}`;
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
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-lounge-400">Chargement des tables...</p>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <QrCode size={48} className="text-lounge-500 mb-4" />
        <h2 className="text-lg font-semibold text-lounge-200">Aucune table configurée</h2>
        <p className="text-sm text-lounge-400 mt-2">Les tables apparaîtront ici une fois que la base de données sera renseignée.</p>
        <p className="text-xs text-lounge-400 mt-4 bg-[#231F1B] px-4 py-2 rounded-lg">
          Exécutez le fichier <code className="bg-[#2E2822] px-1 rounded">database.sql</code> dans MySQL pour créer les tables.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-lounge-100">QR Codes</h1>
          <p className="text-sm text-lounge-400">Génération et gestion des QR codes par table</p>
        </div>
        <div className="flex gap-2">
          {active > 0 && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={printAll}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 text-sm font-medium shadow-lg shadow-[#D4A853]/20">
              <Printer size={16} />
              Imprimer
            </motion.button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { label: "QR actifs", value: active, dot: "bg-[#D4A853]" },
          { label: "QR inactifs", value: inactive, dot: "bg-red-500" },
          { label: "Total tables", value: tables.length, dot: "bg-[#D4A853]" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={`h-3 w-3 rounded-full ${s.dot}`} />
              <span className="text-xs font-medium text-lounge-400">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-lounge-100">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Zone filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setZoneFilter(null)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${!zoneFilter ? "bg-[#D4A853] text-lounge-950" : "bg-[#231F1B] border border-[#D4A853]/10 text-lounge-300"}`}>
          Toutes zones
        </button>
        {zones.map((z) => (
          <button key={z} onClick={() => setZoneFilter(z)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${zoneFilter === z ? "bg-[#D4A853] text-lounge-950" : "bg-[#231F1B] border border-[#D4A853]/10 text-lounge-300"}`}>
            {z}
          </button>
        ))}
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-6 flex items-center gap-2">
        <ScanQrCode size={16} className="text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700">
          Cliquez sur un QR code pour l'agrandir et le télécharger. URL : <code className="bg-amber-100 px-1 rounded text-xs">{getQrUrl("T1")}</code>
        </p>
      </div>

      {/* QR Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {(zoneFilter ? tables.filter((t) => t.zone === zoneFilter) : tables).map((table, i) => (
          <motion.div
            key={table.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => table.qr_actif && setSelectedTable(table)}
            className={`bg-[#1A1714] rounded-2xl border-2 ${table.qr_actif ? "border-[#D4A853]/20 cursor-pointer hover:shadow-lg transition-shadow" : "border-[#D4A853]/10 opacity-60"} p-5 shadow-sm`}
          >
            {/* Real QR Code */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl bg-white p-2 border border-[#D4A853]/8">
                <QRCodeSVG
                  id={`qr-${table.numero}`}
                  value={getQrUrl(table.numero)}
                  size={96}
                  level="M"
                  includeMargin={false}
                />
                {table.qr_actif && (
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4A853]">
                    <Check size={10} className="text-white" />
                  </span>
                )}
              </div>
            </div>

            {/* Table Info */}
            <div className="text-center mb-3">
              <p className="text-sm font-bold text-lounge-100">{table.numero}</p>
              <div className="flex items-center justify-center gap-1 text-xs text-lounge-400 mt-0.5">
                <MapPin size={10} />
                {table.zone} · {table.places} places
              </div>
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between gap-2 mb-3 bg-[#231F1B] rounded-lg p-2">
              <button onClick={(e) => { e.stopPropagation(); updateTable(table.id, { qr_actif: !table.qr_actif }); }}
                className="flex items-center gap-1 cursor-pointer">
                {table.qr_actif ? (
                  <ToggleRight size={24} className="text-[#D4A853]" />
                ) : (
                  <ToggleLeft size={24} className="text-lounge-500" />
                )}
              </button>
              <span className={`text-xs font-medium ${table.qr_actif ? "text-[#D4A853]" : "text-lounge-400"}`}>
                {table.qr_actif ? "Actif" : "Inactif"}
              </span>
            </div>

            {/* URL + Copy */}
            <div className="flex items-center gap-1">
              <input readOnly value={getQrUrl(table.numero)}
                onClick={(e) => { e.stopPropagation(); e.target.select(); }}
                className="flex-1 text-[10px] bg-[#231F1B] rounded-lg px-2 py-1.5 text-lounge-400 truncate focus:outline-none" />
              <button onClick={(e) => {
                e.stopPropagation();
                downloadQr(table.numero);
              }}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${table.qr_actif ? "bg-[#2E2822] text-lounge-400 hover:bg-[#3A342D]" : "bg-[#231F1B] text-lounge-500"}`}>
                <Download size={12} />
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
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setSelectedTable(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[420px] bg-[#1A1714] rounded-2xl shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-[#D4A853]/8 px-6 py-4">
                <div>
                  <h3 className="text-lg font-bold text-lounge-100">QR Code — Table {selectedTable.numero}</h3>
                  <p className="text-xs text-lounge-400">{selectedTable.zone} · {selectedTable.places} places</p>
                </div>
                <button onClick={() => setSelectedTable(null)} className="text-lounge-400 hover:text-lounge-200"><X size={20} /></button>
              </div>

              <div className="p-6">
                {/* Big QR */}
                <div className="flex justify-center mb-4">
                  <div className="bg-[#1A1714] p-4 rounded-xl border border-[#D4A853]/10">
                    <QRCodeSVG
                      value={getQrUrl(selectedTable.numero)}
                      size={256}
                      level="H"
                    />
                  </div>
                </div>

                {/* URL */}
                <div className="flex items-center gap-2 mb-4">
                  <input readOnly value={getQrUrl(selectedTable.numero)}
                    onClick={(e) => e.target.select()}
                    className="flex-1 text-xs bg-[#231F1B] rounded-lg px-3 py-2 text-lounge-400 font-mono focus:outline-none" />
                  <button onClick={() => navigator.clipboard?.writeText(getQrUrl(selectedTable.numero))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2E2822] text-lounge-400 hover:bg-[#3A342D] cursor-pointer">
                    <Copy size={16} />
                  </button>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => downloadQr(selectedTable.numero)}
                    className="flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 text-sm font-medium">
                    <Download size={14} /> Télécharger PNG
                  </button>
                  <button onClick={() => {
                    const url = getQrUrl(selectedTable.numero);
                    if (navigator.share) {
                      navigator.share({ title: `QR Table ${selectedTable.numero}`, url });
                    } else {
                      navigator.clipboard.writeText(url);
                    }
                  }}
                    className="flex items-center justify-center gap-2 h-10 rounded-xl border border-[#D4A853]/10 text-lounge-200 text-sm font-medium bg-[#231F1B]">
                    <Share2 size={14} /> Partager
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
