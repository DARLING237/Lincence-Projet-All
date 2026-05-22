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
        alert("Erreur: " + (d?.message || "Impossible de créer la commande"));
      }
    }).catch(() => { alert("Erreur de connexion. Vérifiez le serveur."); });
  };

  const statutFlow = {
    "en attente": { next: "en preparation", label: "Préparer", color: "bg-brand-500 hover:bg-brand-400 text-black" },
    "en preparation": { next: "servie", label: "Servie", color: "bg-emerald-500 hover:bg-emerald-400 text-black" },
    "servie": { action: "payer", label: "Paiement", color: "bg-brand-500 hover:bg-brand-400 text-black" },
  };

  const paymentModes = [
    { id: "especes", label: "Espèces", icon: Receipt },
    { id: "orange_money", label: "Orange Money", icon: Smartphone, accent: "text-orange-500" },
    { id: "mtn_momo", label: "MTN MoMo", icon: Smartphone, accent: "text-yellow-500" },
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
    modifierItemCommande(editItemModal.commande_id, editItemModal.id, editQuantite).then((d) => {
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Commandes</h1>
          <p className="text-sm text-zinc-400 mt-1">{commandes.length} commandes actives</p>
        </div>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-brand-500 text-black text-sm font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
          <Plus size={18} />
          Nouvelle commande
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["Tout", "en attente", "en preparation", "servie", "payee"].map((s) => (
          <button key={s} onClick={() => setFilterStatut(s)}
            className={`h-10 px-4 rounded-lg text-sm font-medium transition-all ${
              filterStatut === s
                ? "bg-brand-500 text-black font-bold shadow-md shadow-brand-500/20"
                : "bg-zinc-800/50 border border-white/5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
            }`}>
            {s === "en attente" ? "En attente" : s === "en preparation" ? "En prép." : s === "servie" ? "Servie" : s === "payee" ? "Payée" : "Tout"}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="grid gap-4 grid-cols-1">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/5 p-12 text-center shadow-lg">
            <div className="h-16 w-16 mx-auto bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                <UtensilsCrossed size={32} className="text-zinc-500" />
            </div>
            <p className="text-base font-medium text-zinc-300">Aucune commande</p>
            <p className="text-sm text-zinc-500 mt-1">Il n'y a aucune commande correspondant à ces critères.</p>
          </div>
        ) : filtered.map((cmd) => (
          <motion.div key={cmd.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-white/5 p-5 shadow-lg card-hover flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
                  <Receipt size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-50">#{cmd.id}</p>
                  <p className="text-xs text-zinc-400">Table {cmd.table_nom || cmd.table}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1.5">
                <Badge variant={cmd.statut}>{cmd.statut}</Badge>
                <div className="flex items-center gap-1 text-xs font-medium text-zinc-400">
                  <Clock size={12} />
                  {cmd.temps} min
                </div>
              </div>
            </div>

            <div className="mb-4 text-center">
              <p className="text-2xl font-bold text-zinc-50">{formatMontant(cmd.total)}</p>
            </div>

            <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  {cmd.items.map((item, i) => (
                    <button key={i} onClick={() => openEditItemModal({ ...item, commande_id: cmd.id })}
                      className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800/50 border border-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
                      <GlassWater size={11} className="text-brand-500" />
                      <span className="text-zinc-500">x{item.qte}</span> {item.nom}
                    </button>
                  ))}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
              <p className="text-xs text-zinc-500">Serveur: <span className="font-medium text-zinc-300">{cmd.serveur}</span></p>
              <div className="flex gap-2">
                {/* Boutons avancés - Transfert et Différer */}
                {cmd.statut !== "payee" && cmd.statut !== "annulee" && (
                  <>
                    <button onClick={() => openTransferModal(cmd)}
                      className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-800 text-blue-400 hover:bg-blue-500/20 border border-white/5 transition-colors"
                      title="Transférer vers une autre table">
                      <ArrowRightLeft size={14} />
                    </button>
                    <button onClick={() => openDiffererModal(cmd)}
                      className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-800 text-purple-400 hover:bg-purple-500/20 border border-white/5 transition-colors"
                      title="Différer la commande">
                      <Calendar size={14} />
                    </button>
                  </>
                )}
                {/* Bouton Activer si commande différée */}
                {cmd.est_differee === 1 && (
                  <button onClick={() => handleActiver(cmd.id)}
                    className="flex items-center justify-center h-8 w-8 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors"
                    title="Activer la commande">
                    <Play size={14} />
                  </button>
                )}
                {statutFlow[cmd.statut] && statutFlow[cmd.statut].next && (
                  <button onClick={() => updateStatut(cmd.id, statutFlow[cmd.statut].next)}
                    className={`flex items-center gap-1.5 h-8 px-3 rounded-lg ${statutFlow[cmd.statut].color} text-xs font-bold shadow-sm transition-colors`}>
                    {statutFlow[cmd.statut].label === "Préparer" ? <FlaskConical size={14} /> : <Check size={14} />}
                    {statutFlow[cmd.statut].label}
                  </button>
                )}
                {statutFlow[cmd.statut] && statutFlow[cmd.statut].action === "payer" && (
                  <button onClick={() => openPayment(cmd)}
                    className={`flex items-center gap-1.5 h-8 px-3 rounded-lg ${statutFlow[cmd.statut].color} text-xs font-bold shadow-sm transition-colors`}>
                    <CreditCard size={14} />
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 cursor-pointer" onClick={() => setShowNew(false)} />
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              className="fixed inset-y-0 right-0 w-full md:w-[640px] bg-zinc-950 border-l border-white/10 z-50 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-black shadow-lg shadow-brand-500/20">
                    <Plus size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-50">Nouvelle Commande</h3>
                </div>
                <button onClick={() => setShowNew(false)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors"><X size={20} /></button>
              </div>

              {/* Table Select */}
              <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/30">
                <label className="text-xs font-semibold text-zinc-400 mb-3 block uppercase tracking-wider">Table</label>
                <div className="flex flex-wrap gap-2">
                  {tables.filter((t) => t.statut !== "reservee").map((t) => (
                    <button key={t.id} onClick={() => setNewOrderTable(t.numero)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        newOrderTable === t.numero
                          ? "bg-brand-500 text-black shadow-md shadow-brand-500/20"
                          : "bg-zinc-800 border border-white/5 text-zinc-300 hover:bg-zinc-700"
                      }`}>
                      {t.numero}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Search */}
              <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/30">
                <input value={prodSearch} onChange={(e) => setProdSearch(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all" />
                <div className="flex flex-wrap gap-2 mt-3">
                  {categories.map((c) => (
                    <button key={c} onClick={() => setProdCat(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        prodCat === c ? "bg-brand-500 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products */}
              <div className="flex-1 overflow-y-auto px-6 py-4 bg-zinc-950">
                <div className="grid grid-cols-2 gap-3">
                  {allProds.map((p) => {
                    const inCart = cartItems.find((i) => i.id === p.id);
                    return (
                      <button key={p.id} onClick={() => addToCart(p)}
                        className={`flex items-center justify-between rounded-xl p-4 text-left transition-all border ${
                          inCart ? "bg-brand-500/10 border-brand-500/30 shadow-md" : "bg-zinc-900 border-white/5 hover:border-white/20 hover:bg-zinc-800"
                        }`}>
                        <div className="min-w-0 pr-2">
                          <p className="text-sm font-bold text-zinc-50 truncate mb-1">{p.nom}</p>
                          <p className="text-xs font-medium text-brand-500">{formatMontant(p.prix)}</p>
                        </div>
                        {inCart ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-black text-sm font-bold flex-shrink-0">{inCart.qte}</span>
                        ) : (
                          <div className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 flex-shrink-0">
                            <Plus size={16} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cart Summary */}
              {cartItems.length > 0 && (
                <div className="border-t border-white/10 px-6 py-5 bg-zinc-900 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                  <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm bg-zinc-950 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center h-6 w-6 rounded-md bg-zinc-800 text-xs font-bold text-zinc-300">{item.qte}</span>
                          <span className="font-medium text-zinc-100">{item.nom}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-zinc-50">{formatMontant(item.prix * item.qte)}</span>
                          <button onClick={() => removeFromCart(item.id)} className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                            <Minus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-base font-medium text-zinc-400">Total</span>
                    <span className="text-2xl font-bold text-brand-500">{formatMontant(cartTotal)}</span>
                  </div>
                  <button onClick={submitOrder}
                    disabled={!newOrderTable}
                    className="w-full h-12 rounded-xl bg-brand-500 text-black text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer"
              onClick={() => { if (!payModal.paymentPending) setPayModal(null); }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 inset-x-4 md:w-[460px] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-900/50">
                <div>
                  <h3 className="text-lg font-bold text-zinc-50">Paiement Commande #{payModal.cmd.id}</h3>
                  <p className="text-sm text-zinc-400 mt-0.5">Table {payModal.cmd.table_nom || payModal.cmd.table} · {payModal.cmd.heure}</p>
                </div>
                <button onClick={() => { if (!payModal.paymentPending) setPayModal(null); }} className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-700 transition-colors"><X size={20} /></button>
              </div>

              <div className="p-6">
                <div className="text-center mb-8 bg-zinc-900 rounded-xl py-6 border border-white/5">
                  <p className="text-sm font-medium text-zinc-400 mb-1">Montant total</p>
                  <p className="text-4xl font-bold text-brand-500">{formatMontant(payModal.cmd.total)}</p>
                </div>

                <label className="text-xs font-semibold text-zinc-400 mb-3 block uppercase tracking-wider">Mode de paiement</label>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {paymentModes.map((pm) => (
                    <button key={pm.id} onClick={() => setPayModal((prev) => ({ ...prev, mode: pm.id }))}
                      className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                        payModal.mode === pm.id
                          ? "border-brand-500 bg-brand-500/10"
                          : "border-white/5 hover:border-white/20 bg-zinc-900"
                      }`}>
                      <pm.icon size={24} className={payModal.mode === pm.id && pm.accent ? pm.accent : payModal.mode === pm.id ? "text-brand-500" : "text-zinc-500"} />
                      <span className={`text-sm font-bold ${payModal.mode === pm.id ? "text-brand-500" : "text-zinc-300"}`}>{pm.label}</span>
                    </button>
                  ))}
                </div>

                {["orange_money", "mtn_momo"].includes(payModal.mode) && (
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block uppercase tracking-wider">Numéro du client</label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-white/5 bg-zinc-900 rounded-l-xl">
                          <Phone size={18} className="text-zinc-500" />
                      </div>
                      <input
                        value={payModal.numClient || ""}
                        onChange={(e) => setPayModal((prev) => ({ ...prev, numClient: e.target.value }))}
                        placeholder="2376XXXXXXXX"
                        className="w-full h-12 rounded-xl border border-white/10 bg-zinc-950 pl-14 pr-4 text-base font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                      {payModal.mode === "orange_money" ? "Format: 23761XXXXXX (Orange)" : "Format: 23767XXXXXX (MTN)"}
                    </p>
                  </div>
                )}

                {!payModal.campayAsync && (
                  <input value={payModal.ref || ""} onChange={(e) => setPayModal((prev) => ({ ...prev, ref: e.target.value }))}
                    placeholder="Référence (optionnel)"
                    className="w-full h-12 rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 placeholder:text-zinc-600 mb-6 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all" />
                )}

                {payModal.paymentPending ? (
                  <div className="space-y-4 mb-2">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-center">
                      <Clock size={36} className="mx-auto text-amber-500 mb-3 animate-pulse" />
                      <p className="text-base font-bold text-amber-500">En attente de confirmation</p>
                      <p className="text-sm text-amber-500/80 mt-1">Le client doit approuver le paiement sur son téléphone</p>
                      {payModal.campayUssd && (
                        <div className="mt-3 py-2 bg-amber-500/10 rounded-lg inline-block px-4">
                           <p className="text-xs text-amber-500/80">Composez : <strong className="text-amber-400 font-bold ml-1">{payModal.campayUssd}</strong></p>
                        </div>
                      )}
                    </div>
                    <button onClick={verifyCampayPayment}
                      className="w-full h-12 rounded-xl bg-amber-500 text-black text-base font-bold shadow-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-2">
                      <CircleCheck size={18} />
                      Vérifier le paiement
                    </button>
                  </div>
                ) : (
                  <button onClick={confirmPayment}
                    disabled={!payModal.mode || (["orange_money", "mtn_momo"].includes(payModal.mode) && !payModal.numClient)}
                    className="w-full h-12 rounded-xl bg-brand-500 text-black text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all flex items-center justify-center gap-2">
                    <CircleCheck size={18} />
                    Confirmer le paiement
                  </button>
                )}

                {payModal.campayStatus === "FAILED" && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center mt-4">
                    <p className="text-sm font-bold text-red-500">Échec du paiement</p>
                    <p className="text-xs text-red-400 mt-1">Le client n'a pas confirmé ou le paiement a été refusé.</p>
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
            className="fixed top-6 left-1/2 z-[60] bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20">
              <CircleCheck size={20} />
            </div>
            <div>
              <p className="text-base font-bold">Paiement confirmé</p>
              <p className="text-sm font-medium text-white/90 mt-0.5">Commande #{paySuccess.id} · {formatMontant(paySuccess.montant)} · {paySuccess.mode}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Success Toast */}
      <AnimatePresence>
        {transferSuccess && (
          <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-6 left-1/2 z-[60] bg-blue-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20">
              <CircleCheck size={20} />
            </div>
            <div>
              <p className="text-base font-bold">Commande transférée</p>
              <p className="text-sm font-medium text-white/90 mt-0.5">{transferSuccess.table}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MODAL TRANSFERT ==================== */}
      <AnimatePresence>
        {transferModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer" onClick={() => setTransferModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[420px] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 p-6">
              <h3 className="text-xl font-bold text-zinc-50 mb-2 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <ArrowRightLeft size={20} className="text-blue-500" />
                </div>
                Transférer #{transferModal.cmd?.id}
              </h3>
              <p className="text-sm font-medium text-zinc-400 mb-6">Table actuelle: <strong className="text-zinc-200">{transferModal.cmd?.table}</strong></p>
              
              <label className="text-xs font-semibold text-zinc-400 mb-3 block uppercase tracking-wider">Sélectionner une nouvelle table</label>
              <div className="grid grid-cols-3 gap-3 mb-6 max-h-48 overflow-y-auto pr-1">
                {tables.filter((t) => t.id !== transferModal?.cmd?.table_id).map((t) => {
                  const statusColor = t.statut === "libre" ? "bg-emerald-500" : t.statut === "occupee" ? "bg-red-500" : "bg-amber-500";
                  const statusLabel = t.statut === "libre" ? "L" : t.statut === "occupee" ? "O" : "R";
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTransferModal((prev) => ({ ...prev, nouvelleTableId: t.id }))}
                      disabled={t.statut === "reservee"}
                      className={`relative px-3 py-3 rounded-xl text-base font-bold transition-all border ${
                        transferModal.nouvelleTableId === t.id
                          ? "bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          : t.statut === "reservee"
                            ? "bg-zinc-900 border-white/5 text-zinc-600 opacity-50 cursor-not-allowed"
                            : "bg-zinc-900 border-white/5 text-zinc-300 hover:bg-zinc-800 hover:border-white/10"
                      }`}>
                      <span className={`absolute top-2 right-2 h-2.5 w-2.5 rounded-full ${statusColor} shadow-[0_0_8px_currentColor] opacity-80`} title={t.statut} />
                      {t.numero}
                    </button>
                  );
                })}
              </div>
              {tables.filter((t) => t.statut === "libre" && t.id !== transferModal.cmd?.table_id).length === 0 &&
                tables.some((t) => t.statut === "occupee" && t.id !== transferModal.cmd?.table_id) && (
                  <div className="p-3 bg-zinc-900 rounded-lg border border-white/5 mb-6">
                    <p className="text-xs font-medium text-zinc-400">Seules les tables occupées sont disponibles — un échange sera possible.</p>
                  </div>
                )}
              <div className="flex gap-3 mt-auto">
                <button onClick={() => setTransferModal(null)} className="flex-1 h-12 rounded-xl bg-zinc-800 border border-white/5 text-zinc-300 text-sm font-bold hover:bg-zinc-700 transition-colors">Annuler</button>
                <button onClick={handleTransfer} disabled={!transferModal.nouvelleTableId}
                  className="flex-1 h-12 rounded-xl bg-blue-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all">Confirmer</button>
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer" onClick={() => setDiffererModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[420px] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 p-6">
              <h3 className="text-xl font-bold text-zinc-50 mb-6 flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Calendar size={20} className="text-purple-500" />
                </div>
                Différer #{differerModal.cmd?.id}
              </h3>
              <div className="space-y-5 mb-8">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 mb-2 block uppercase tracking-wider">Date prévue</label>
                  <input type="date" value={differerModal.date} onChange={(e) => setDiffererModal((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full h-12 rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all [color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 mb-2 block uppercase tracking-wider">Heure prévue</label>
                  <input type="time" value={differerModal.heure} onChange={(e) => setDiffererModal((prev) => ({ ...prev, heure: e.target.value }))}
                    className="w-full h-12 rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all [color-scheme:dark]" />
                </div>
              </div>
              <div className="flex gap-3 mt-auto">
                <button onClick={() => setDiffererModal(null)} className="flex-1 h-12 rounded-xl bg-zinc-800 border border-white/5 text-zinc-300 text-sm font-bold hover:bg-zinc-700 transition-colors">Annuler</button>
                <button onClick={handleDifferer} disabled={!differerModal.date || !differerModal.heure}
                  className="flex-1 h-12 rounded-xl bg-purple-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all">Confirmer</button>
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer" onClick={() => setEditItemModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[380px] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 p-6">
              <h3 className="text-xl font-bold text-zinc-50 mb-6 flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Edit size={20} className="text-amber-500" />
                </div>
                Modifier {editItemModal.nom}
              </h3>
              <div className="mb-8 bg-zinc-900 rounded-xl p-6 border border-white/5">
                <label className="text-xs font-semibold text-zinc-400 mb-4 block uppercase tracking-wider text-center">Quantité (0 = supprimer)</label>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setEditQuantite((q) => Math.max(0, q - 1))} className="h-12 w-12 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors border border-white/5"><Minus size={20} /></button>
                  <input type="number" min="0" value={editQuantite} onChange={(e) => setEditQuantite(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 h-14 rounded-xl border border-white/10 bg-zinc-950 px-3 text-center text-2xl font-bold text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors" />
                  <button onClick={() => setEditQuantite((q) => q + 1)} className="h-12 w-12 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors border border-white/5"><Plus size={20} /></button>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditItemModal(null)} className="flex-1 h-12 rounded-xl bg-zinc-800 border border-white/5 text-zinc-300 text-sm font-bold hover:bg-zinc-700 transition-colors">Annuler</button>
                <button onClick={handleUpdateItem}
                  className="flex-1 h-12 rounded-xl bg-amber-500 text-black text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all">Enregistrer</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
