import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { formatMontant } from "../data/mockData";
import { Badge } from "../components/ui/badge";
import {
  ClipboardList, Plus, Clock, Check, X, Receipt, Minus, GlassWater, UtensilsCrossed,
  CreditCard, Banknote, Smartphone, Repeat, Printer, CircleCheck, ArrowLeft, Phone, FlaskConical,
} from "lucide-react";

export function StaffCommandes() {
  const commandes = useAppStore((s) => s.commandesEnCours);
  const produits = useAppStore((s) => s.produits);
  const tables = useAppStore((s) => s.tables);
  const updateStatut = useAppStore((s) => s.updateCommandeStatut);
  const removeCommande = useAppStore((s) => s.removeCommande);
  const addCommande = useAppStore((s) => s.addCommande);
  const payerCommande = useAppStore((s) => s.payerCommande);
  const verifyPayment = useAppStore((s) => s.verifyPayment);
  const user = useAppStore((s) => s.user);

  const fetchCommandesEnCours = useAppStore((s) => s.fetchCommandesEnCours);
  const fetchTables = useAppStore((s) => s.fetchTables);
  const fetchProduits = useAppStore((s) => s.fetchProduits);

  const [payModal, setPayModal] = useState(null); // { cmd, mode, ref, numClient }
  const [paySuccess, setPaySuccess] = useState(null);
  useEffect(() => {
    fetchCommandesEnCours();
    fetchTables();
    fetchProduits();
  }, [fetchCommandesEnCours, fetchTables, fetchProduits]);

  const [filterStatut, setFilterStatut] = useState("Tout");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);

  // ── New Order State ──
  const [newOrderTable, setNewOrderTable] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [prodSearch, setProdSearch] = useState("");
  const [prodCat, setProdCat] = useState("Tout");

  const filtered = commandes.filter((c) => {
    if (filterStatut !== "Tout" && c.statut !== filterStatut) return false;
    if (search && !c.table.toLowerCase().includes(search.toLowerCase()) && !String(c.id).includes(search)) return false;
    return true;
  });

  const addToCart = (produit) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === produit.id);
      if (exists) return prev.map((i) => i.id === produit.id ? { ...i, qte: i.qte + 1 } : i);
      return [...prev, { id: produit.id, nom: produit.nom, prix: produit.prix, qte: 1, type_poste: produit.type_poste }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === id);
      if (exists && exists.qte > 1) return prev.map((i) => i.id === id ? { ...i, qte: i.qte - 1 } : i);
      return prev.filter((i) => i.id !== id);
    });
  };

  const cartTotal = cartItems.reduce((s, i) => s + i.prix * i.qte, 0);

  const submitOrder = () => {
    if (!newOrderTable || cartItems.length === 0) return;
    const selectedTable = tables.find((t) => t.numero === newOrderTable);
    addCommande({
      table_id: selectedTable?.id || null,
      items: cartItems.map((item) => ({
        produit_menu_id: item.id,
        quantite: item.qte,
        prix_unitaire: item.prix,
        type_poste: item.type_poste,
      })),
      source: "staff",
    }).then((d) => {
      if (d.success) {
        setCartItems([]);
        setNewOrderTable("");
        setShowNew(false);
      }
    }).catch(() => {});
  };

  const statutFlow = {
    "en attente": { next: "en preparation", label: "Preparer", color: "from-blue-500 to-cyan-500" },
    "en preparation": { next: "servie", label: "Servie", color: "from-amber-500 to-orange-500" },
    "servie": { action: "payer", label: "Paiement", color: "from-emerald-500 to-teal-500" },
  };

  const paymentModes = [
    { id: "especes", label: "Espèces", icon: Banknote, color: "emerald" },
    { id: "orange_money", label: "Orange Money", icon: Smartphone, color: "orange" },
    { id: "mtn_momo", label: "MTN MoMo", icon: Smartphone, color: "yellow" },
    { id: "carte", label: "Carte bancaire", icon: CreditCard, color: "blue" },
    { id: "transfert", label: "Transfert", icon: Repeat, color: "purple" },
  ];

  const openPayment = (cmd) => setPayModal({ cmd, mode: null, ref: "", numClient: "", campayAsync: false });

  const confirmPayment = () => {
    if (!payModal || !payModal.mode) return;
    const isMobile = ["orange_money", "mtn_momo"].includes(payModal.mode);
    if (isMobile && !payModal.numClient) return; // bloquer si pas de numéro

    payerCommande(
      payModal.cmd.id,
      payModal.mode,
      payModal.ref || null,
      isMobile ? payModal.numClient : undefined,
      isMobile && payModal.campayAsync
    ).then((d) => {
      if (d.success) {
        // Si paiement CamPay en mode async → garder le modal ouvert pour vérifier
        if (d.campay && d.campay.status === "PENDING") {
          setPayModal((prev) => ({
            ...prev,
            campayReference: d.campay.reference,
            campayStatus: d.campay.status,
            campayUssd: d.campay.ussd_code,
            paymentPending: true,
          }));
          return;
        }

        setPaySuccess({ id: payModal.cmd.id, montant: payModal.cmd.total, mode: payModal.mode });
        setPayModal(null);
        setTimeout(() => setPaySuccess(null), 3000);
      }
    }).catch(() => {});
  };

  // Vérifier le statut d'un paiement CamPay en attente
  const verifyCampayPayment = () => {
    if (!payModal?.campayReference) return;
    verifyPayment(payModal.cmd.id).then((d) => {
      if (d.status === "SUCCESSFUL") {
        setPaySuccess({ id: payModal.cmd.id, montant: payModal.cmd.total, mode: payModal.mode });
        setPayModal(null);
        setTimeout(() => setPaySuccess(null), 3000);
      } else if (d.status === "FAILED") {
        setPayModal((prev) => ({ ...prev, campayStatus: "FAILED" }));
      }
    }).catch(() => {});
  };

  const statBadge = {
    "en attente": { bg: "bg-yellow-50", text: "text-yellow-700" },
    "en preparation": { bg: "bg-blue-50", text: "text-blue-700" },
    servie: { bg: "bg-green-50", text: "text-green-700" },
    payee: { bg: "bg-emerald-50", text: "text-emerald-700" },
    annulee: { bg: "bg-gray-50", text: "text-gray-600" },
  };

  const allProds = produits.filter((p) => {
    if (!p.dispo) return false;
    if (prodSearch && !p.nom.toLowerCase().includes(prodSearch.toLowerCase())) return false;
    if (prodCat !== "Tout" && p.categorie !== prodCat) return false;
    return true;
  });

  const categories = ["Tout", ...new Set(produits.map((p) => p.categorie))];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-sm text-gray-500">{commandes.length} commandes actives</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowNew(true)}
          className="cursor-pointer flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/20"
        >
          <Plus size={16} />
          Nouvelle commande
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {["Tout", "en attente", "en preparation", "servie", "payee"].map((s) => (
          <button key={s} onClick={() => setFilterStatut(s)}
            className={`h-9 px-3 rounded-lg text-sm font-medium transition-all ${
              filterStatut === s
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}>
            {s === "en attente" ? "En attente" : s === "en preparation" ? "En prep." : s === "servie" ? "Servie" : s === "payee" ? "Payee" : "Tout"}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <UtensilsCrossed size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune commande</p>
          </div>
        ) : filtered.map((cmd) => (
          <motion.div key={cmd.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${statBadge[cmd.statut]?.bg || "bg-gray-50"}`}>
                  <Receipt size={18} className={statBadge[cmd.statut]?.text || "text-gray-500"} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">#{cmd.id}</p>
                  <p className="text-xs text-gray-400">Table {cmd.table} · {cmd.heure}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  {cmd.temps} min
                </div>
                <Badge variant={cmd.statut}>{cmd.statut}</Badge>
                <p className="text-lg font-bold text-gray-900">{formatMontant(cmd.total)}</p>
              </div>
            </div>

            {/* Items */}
            <div className="flex flex-wrap gap-2 mb-3">
              {cmd.items.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-600">
                  <GlassWater size={11} className="text-blue-600" />
                  ×{item.qte} {item.nom}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400">Serveur: {cmd.serveur}</p>
              <div className="flex gap-2">
                {statutFlow[cmd.statut] && statutFlow[cmd.statut].next && (
                  <button onClick={() => updateStatut(cmd.id, statutFlow[cmd.statut].next)}
                    className={`flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r ${statutFlow[cmd.statut].color} text-white text-xs font-medium shadow-sm`}>
                    {statutFlow[cmd.statut].label === "Preparer" ? <FlaskConical size={12} /> : statutFlow[cmd.statut].label === "Servie" ? <Check size={12} /> : <Check size={12} />}
                    {statutFlow[cmd.statut].label}
                  </button>
                )}
                {statutFlow[cmd.statut] && statutFlow[cmd.statut].action === "payer" && (
                  <button onClick={() => openPayment(cmd)}
                    className={`flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r ${statutFlow[cmd.statut].color} text-white text-xs font-medium shadow-sm`}>
                    <CreditCard size={12} />
                    {statutFlow[cmd.statut].label}
                  </button>
                )}
                {cmd.statut !== "payee" && (
                  <button onClick={() => removeCommande(cmd.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── New Order Modal ── */}
      <AnimatePresence>
        {showNew && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 cursor-pointer" onClick={() => setShowNew(false)} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-y-0 right-0 w-full md:w-[640px] bg-white z-50 shadow-2xl flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                    <Plus size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Nouvelle Commande</h3>
                </div>
                <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              {/* Table Select */}
              <div className="px-6 py-3 border-b border-gray-100">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Table</label>
                <div className="flex flex-wrap gap-2">
                  {tables.filter((t) => t.statut !== "reservee").map((t) => (
                    <button key={t.id} onClick={() => setNewOrderTable(t.numero)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        newOrderTable === t.numero
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}>
                      {t.numero}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Search */}
              <div className="px-6 py-3 border-b border-gray-100">
                <input value={prodSearch} onChange={(e) => setProdSearch(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {categories.map((c) => (
                    <button key={c} onClick={() => setProdCat(c)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        prodCat === c ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products */}
              <div className="flex-1 overflow-y-auto px-6 py-3">
                <div className="grid grid-cols-2 gap-2">
                  {allProds.map((p) => {
                    const inCart = cartItems.find((i) => i.id === p.id);
                    return (
                      <button key={p.id} onClick={() => addToCart(p)}
                        className={`flex items-center justify-between rounded-xl p-3 text-left transition-all ${
                          inCart ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                        }`}>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{p.nom}</p>
                          <p className="text-xs text-gray-400">{formatMontant(p.prix)}</p>
                        </div>
                        {inCart ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold flex-shrink-0">{inCart.qte}</span>
                        ) : (
                          <Plus size={14} className="text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cart Summary */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <div className="space-y-2 mb-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500 w-6">×{item.qte}</span>
                          <span className="text-gray-700">{item.nom}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{formatMontant(item.prix * item.qte)}</span>
                          <button onClick={() => removeFromCart(item.id)} className="h-5 w-5 flex items-center justify-center rounded bg-red-100 text-red-600 hover:bg-red-200">
                            <Minus size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Total</span>
                    <span className="text-lg font-bold text-gray-900">{formatMontant(cartTotal)}</span>
                  </div>
                  <button onClick={submitOrder}
                    disabled={!newOrderTable}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium disabled:opacity-40 shadow-lg shadow-emerald-500/20">
                    Valider la commande
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Payment Modal ── */}
      <AnimatePresence>
        {payModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm cursor-pointer"
              onClick={() => { if (!payModal.paymentPending) setPayModal(null); }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 inset-x-4 md:inset-x-auto md:w-[440px] bg-white rounded-2xl shadow-2xl z-50 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Paiement Commande #{payModal.cmd.id}</h3>
                  <p className="text-xs text-gray-400">Table {payModal.cmd.table} · {payModal.cmd.heure}</p>
                </div>
                <button onClick={() => { if (!payModal.paymentPending) setPayModal(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              <div className="p-6">
                {/* Total */}
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500">Montant total</p>
                  <p className="text-3xl font-bold text-gray-900">{formatMontant(payModal.cmd.total)}</p>
                </div>

                {/* Payment Modes */}
                <label className="text-xs font-medium text-gray-500 mb-3 block">Mode de paiement</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {paymentModes.map((pm) => (
                    <button key={pm.id} onClick={() => setPayModal((prev) => ({ ...prev, mode: pm.id }))}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        payModal.mode === pm.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}>
                      <pm.icon size={24} className={pm.id === "orange_money" ? (payModal.mode === pm.id ? "text-orange-600" : "text-orange-400") : pm.id === "mtn_momo" ? (payModal.mode === pm.id ? "text-yellow-600" : "text-yellow-500") : (payModal.mode === pm.id ? "text-emerald-600" : "text-gray-400")} />
                      <span className={`text-xs font-semibold ${
                        payModal.mode === pm.id ? "text-emerald-700" : "text-gray-600"
                      }`}>{pm.label}</span>
                    </button>
                  ))}
                </div>

                {/* Numéro client (requis pour Orange Money / MTN MoMo) */}
                {["orange_money", "mtn_momo"].includes(payModal.mode) && (
                  <div className="mb-3">
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Numéro du client</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={payModal.numClient || ""}
                        onChange={(e) => setPayModal((prev) => ({ ...prev, numClient: e.target.value }))}
                        placeholder="2376XXXXXXXX"
                        className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {payModal.mode === "orange_money" ? "Format: 23761XXXXXX (Orange)" : "Format: 23767XXXXXX (MTN)"}
                    </p>
                  </div>
                )}

                {/* Reference optionnel si pas CamPay async */}
                {!payModal.campayAsync && (
                  <input value={payModal.ref || ""} onChange={(e) => setPayModal((prev) => ({ ...prev, ref: e.target.value }))}
                    placeholder="Reference (optionnel)"
                    className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                )}

                {/* ── Pending Campay ── */}
                {payModal.paymentPending ? (
                  <div className="space-y-3 mb-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                      <Clock size={32} className="mx-auto text-amber-500 mb-2 animate-pulse" />
                      <p className="text-sm font-semibold text-amber-700">En attente de confirmation</p>
                      <p className="text-xs text-amber-600 mt-1">Le client doit approuver le paiement sur son téléphone</p>
                      {payModal.campayUssd && (
                        <p className="text-xs text-amber-600 mt-2">Composez : <strong className="text-amber-800">{payModal.campayUssd}</strong></p>
                      )}
                    </div>
                    <button onClick={verifyCampayPayment}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-lg flex items-center justify-center gap-2">
                      <CircleCheck size={16} />
                      Vérifier le paiement
                    </button>
                  </div>
                ) : (
                  /* ── Confirm ── */
                  <button onClick={confirmPayment}
                    disabled={
                      !payModal.mode ||
                      (["orange_money", "mtn_momo"].includes(payModal.mode) && !payModal.numClient)
                    }
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium disabled:opacity-40 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                    <CircleCheck size={16} />
                    Confirmer le paiement
                  </button>
                )}

                {/* ── Failed ── */}
                {payModal.campayStatus === "FAILED" && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center mt-3">
                    <p className="text-sm font-semibold text-red-600">Échec du paiement</p>
                    <p className="text-xs text-red-400 mt-1">Le client n'a pas confirmé ou le paiement a été refusé</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Payment Success Toast ── */}
      <AnimatePresence>
        {paySuccess && (
          <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-4 left-1/2 z-[60] bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <CircleCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">Paiement confirmé</p>
              <p className="text-xs text-emerald-100">Commande #{paySuccess.id} · {formatMontant(paySuccess.montant)} · {paySuccess.mode}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
