import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Clock,
  Star,
  Check,
  Plus,
  Minus,
  GlassWater,
  QrCode,
  Sparkles,
  Utensils,
  Send,
  Loader2,
  FlaskConical,
  CreditCard,
  Smartphone,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function formatMontant(montant) {
  return new Intl.NumberFormat("fr-FR").format(montant) + " F";
}

export function ClientQRPage() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderStep, setOrderStep] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [error, setError] = useState(null);
  const [payModal, setPayModal] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
  const [clientPhone, setClientPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const categories = ["Tout", "Best-sellers", "Boissons"];
  const [note, setNote] = useState("");

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = currentUser?.id;
  const serveur_id = userId || "";

  const paymentModes = [
    { id: "especes", label: "Espèces", icon: CreditCard },
    { id: "orange_money", label: "Orange Money", icon: Smartphone, color: "text-orange-400" },
    { id: "mtn_momo", label: "MTN MoMo", icon: Smartphone, color: "text-yellow-400" },
  ];

  const handlePayment = async () => {
    if (!selectedPaymentMode) return;
    if ((selectedPaymentMode === "orange_money" || selectedPaymentMode === "mtn_momo") && !clientPhone) return;

    setPaying(true);
    try {
      const res = await fetch(`${API_URL}/commandes/${orderNumber}/payer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode_paiement: selectedPaymentMode,
          num_client: clientPhone || null,
          campay_async: true,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setPaymentSuccess(true);
        setPayModal(false);
      }
    } catch (err) {
      setError("Erreur de paiement");
    }
    setPaying(false);
  };

  useEffect(() => {
    fetch(`${API_URL}/menu/produits`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          const available = (d.produits || []).filter((p) => p.dispo !== false);
          setProduits(available);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger le menu");
        setLoading(false);
      });
  }, [tableId]);

  useEffect(() => {
    if (!orderPlaced || !orderNumber) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/commandes/${orderNumber}`);
        const data = await res.json();

        if (data.success && data.commande) {
          const statut = data.commande.statut;

          if (statut === "servie") {
            setOrderStep("ready");
            clearInterval(interval);
          } else if (statut === "en preparation") {
            setOrderStep("preparing");
          } else if (statut === "en attente") {
            setOrderStep("submitted");
          } else if (statut === "payee") {
            setPaymentSuccess(true);
            clearInterval(interval);
          } else if (statut === "annulee") {
            setError("Commande annulée");
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Erreur polling:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderPlaced, orderNumber]);

  const filterCategory = (p) => {
    const cat = p.categorie_nom || p.categorie || "";
    if (selectedCategory === "Tout") return true;
    if (selectedCategory === "Best-sellers") return p.bestseller;
    if (selectedCategory === "Boissons") return p.type_poste === "bar";
    return cat === selectedCategory;
  };

  const filtered = produits.filter(filterCategory);

  const addToCart = (produit) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === produit.id);
      if (exists) {
        return prev.map((item) =>
          item.id === produit.id ? { ...item, qte: item.qte + 1 } : item
        );
      }
      return [...prev, { ...produit, qte: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === id);
      if (exists && exists.qte > 1) {
        return prev.map((item) =>
          item.id === id ? { ...item, qte: item.qte - 1 } : item
        );
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.prix * item.qte, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qte, 0);

  const placeOrder = async () => {
    try {
      setError(null);
      const payload = {
        ...(tableId ? { table_numero: String(tableId) } : {}),
        items: cart.map((item) => ({
          produit_menu_id: parseInt(item.id),
          quantite: parseInt(item.qte),
          prix_unitaire: parseFloat(item.prix),
          type_poste: String(item.type_poste),
        })),
        source: "qr_client",
        note: `Commande table ${tableId}`,
        ...(serveur_id ? { serveur_id: parseInt(serveur_id) } : {}),
      };

      const res = await fetch(`${API_URL}/commandes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setOrderNumber(data.commandesId);
        setOrderTotal(cartTotal);
        setOrderPlaced(true);
        setOrderStep("submitted");
        setCart([]);
        setCartOpen(false);
      } else {
        setError(data.message || "Impossible de passer la commande");
      }
    } catch (err) {
      setError("Erreur de connexion. Réessayer.");
    }
  };

  if (!tableId) {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-6">
        <p className="text-center text-lounge-400">QR code invalide — aucun numéro de table spécifié.</p>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex flex-col">
        <div className="bg-[#1A1714] border-b border-[#D4A853]/8 px-4 py-3 flex items-center gap-3">
          <QrCode size={20} className="text-[#D4A853]" />
          <div>
            <p className="text-sm font-bold text-lounge-100">Table {tableId}</p>
            <p className="text-xs text-lounge-400">Commande #{orderNumber || "..."}</p>
          </div>
        </div>

        <div className="px-6 py-8 flex-1">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              {[
                { label: "Envoyée", step: "submitted", icon: Send },
                { label: "En préparation", step: "preparing", icon: FlaskConical },
                { label: "Prêt !", step: "ready", icon: Check },
              ].map((s, i) => {
                const steps = ["submitted", "preparing", "ready"];
                const currentStep = steps.indexOf(orderStep);
                const done = steps.indexOf(s.step) <= currentStep;
                const active = s.step === orderStep;

                return (
                  <div key={s.step} className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.5, type: "spring" }}
                        className={`flex h-14 w-14 items-center justify-center rounded-full ${
                          done
                            ? active
                              ? "bg-gradient-to-br from-[#D4A853] to-[#C49742] shadow-lg shadow-[#D4A853]/30"
                              : "bg-[#D4A853]"
                            : "bg-[#2E2822]"
                        }`}
                      >
                        <s.icon
                          size={22}
                          className={done ? "text-[#0C0A09]" : "text-lounge-400"}
                        />
                      </motion.div>
                      <span className={`text-xs font-medium ${done ? "text-[#D4A853]" : "text-lounge-400"}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < 2 && (
                      <div className={`w-16 h-1 rounded-full mx-2 ${
                        currentStep > i ? "bg-[#D4A853]" : "bg-[#2E2822]"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {orderStep === "ready" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#D4A853] to-[#C49742] rounded-2xl p-6 text-center shadow-2xl shadow-[#D4A853]/30"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0C0A09]/20 mx-auto mb-3"
              >
                <Check size={32} className="text-[#0C0A09]" />
              </motion.div>
              <h3 className="text-xl font-bold text-[#0C0A09] mb-1">Commande prête !</h3>
              <p className="text-sm text-[#0C0A09]/70 mb-4">Le serveur arrive avec vos boissons</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-[#0C0A09]/30 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-[#0C0A09]/30 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="h-2 w-2 rounded-full bg-[#0C0A09]/30 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
              <button onClick={() => setPayModal(true)} className="w-full py-3 rounded-xl bg-[#0C0A09] text-[#D4A853] font-bold">
                Payer maintenant
              </button>
            </motion.div>
          )}

          {orderStep === "preparing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center"
            >
              <FlaskConical size={48} className="mx-auto text-amber-400 mb-3" />
              <h3 className="text-lg font-bold text-amber-400 mb-1">En préparation...</h3>
              <p className="text-sm text-amber-400">Notre équipe prépare votre commande</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Clock size={14} className="text-amber-400 animate-pulse" />
                <span className="text-sm font-medium text-amber-400">~10 min</span>
              </div>
            </motion.div>
          )}

          <button
            onClick={() => {
              setOrderPlaced(false);
              setOrderStep(null);
              setCartOpen(false);
            }}
            className="mt-8 w-full py-3 rounded-xl border-2 border-[#D4A853]/10 text-sm font-medium text-lounge-300 hover:border-[#D4A853]/20 bg-[#1A1714]"
          >
            Commander autre chose
          </button>
        </div>

        {/* ==================== MODAL PAIEMENT ==================== */}
        <AnimatePresence>
          {payModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-50" onClick={() => setPayModal(false)} />
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="fixed inset-x-4 bottom-4 max-w-lg mx-auto bg-[#1A1714] border border-[#D4A853]/15 rounded-2xl shadow-2xl z-50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-lounge-100">Paiement</h3>
                  <button onClick={() => setPayModal(false)} className="text-lounge-400 hover:text-lounge-200">
                    <X size={20} />
                  </button>
                </div>

                <div className="text-center mb-4">
                  <p className="text-sm text-lounge-400">Montant à payer</p>
                  <p className="text-3xl font-bold text-lounge-100">{formatMontant(orderTotal)}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {paymentModes.map((mode) => (
                    <button key={mode.id} onClick={() => setSelectedPaymentMode(mode.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        selectedPaymentMode === mode.id ? "border-[#D4A853] bg-[#D4A853]/10" : "border-[#2E2822] bg-[#231F1B]"
                      }`}>
                      <mode.icon size={24} className={selectedPaymentMode === mode.id ? "text-[#D4A853]" : mode.color || "text-lounge-400"} />
                      <span className={`text-xs font-medium ${selectedPaymentMode === mode.id ? "text-[#D4A853]" : "text-lounge-400"}`}>{mode.label}</span>
                    </button>
                  ))}
                </div>

                {(selectedPaymentMode === "orange_money" || selectedPaymentMode === "mtn_momo") && (
                  <div className="mb-4">
                    <label className="text-xs text-lounge-400 mb-2 block">Numéro de téléphone</label>
                    <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="6XX XXX XXX" className="w-full h-11 rounded-xl bg-[#231F1B] border border-[#2E2822] px-4 text-lounge-100" />
                  </div>
                )}

                <button onClick={handlePayment} disabled={!selectedPaymentMode || paying || (selectedPaymentMode !== "especes" && !clientPhone)}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 font-bold disabled:opacity-40">
                  {paying ? "Paiement en cours..." : "Valider le paiement"}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Message paiement réussi */}
        <AnimatePresence>
          {paymentSuccess && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 max-w-lg mx-auto bg-green-500/20 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 z-50">
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                <Check size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-400">Paiement confirmé !</p>
                <p className="text-xs text-green-400/70">Merci de votre visite</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#D4A853]" />
      </div>
    );
  }

  if (error && produits.length === 0) {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center justify-center p-6">
        <p className="text-sm text-red-400 text-center mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-[#D4A853] text-lounge-950 text-sm font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] flex flex-col">
      <div className="sticky top-0 z-20 bg-[#1A1714] border-b border-[#D4A853]/8 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A853] to-[#C49742]">
              <Utensils size={20} className="text-[#0C0A09]" />
            </div>
            <div>
              <p className="text-sm font-bold text-lounge-100">BarResto</p>
              <p className="text-xs text-lounge-400">Table {tableId}</p>
            </div>
          </div>

          {cart.length > 0 && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setCartOpen(!cartOpen)}
              className="relative flex items-center gap-1.5 h-10 px-3 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 text-sm font-medium shadow-lg shadow-[#D4A853]/20"
            >
              <ShoppingCart size={16} />
              <span>{formatMontant(cartTotal)}</span>
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0C0A09] text-xs font-bold text-[#D4A853] shadow">
                {cartCount}
              </span>
            </motion.button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 bg-gradient-to-r from-[#D4A853]/5 to-[#C49742]/5 mx-4 mt-3 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-[#D4A853]" />
          <span className="text-xs font-semibold text-[#D4A853] uppercase tracking-wider">Bienvenue</span>
        </div>
        <h2 className="text-xl font-bold text-lounge-100">Notre Carte</h2>
        <p className="text-xs text-lounge-400 mt-0.5">Commandez directement depuis votre table</p>
      </div>

      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-[#D4A853] text-lounge-950 shadow-md"
                  : "bg-[#1A1714] text-lounge-200 border border-[#D4A853]/10 hover:border-[#D4A853]/20"
              }`}
            >
              {cat === "Boissons" && <GlassWater size={12} className="inline mr-1 -mt-0.5" />}
              {cat === "Best-sellers" && <Star size={12} className="inline mr-1 -mt-0.5" />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-28 flex-1">
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((produit, i) => {
              const inCart = cart.find((item) => item.id === produit.id);
              return (
                <motion.div
                  key={produit.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className={!produit.dispo ? "opacity-50" : ""}
                >
                  <div className={`bg-[#1A1714] rounded-2xl shadow-sm border border-[#D4A853]/8 overflow-hidden ${!produit.dispo ? "pointer-events-none" : ""}`}>
                    {produit.photo ? (
                      <div className="h-28 relative overflow-hidden bg-[#231F1B]">
                        <img
                          src={produit.photo.startsWith("data:image") ? produit.photo : `http://${window.location.hostname}:3000${produit.photo}`}
                          alt={produit.nom}
                          className="h-full w-full object-cover"
                        />
                        {produit.bestseller && (
                          <span className="absolute top-2 left-2 flex items-center gap-0.5 bg-[#D4A853] text-[#0C0A09] text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                            <Star size={8} fill="#0C0A09" /> Best
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="h-28 bg-gradient-to-br from-[#231F1B] to-[#2E2822] flex items-center justify-center relative">
                        <GlassWater size={32} className="text-lounge-600" />
                        {produit.bestseller && (
                          <span className="absolute top-2 left-2 flex items-center gap-0.5 bg-[#D4A853] text-[#0C0A09] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            <Star size={8} fill="#0C0A09" /> Best
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-3">
                      <p className="text-sm font-semibold text-lounge-100 leading-tight line-clamp-2">{produit.nom}</p>
                      <p className="text-[11px] text-lounge-400 mt-0.5 line-clamp-1">{produit.description || ""}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-lounge-100">{formatMontant(produit.prix)}</span>

                        {!produit.dispo ? (
                          <span className="text-[10px] text-red-400 font-medium">Indisponible</span>
                        ) : inCart ? (
                          <div className="flex items-center gap-1.5 bg-[#D4A853]/10 border border-[#D4A853]/20 rounded-lg px-1.5 py-1">
                            <button
                              onClick={() => removeFromCart(produit.id)}
                              className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/10 text-red-400"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-bold bg-[#D4A853] text-lounge-950 w-4 text-center rounded">{inCart.qte}</span>
                            <button
                              onClick={() => addToCart(produit)}
                              className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#D4A853]/10 text-[#D4A853]"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(produit)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 hover:opacity-90 transition-opacity"
                          >
                            <Plus size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {cartOpen && cart.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/60 z-30"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-40 bg-lounge-900 border-t border-[#D4A853]/8 rounded-t-3xl shadow-2xl max-w-lg mx-auto"
            >
              <div className="p-5">
                <div className="w-10 h-1 bg-[#2E2822] rounded-full mx-auto mb-4" />

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-lounge-100">Mon Panier ({cartCount})</h3>
                  <button
                    onClick={() => { setCart([]); setCartOpen(false); }}
                    className="text-xs text-red-400 font-medium hover:text-red-300"
                  >
                    Vider
                  </button>
                </div>

                <div className="space-y-3 max-h-52 overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center bg-[#231F1B] rounded-lg text-xs font-bold text-lounge-200">
                          {item.qte}
                        </div>
                        <p className="text-sm font-medium text-lounge-100">{item.nom}</p>
                      </div>
                      <p className="text-sm font-semibold text-lounge-100">{formatMontant(item.prix * item.qte)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#D4A853]/8">
                  <span className="text-sm font-medium text-lounge-400">Total</span>
                  <span className="text-xl font-bold text-lounge-100">{formatMontant(cartTotal)}</span>
                </div>
                <p className="text-xs text-lounge-400 text-center mt-2 flex items-center justify-center gap-1.5">
                  <Clock size={12} />
                  Préparation estimée : ~10 min
                </p>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={placeOrder}
                  className="w-full h-12 mt-3 rounded-2xl bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 font-semibold text-sm shadow-lg shadow-[#D4A853]/25 hover:shadow-[#D4A853]/40 transition-shadow"
                >
                  Commander — {formatMontant(cartTotal)}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {!cartOpen && cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-20"
        >
          <button
            onClick={() => setCartOpen(true)}
            className="w-full h-14 flex items-center justify-between bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 font-semibold rounded-2xl shadow-xl shadow-[#D4A853]/30 px-5"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              <span>Voir mon panier</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium bg-[#0C0A09]/30 px-2 py-0.5 rounded-full">{cartCount}</span>
              <span className="font-bold">{formatMontant(cartTotal)}</span>
            </div>
          </button>
        </motion.div>
      )}

    </div>
  );
}
