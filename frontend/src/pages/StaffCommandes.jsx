import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { formatMontant } from "../data/mockData";
import { Badge } from "../components/ui/badge";
import {
  ClipboardList, Plus, Clock, Check, X, Receipt, Minus, GlassWater, UtensilsCrossed,
  CreditCard, Smartphone, Repeat, Printer, CircleCheck, Phone, FlaskConical,
  ArrowRightLeft, Calendar, Edit, Play, Bell, BellOff,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const GOLD_FG = "#D4A853";
const BG_CARD = "#1A1714";

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
  const transfererCommande = useAppStore((s) => s.transfererCommande);
  const modifierItemCommande = useAppStore((s) => s.modifierItemCommande);
  const ajouterItemCommande = useAppStore((s) => s.ajouterItemCommande);
  const differerCommande = useAppStore((s) => s.differerCommande);
  const activerCommande = useAppStore((s) => s.activerCommande);

  const fetchCommandesEnCours = useAppStore((s) => s.fetchCommandesEnCours);
  const fetchTables = useAppStore((s) => s.fetchTables);
  const fetchProduits = useAppStore((s) => s.fetchProduits);

  const [payModal, setPayModal] = useState(null);
  const [paySuccess, setPaySuccess] = useState(null);

  // Nouveaux états pour les fonctionnalités avancées
  const [transferModal, setTransferModal] = useState(null);
  const [editItemModal, setEditItemModal] = useState(null);
  const [differerModal, setDiffererModal] = useState(null);
  const [addItemModal, setAddItemModal] = useState(null);
  const [editQuantite, setEditQuantite] = useState(1);
  const [newQRCommande, setNewQRCommande] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastQRId = useRef(0);

  // Polling pour les nouvelles commandes QR client
  useEffect(() => {
    const checkNewQRCommandes = async () => {
      try {
        const res = await fetch(`${API_URL}/commandes?statut=en%20attente&source=qr_client`);
        const data = await res.json();
        if (data.success && data.commandes && data.commandes.length > 0) {
          const newest = data.commandes[0];
          if (lastQRId.current > 0 && newest.id > lastQRId.current) {
            setNewQRCommande(newest);
          }
          lastQRId.current = newest.id;
        }
      } catch (e) { /* ignore */ }
    };
    checkNewQRCommandes();
    const interval = setInterval(checkNewQRCommandes, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchCommandesEnCours();
    fetchTables();
    fetchProduits();
    const interval = setInterval(fetchCommandesEnCours, 5000);
    return () => clearInterval(interval);
  }, [fetchCommandesEnCours, fetchTables, fetchProduits]);

  const [filterStatut, setFilterStatut] = useState("Tout");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);

  const [newOrderTable, setNewOrderTable] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [prodSearch, setProdSearch] = useState("");
  const [prodCat, setProdCat] = useState("Tout");

  const filtered = commandes.filter((c) => {
    if (filterStatut !== "Tout" && c.statut !== filterStatut) return false;
    if (search && !c.table_nom?.toLowerCase().includes(search.toLowerCase()) && !String(c.id).includes(search)) return false;
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
        produit_menu_id: item.id, quantite: item.qte, prix_unitaire: item.prix, type_poste: item.type_poste,
      })),
      source: "staff",
    }).then((d) => {
      if (d?.success) {
        setCartItems([]); setNewOrderTable(""); setShowNew(false);
      } else {
        alert("Erreur: " + (d?.message || "Impossible de creer la commande"));
      }
    }).catch(() => { alert("Erreur de connexion. Verifiez le serveur."); });
  };

  const statutFlow = {
    "en attente": { next: "en preparation", label: "Preparer", color: "from-[#D4A853] to-[#C49742]" },
    "en preparation": { next: "servie", label: "Servie", color: "from-[#D4A853] to-[#C49742]" },
    "servie": { action: "payer", label: "Paiement", color: "from-[#D4A853] to-[#C49742]" },
  };

  const paymentModes = [
    { id: "especes", label: "Especes", icon: Receipt },
    { id: "orange_money", label: "Orange Money", icon: Smartphone, accent: "text-orange-400" },
    { id: "mtn_momo", label: "MTN MoMo", icon: Smartphone, accent: "text-yellow-400" },
    { id: "carte", label: "Carte bancaire", icon: CreditCard },
    { id: "transfert", label: "Transfert", icon: Repeat },
  ];

  const openPayment = (cmd) => setPayModal({ cmd, mode: null, ref: "", numClient: "", campayAsync: false });

  const confirmPayment = () => {
    if (!payModal || !payModal.mode) return;
    const isMobile = ["orange_money", "mtn_momo"].includes(payModal.mode);
    if (isMobile && !payModal.numClient) return;
    payerCommande(payModal.cmd.id, payModal.mode, payModal.ref || null, isMobile ? payModal.numClient : undefined, isMobile && payModal.campayAsync).then((d) => {
      if (d.success) {
        if (d.campay && d.campay.status === "PENDING") {
          setPayModal((prev) => ({
            ...prev, campayReference: d.campay.reference, campayStatus: d.campay.status,
            campayUssd: d.campay.ussd_code, paymentPending: true,
          }));
          return;
        }
        setPaySuccess({ id: payModal.cmd.id, montant: payModal.cmd.total, mode: payModal.mode });
        setPayModal(null);
        setTimeout(() => setPaySuccess(null), 3000);
      }
    }).catch(() => {});
  };

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

  const allProds = produits.filter((p) => {
    const cat = p.categorie_nom || p.categorie;
    if (!p.dispo) return false;
    if (prodSearch && !p.nom.toLowerCase().includes(prodSearch.toLowerCase())) return false;
    if (prodCat !== "Tout" && cat !== prodCat) return false;
    return true;
  });

  const categories = ["Tout", ...new Set(produits.map((p) => p.categorie_nom || p.categorie))];

  // --- Handlers pour les nouvelles fonctionnalités ---

  const openTransferModal = (cmd) => {
    setTransferModal({ cmd, nouvelleTableId: null });
  };

  const [transferSuccess, setTransferSuccess] = useState(null);

  const handleTransfer = () => {
    if (!transferModal?.nouvelleTableId || !transferModal?.cmd) return;
    transfererCommande(transferModal.cmd.id, transferModal.nouvelleTableId).then((d) => {
      if (d.success) {
        setTransferModal(null);
        setTransferSuccess({ id: transferModal.cmd.id, table: d.message || `Transféré à la nouvelle table` });
        setTimeout(() => setTransferSuccess(null), 3000);
      } else {
        alert("Erreur: " + (d?.message || "Transfert échoué"));
      }
    }).catch(() => alert("Erreur de connexion"));
  };

  const openEditItemModal = (item) => {
    setEditItemModal(item);
    setEditQuantite(item.qte);
  };

  const handleUpdateItem = () => {
    if (!editItemModal || editQuantite < 0) return;
    modifierItemCommande(editItemModal.commande__id, editItemModal.id, editQuantite).then((d) => {
      if (d.success) {
        setEditItemModal(null);
        fetchCommandesEnCours();
      } else {
        alert("Erreur: " + (d?.message || "Mise à jour échouée"));
      }
    });
  };

  const handleAddItemToCommand = () => {
    if (!addItemModal || !addItemModal.selectedProd || !newOrderTable) return;
    const selectedTable = tables.find((t) => t.numero === newOrderTable);
    const prod = addItemModal.selectedProd;
    ajouterItemCommande(addItemModal.commandeId, {
      produit_menu_id: prod.id,
      quantite: 1,
      prix_unitaire: prod.prix,
      type_poste: prod.type_poste,
    }).then((d) => {
      if (d.success) {
        setAddItemModal(null);
      } else {
        alert("Erreur: " + (d?.message || "Ajout échoué"));
      }
    });
  };

  const openDiffererModal = (cmd) => {
    setDiffererModal({ cmd, date: "", heure: "" });
  };

  const handleDifferer = () => {
    if (!differerModal?.date || !differerModal?.heure) return;
    differerCommande(differerModal.cmd.id, differerModal.date, differerModal.heure).then((d) => {
      if (d.success) {
        setDiffererModal(null);
      } else {
        alert("Erreur: " + (d?.message || "Différer échoué"));
      }
    });
  };

  const handleActiver = (cmdId) => {
    activerCommande(cmdId).then((d) => {
      if (!d.success) {
        alert("Erreur: " + (d?.message || "Activation échouée"));
      }
    });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-lounge-100">Commandes</h1>
          <p className="text-sm text-lounge-400">{commandes.length} commandes actives</p>
        </div>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowNew(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 text-sm font-bold shadow-lg shadow-[#D4A853]/20">
          <Plus size={16} />
          Nouvelle commande
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["Tout", "en attente", "en preparation", "servie", "payee"].map((s) => (
          <button key={s} onClick={() => setFilterStatut(s)}
            className={`h-9 px-3 rounded-lg text-sm font-medium transition-all ${
              filterStatut === s
                ? "bg-[#D4A853] text-lounge-950 font-bold"
                : "bg-[#1A1714] border border-[#D4A853]/15 text-lounge-300 hover:border-[#D4A853]/30"
            }`}>
            {s === "en attente" ? "En attente" : s === "en preparation" ? "En prep." : s === "servie" ? "Servie" : s === "payee" ? "Payee" : "Tout"}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 p-12 text-center shadow-sm">
            <UtensilsCrossed size={40} className="mx-auto text-lounge-600 mb-3" />
            <p className="text-lounge-400">Aucune commande</p>
          </div>
        ) : filtered.map((cmd) => (
          <motion.div key={cmd.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1714] rounded-2xl border border-[#D4A853]/10 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A853]/10 text-[#D4A853]">
                  <Receipt size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-lounge-100">#{cmd.id}</p>
                  <p className="text-xs text-lounge-400">Table {cmd.table_nom || cmd.table} · {cmd.heure}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-lounge-400">
                  <Clock size={12} />
                  {cmd.temps} min
                </div>
                <Badge variant={cmd.statut}>{cmd.statut}</Badge>
                <p className="text-lg font-bold text-lounge-100">{formatMontant(cmd.total)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {cmd.items.map((item, i) => (
                <button key={i} onClick={() => openEditItemModal({ ...item, commande_id: cmd.id })}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A853]/5 px-3 py-1 text-xs text-lounge-300 hover:bg-[#D4A853]/15 transition-colors">
                  <GlassWater size={11} className="text-[#D4A853]" />
                  x{item.qte} {item.nom}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-[#D4A853]/8 pt-3">
              <p className="text-xs text-lounge-400">Serveur: {cmd.serveur}</p>
              <div className="flex gap-2">
                {/* Boutons avancés - Transfert et Différer */}
                {cmd.statut !== "payee" && cmd.statut !== "annulee" && (
                  <>
                    <button onClick={() => openTransferModal(cmd)}
                      className="flex items-center gap-1 h-8 px-2.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-xs"
                      title="Transférer vers une autre table">
                      <ArrowRightLeft size={12} />
                    </button>
                    <button onClick={() => openDiffererModal(cmd)}
                      className="flex items-center gap-1 h-8 px-2.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-xs"
                      title="Différer la commande">
                      <Calendar size={12} />
                    </button>
                  </>
                )}
                {/* Bouton Activer si commande différée */}
                {cmd.est_differee === 1 && (
                  <button onClick={() => handleActiver(cmd.id)}
                    className="flex items-center gap-1 h-8 px-2.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors text-xs"
                    title="Activer la commande">
                    <Play size={12} />
                  </button>
                )}
                {statutFlow[cmd.statut] && statutFlow[cmd.statut].next && (
                  <button onClick={() => updateStatut(cmd.id, statutFlow[cmd.statut].next)}
                    className={`flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r ${statutFlow[cmd.statut].color} text-lounge-950 text-xs font-bold shadow-sm`}>
                    {statutFlow[cmd.statut].label === "Preparer" ? <FlaskConical size={12} /> : <Check size={12} />}
                    {statutFlow[cmd.statut].label}
                  </button>
                )}
                {statutFlow[cmd.statut] && statutFlow[cmd.statut].action === "payer" && (
                  <button onClick={() => openPayment(cmd)}
                    className={`flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r ${statutFlow[cmd.statut].color} text-lounge-950 text-xs font-bold shadow-sm`}>
                    <CreditCard size={12} />
                    {statutFlow[cmd.statut].label}
                  </button>
                )}
                {cmd.statut !== "payee" && (
                  <button onClick={() => removeCommande(cmd.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Order Modal */}
      <AnimatePresence>
        {showNew && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-pointer" onClick={() => setShowNew(false)} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-y-0 right-0 w-full md:w-[640px] bg-lounge-900 border-l border-[#D4A853]/15 z-50 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between border-b border-[#D4A853]/8 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A853] to-[#C49742] text-lounge-950">
                    <Plus size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-lounge-100">Nouvelle Commande</h3>
                </div>
                <button onClick={() => setShowNew(false)} className="text-lounge-400 hover:text-lounge-200"><X size={20} /></button>
              </div>

              {/* Table Select */}
              <div className="px-6 py-3 border-b border-[#D4A853]/8">
                <label className="text-xs font-medium text-lounge-400 mb-2 block">Table</label>
                <div className="flex flex-wrap gap-2">
                  {tables.filter((t) => t.statut !== "reservee").map((t) => (
                    <button key={t.id} onClick={() => setNewOrderTable(t.numero)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        newOrderTable === t.numero
                          ? "bg-[#D4A853] text-lounge-950"
                          : "bg-[#231F1B] text-lounge-300 hover:bg-[#2E2822]"
                      }`}>
                      {t.numero}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Search */}
              <div className="px-6 py-3 border-b border-[#D4A853]/8">
                <input value={prodSearch} onChange={(e) => setProdSearch(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="h-9 w-full rounded-lg border border-[#D4A853]/15 bg-[#1A1714] px-3 text-sm text-lounge-100 focus:outline-none focus:ring-1 focus:ring-[#D4A853]/30" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {categories.map((c) => (
                    <button key={c} onClick={() => setProdCat(c)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        prodCat === c ? "bg-[#D4A853] text-lounge-950" : "bg-[#231F1B] text-lounge-400 hover:bg-[#2E2822]"
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
                          inCart ? "bg-[#D4A853]/10 border border-[#D4A853]/20" : "bg-[#231F1B] hover:bg-[#2E2822] border border-transparent"
                        }`}>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-lounge-100 truncate">{p.nom}</p>
                          <p className="text-xs text-lounge-400">{formatMontant(p.prix)}</p>
                        </div>
                        {inCart ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4A853] text-lounge-950 text-xs font-bold flex-shrink-0">{inCart.qte}</span>
                        ) : (
                          <Plus size={14} className="text-lounge-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cart Summary */}
              {cartItems.length > 0 && (
                <div className="border-t border-[#D4A853]/8 px-6 py-4 bg-[#1A1714]">
                  <div className="space-y-2 mb-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-lounge-500 w-6">x{item.qte}</span>
                          <span className="text-lounge-200">{item.nom}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-lounge-100">{formatMontant(item.prix * item.qte)}</span>
                          <button onClick={() => removeFromCart(item.id)} className="h-5 w-5 flex items-center justify-center rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">
                            <Minus size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-lounge-200">Total</span>
                    <span className="text-lg font-bold text-lounge-100">{formatMontant(cartTotal)}</span>
                  </div>
                  <button onClick={submitOrder}
                    disabled={!newOrderTable}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 text-sm font-bold disabled:opacity-40 shadow-lg shadow-[#D4A853]/20">
                    Valider la commande
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {payModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
              onClick={() => { if (!payModal.paymentPending) setPayModal(null); }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 inset-x-4 md:w-[440px] bg-lounge-900 border border-[#D4A853]/15 rounded-2xl shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-[#D4A853]/8 px-6 py-4">
                <div>
                  <h3 className="text-lg font-bold text-lounge-100">Paiement Commande #{payModal.cmd.id}</h3>
                  <p className="text-xs text-lounge-400">Table {payModal.cmd.table_nom || payModal.cmd.table} · {payModal.cmd.heure}</p>
                </div>
                <button onClick={() => { if (!payModal.paymentPending) setPayModal(null); }} className="text-lounge-400 hover:text-lounge-200"><X size={20} /></button>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-lounge-400">Montant total</p>
                  <p className="text-3xl font-bold text-lounge-100">{formatMontant(payModal.cmd.total)}</p>
                </div>

                <label className="text-xs font-medium text-lounge-400 mb-3 block">Mode de paiement</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {paymentModes.map((pm) => (
                    <button key={pm.id} onClick={() => setPayModal((prev) => ({ ...prev, mode: pm.id }))}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        payModal.mode === pm.id
                          ? "border-[#D4A853] bg-[#D4A853]/10"
                          : "border-lounge-600/30 hover:border-lounge-600/50 bg-[#1A1714]"
                      }`}>
                      <pm.icon size={24} className={payModal.mode === pm.id && pm.accent ? pm.accent : payModal.mode === pm.id ? "text-[#D4A853]" : "text-lounge-500"} />
                      <span className={`text-xs font-semibold ${payModal.mode === pm.id ? "text-[#D4A853]" : "text-lounge-300"}`}>{pm.label}</span>
                    </button>
                  ))}
                </div>

                {["orange_money", "mtn_momo"].includes(payModal.mode) && (
                  <div className="mb-3">
                    <label className="text-xs font-medium text-lounge-400 mb-1.5 block">Numero du client</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-lounge-500" />
                      <input
                        value={payModal.numClient || ""}
                        onChange={(e) => setPayModal((prev) => ({ ...prev, numClient: e.target.value }))}
                        placeholder="2376XXXXXXXX"
                        className="w-full h-10 rounded-lg border border-[#D4A853]/15 bg-[#1A1714] pl-9 pr-3 text-sm text-lounge-100 focus:outline-none focus:ring-1 focus:ring-[#D4A853]/30"
                      />
                    </div>
                    <p className="text-xs text-lounge-400 mt-1">
                      {payModal.mode === "orange_money" ? "Format: 23761XXXXXX (Orange)" : "Format: 23767XXXXXX (MTN)"}
                    </p>
                  </div>
                )}

                {!payModal.campayAsync && (
                  <input value={payModal.ref || ""} onChange={(e) => setPayModal((prev) => ({ ...prev, ref: e.target.value }))}
                    placeholder="Reference (optionnel)"
                    className="w-full h-10 rounded-lg border border-[#D4A853]/15 bg-[#1A1714] px-3 text-sm text-lounge-100 mb-4 focus:outline-none focus:ring-1 focus:ring-[#D4A853]/30" />
                )}

                {payModal.paymentPending ? (
                  <div className="space-y-3 mb-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                      <Clock size={32} className="mx-auto text-amber-400 mb-2 animate-pulse" />
                      <p className="text-sm font-semibold text-amber-400">En attente de confirmation</p>
                      <p className="text-xs text-lounge-300 mt-1">Le client doit approuver le paiement sur son telephone</p>
                      {payModal.campayUssd && (
                        <p className="text-xs text-lounge-300 mt-2">Composez : <strong className="text-lounge-100">{payModal.campayUssd}</strong></p>
                      )}
                    </div>
                    <button onClick={verifyCampayPayment}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 text-sm font-bold shadow-lg flex items-center justify-center gap-2">
                      <CircleCheck size={16} />
                      Verifier le paiement
                    </button>
                  </div>
                ) : (
                  <button onClick={confirmPayment}
                    disabled={!payModal.mode || (["orange_money", "mtn_momo"].includes(payModal.mode) && !payModal.numClient)}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 text-sm font-bold disabled:opacity-40 shadow-lg shadow-[#D4A853]/20 flex items-center justify-center gap-2">
                    <CircleCheck size={16} />
                    Confirmer le paiement
                  </button>
                )}

                {payModal.campayStatus === "FAILED" && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center mt-3">
                    <p className="text-sm font-semibold text-red-400">Echec du paiement</p>
                    <p className="text-xs text-lounge-300 mt-1">Le client n'a pas confirme ou le paiement a ete refuse</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Success Toast */}
      <AnimatePresence>
        {paySuccess && (
          <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-4 left-1/2 z-[60] bg-[#D4A853] text-lounge-950 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lounge-950/20">
              <CircleCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-bold">Paiement confirme</p>
              <p className="text-xs text-lounge-700">Commande #{paySuccess.id} · {formatMontant(paySuccess.montant)} · {paySuccess.mode}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Success Toast */}
      <AnimatePresence>
        {transferSuccess && (
          <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-4 left-1/2 z-[60] bg-blue-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <CircleCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-bold">Commande transferee</p>
              <p className="text-xs text-white/80">{transferSuccess.table}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MODAL TRANSFERT ==================== */}
      <AnimatePresence>
        {transferModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer" onClick={() => setTransferModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[400px] bg-lounge-900 border border-[#D4A853]/15 rounded-2xl shadow-2xl z-50 p-6">
              <h3 className="text-lg font-bold text-lounge-100 mb-1 flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-blue-400" />
                Transférer la commande #{transferModal.cmd?.id}
              </h3>
              <p className="text-sm text-lounge-400 mb-4">Table actuelle: {transferModal.cmd?.table}</p>
              <label className="text-xs font-medium text-lounge-400 mb-2 block">Nouvelle table</label>
              <div className="grid grid-cols-3 gap-2 mb-4 max-h-48 overflow-y-auto">
                {tables.filter((t) => t.id !== transferModal?.cmd?.table_id).map((t) => {
                  const statusColor = t.statut === "libre" ? "bg-green-500" : t.statut === "occupee" ? "bg-red-500" : "bg-amber-500";
                  const statusLabel = t.statut === "libre" ? "L" : t.statut === "occupee" ? "O" : "R";
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTransferModal((prev) => ({ ...prev, nouvelleTableId: t.id }))}
                      disabled={t.statut === "reservee"}
                      className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        transferModal.nouvelleTableId === t.id
                          ? "bg-blue-500 text-white"
                          : t.statut === "reservee"
                            ? "bg-[#231F1B] text-lounge-600 opacity-50 cursor-not-allowed"
                            : "bg-[#231F1B] text-lounge-300 hover:bg-[#2E2822]"
                      }`}>
                      <span className={`absolute top-1 right-1 h-2 w-2 rounded-full ${statusColor}`} title={t.statut} />
                      {t.numero}
                      <span className="block text-[10px] opacity-60">{statusLabel}</span>
                    </button>
                  );
                })}
              </div>
              {tables.filter((t) => t.statut === "libre" && t.id !== transferModal.cmd?.table_id).length === 0 &&
                tables.some((t) => t.statut === "occupee" && t.id !== transferModal.cmd?.table_id) && (
                  <p className="text-xs text-lounge-500 mb-4 italic">Seules les tables occupees sont disponibles — le echange sera possible</p>
                )}
              <div className="flex gap-3">
                <button onClick={() => setTransferModal(null)} className="flex-1 h-10 rounded-xl bg-[#231F1B] text-lounge-300 text-sm font-medium">Annuler</button>
                <button onClick={handleTransfer} disabled={!transferModal.nouvelleTableId}
                  className="flex-1 h-10 rounded-xl bg-blue-500 text-white text-sm font-bold disabled:opacity-40">Transférer</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ==================== MODAL DIFFÉRER ==================== */}
      <AnimatePresence>
        {differerModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer" onClick={() => setDiffererModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[400px] bg-lounge-900 border border-[#D4A853]/15 rounded-2xl shadow-2xl z-50 p-6">
              <h3 className="text-lg font-bold text-lounge-100 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-purple-400" />
                Différer la commande #{differerModal.cmd?.id}
              </h3>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="text-xs font-medium text-lounge-400 mb-2 block">Date prévue</label>
                  <input type="date" value={differerModal.date} onChange={(e) => setDiffererModal((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full h-10 rounded-lg border border-[#D4A853]/15 bg-[#1A1714] px-3 text-sm text-lounge-100" />
                </div>
                <div>
                  <label className="text-xs font-medium text-lounge-400 mb-2 block">Heure prévue</label>
                  <input type="time" value={differerModal.heure} onChange={(e) => setDiffererModal((prev) => ({ ...prev, heure: e.target.value }))}
                    className="w-full h-10 rounded-lg border border-[#D4A853]/15 bg-[#1A1714] px-3 text-sm text-lounge-100" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDiffererModal(null)} className="flex-1 h-10 rounded-xl bg-[#231F1B] text-lounge-300 text-sm font-medium">Annuler</button>
                <button onClick={handleDifferer} disabled={!differerModal.date || !differerModal.heure}
                  className="flex-1 h-10 rounded-xl bg-purple-500 text-white text-sm font-bold disabled:opacity-40">Différer</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ==================== MODAL MODIFIER ITEM ==================== */}
      <AnimatePresence>
        {editItemModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer" onClick={() => setEditItemModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[350px] bg-lounge-900 border border-[#D4A853]/15 rounded-2xl shadow-2xl z-50 p-6">
              <h3 className="text-lg font-bold text-lounge-100 mb-4 flex items-center gap-2">
                <Edit size={18} className="text-amber-400" />
                Modifier {editItemModal.nom}
              </h3>
              <div className="mb-4">
                <label className="text-xs font-medium text-lounge-400 mb-2 block">Quantité (0 = supprimer)</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setEditQuantite((q) => Math.max(0, q - 1))} className="h-10 w-10 rounded-lg bg-[#231F1B] text-lounge-300">-</button>
                  <input type="number" min="0" value={editQuantite} onChange={(e) => setEditQuantite(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 h-10 rounded-lg border border-[#D4A853]/15 bg-[#1A1714] px-3 text-center text-lg font-bold text-lounge-100" />
                  <button onClick={() => setEditQuantite((q) => q + 1)} className="h-10 w-10 rounded-lg bg-[#231F1B] text-lounge-300">+</button>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditItemModal(null)} className="flex-1 h-10 rounded-xl bg-[#231F1B] text-lounge-300 text-sm font-medium">Annuler</button>
                <button onClick={handleUpdateItem}
                  className="flex-1 h-10 rounded-xl bg-amber-500 text-lounge-950 text-sm font-bold">Valider</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
