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
    }, 15000);

    return () => clearInterval(interval);
  }, [orderPlaced, orderNumber]);

  const filterCategory = (p) => {
    const cat = p.categorie_nom || p.categorie || "";
    if (selectedCategory === "Tout") return true;
    if (selectedCategory === "Best-sellers") return p.bestseller;
    if (selectedCategory === "Boissons") return p.type_poste === "tous" || p.categorie_nom?.toLowerCase().includes("boisson") || p.categorie?.toLowerCase().includes("boisson");
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
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center p-6">
        <p className="text-center text-zinc-400 font-bold">QR code invalide — aucun numéro de table spécifié.</p>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex flex-col">
        <div className="bg-zinc-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
           <div className="bg-brand-500/10 p-2 rounded-xl">
               <QrCode size={20} className="text-brand-500" />
           </div>
          <div>
            <p className="text-sm font-bold text-zinc-50">Table {tableId}</p>
            <p className="text-xs font-medium text-zinc-400">Commande #{orderNumber || "..."}</p>
          </div>
        </div>

        <div className="px-6 py-8 flex-1 max-w-lg mx-auto w-full">
          <div className="flex items-center justify-center mb-8 bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl py-6 shadow-lg">
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
                        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-inner ${
                          done
                            ? active
                              ? "bg-brand-500 shadow-[0_0_15px_rgba(212,168,83,0.4)] border-2 border-brand-500"
                              : "bg-brand-500"
                            : "bg-zinc-800 border border-white/5"
                        }`}
                      >
                        <s.icon
                          size={22}
                          className={done ? "text-black font-bold" : "text-zinc-500"}
                        />
                      </motion.div>
                      <span className={`text-xs font-bold ${done ? "text-brand-500" : "text-zinc-500"}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < 2 && (
                      <div className={`w-8 sm:w-16 h-1.5 rounded-full mx-2 shadow-inner ${
                        currentStep > i ? "bg-brand-500 shadow-[0_0_5px_rgba(212,168,83,0.5)]" : "bg-zinc-800 border border-white/5"
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
              className="bg-brand-500 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(212,168,83,0.3)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-black/20 mx-auto mb-3 shadow-inner border border-black/10"
              >
                <Check size={32} className="text-black font-bold" />
              </motion.div>
              <h3 className="text-xl font-black text-black mb-1 relative z-10">Commande prête !</h3>
              <p className="text-sm font-bold text-black/70 mb-4 relative z-10">Le serveur arrive avec vos boissons</p>
              <div className="flex items-center justify-center gap-2 mb-4 relative z-10">
                <div className="h-2.5 w-2.5 rounded-full bg-black/30 animate-pulse" />
                <div className="h-2.5 w-2.5 rounded-full bg-black/30 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="h-2.5 w-2.5 rounded-full bg-black/30 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
              <button onClick={() => setPayModal(true)} className="w-full py-3.5 rounded-xl bg-black text-brand-500 font-bold relative z-10 hover:bg-zinc-900 transition-colors shadow-lg">
                Payer maintenant
              </button>
            </motion.div>
          )}

          {orderStep === "preparing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-amber-500/10 border border-amber-500/20 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg"
            >
              <FlaskConical size={48} className="mx-auto text-amber-500 mb-3 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <h3 className="text-xl font-black text-amber-500 mb-1">En préparation...</h3>
              <p className="text-sm font-bold text-amber-500/80">Notre équipe prépare votre commande</p>
              <div className="mt-4 flex items-center justify-center gap-2 bg-amber-500/20 w-fit mx-auto px-3 py-1.5 rounded-lg border border-amber-500/30">
                <Clock size={16} className="text-amber-500 animate-pulse" />
                <span className="text-sm font-black text-amber-500">~10 min</span>
              </div>
            </motion.div>
          )}

          <button
            onClick={() => {
              setOrderPlaced(false);
              setOrderStep(null);
              setCartOpen(false);
            }}
            className="mt-8 w-full py-3.5 rounded-xl border-2 border-white/10 text-sm font-bold text-zinc-300 hover:border-brand-500/30 hover:text-brand-500 bg-zinc-900/50 backdrop-blur-md transition-colors"
          >
            Commander autre chose
          </button>
        </div>

        {/* ==================== MODAL PAIEMENT ==================== */}
        <AnimatePresence>
          {payModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm" onClick={() => setPayModal(false)} />
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="fixed inset-x-4 bottom-4 max-h-[calc(100dvh-2rem)] max-w-lg mx-auto bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
                <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-6 py-5 bg-zinc-950/30">
                  <h3 className="text-xl font-bold text-zinc-50">Paiement</h3>
                  <button onClick={() => setPayModal(false)} className="text-zinc-400 hover:text-zinc-200 bg-zinc-800 p-1.5 rounded-lg">
                    <X size={20} />
                  </button>
                </div>

                <div className="overflow-y-auto p-6">
                  <div className="text-center mb-6 bg-zinc-950 rounded-xl p-4 border border-white/5 shadow-inner">
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1">Montant à payer</p>
                    <p className="text-4xl font-black text-brand-500">{formatMontant(orderTotal)}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {paymentModes.map((mode) => (
                      <button key={mode.id} onClick={() => setSelectedPaymentMode(mode.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          selectedPaymentMode === mode.id ? "border-brand-500 bg-brand-500/10 shadow-[0_0_10px_rgba(212,168,83,0.2)]" : "border-white/5 bg-zinc-950 hover:bg-zinc-800"
                        }`}>
                        <mode.icon size={28} className={selectedPaymentMode === mode.id ? "text-brand-500 drop-shadow-[0_0_5px_rgba(212,168,83,0.5)]" : mode.color || "text-zinc-400"} />
                        <span className={`text-xs font-bold ${selectedPaymentMode === mode.id ? "text-brand-500" : "text-zinc-400"}`}>{mode.label}</span>
                      </button>
                    ))}
                  </div>

                  {(selectedPaymentMode === "orange_money" || selectedPaymentMode === "mtn_momo") && (
                    <div className="mb-6">
                      <label className="text-xs font-bold text-zinc-400 mb-2 block uppercase tracking-wider">Numéro de téléphone</label>
                      <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="6XX XXX XXX" className="w-full h-12 rounded-xl bg-zinc-950 border border-white/10 px-4 text-zinc-50 font-bold focus:outline-none focus:border-brand-500 shadow-inner" />
                    </div>
                  )}

                  <button onClick={handlePayment} disabled={!selectedPaymentMode || paying || (selectedPaymentMode !== "especes" && !clientPhone)}
                    className="w-full h-12 rounded-xl bg-brand-500 text-black font-black disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all">
                    {paying ? "Paiement en cours..." : "Valider le paiement"}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Message paiement réussi */}
        <AnimatePresence>
          {paymentSuccess && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 max-w-lg mx-auto bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 z-50 shadow-lg">
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                <Check size={24} className="text-white font-bold" />
              </div>
              <div>
                <p className="text-base font-black text-emerald-400">Paiement confirmé !</p>
                <p className="text-sm font-bold text-emerald-400/80">Merci de votre visite</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-brand-500 drop-shadow-[0_0_10px_rgba(212,168,83,0.5)]" />
      </div>
    );
  }

  if (error && produits.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center p-6">
        <p className="text-base font-bold text-red-400 text-center mb-6 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl bg-brand-500 text-black text-sm font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex flex-col font-sans">
      <div className="sticky top-0 z-20 bg-zinc-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 shadow-[0_0_10px_rgba(212,168,83,0.3)]">
              <Utensils size={22} className="text-black font-bold" />
            </div>
            <div>
              <p className="text-base font-black text-zinc-50 tracking-tight">BarResto</p>
              <p className="text-xs font-bold text-zinc-400">Table {tableId}</p>
            </div>
          </div>

          {cart.length > 0 && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setCartOpen(!cartOpen)}
              className="relative flex items-center gap-2 h-11 px-4 rounded-xl bg-brand-500 text-black text-sm font-black shadow-[0_0_10px_rgba(212,168,83,0.3)] hover:shadow-[0_0_15px_rgba(212,168,83,0.4)] transition-all"
            >
              <ShoppingCart size={18} />
              <span>{formatMontant(cartTotal)}</span>
              <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 text-xs font-black text-brand-500 shadow-md border border-white/10">
                {cartCount}
              </span>
            </motion.button>
          )}
        </div>
      </div>

      <div className="px-5 py-5 bg-gradient-to-r from-brand-500/15 to-transparent mx-4 mt-4 rounded-2xl border border-brand-500/10 shadow-inner max-w-lg md:mx-auto md:w-full">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={16} className="text-brand-500 drop-shadow-[0_0_5px_rgba(212,168,83,0.5)]" />
          <span className="text-xs font-black text-brand-500 uppercase tracking-widest">Bienvenue</span>
        </div>
        <h2 className="text-2xl font-black text-zinc-50 tracking-tight">Notre Carte</h2>
        <p className="text-sm font-medium text-zinc-400 mt-1">Commandez directement depuis votre table</p>
      </div>

      <div className="px-4 py-4 overflow-x-auto max-w-lg mx-auto w-full no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-brand-500 text-black shadow-md shadow-brand-500/20"
                  : "bg-zinc-900/50 backdrop-blur-md text-zinc-300 border border-white/5 hover:bg-zinc-800"
              }`}
            >
              {cat === "Boissons" && <GlassWater size={14} className="inline mr-1.5 -mt-0.5" />}
              {cat === "Best-sellers" && <Star size={14} className="inline mr-1.5 -mt-0.5" />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-28 flex-1 max-w-lg mx-auto w-full">
        <div className="grid grid-cols-2 gap-4">
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
                  className={!produit.dispo ? "opacity-50 grayscale" : ""}
                >
                  <div className={`bg-zinc-900/50 backdrop-blur-md rounded-2xl shadow-lg border border-white/5 overflow-hidden h-full flex flex-col ${!produit.dispo ? "pointer-events-none" : ""}`}>
                    {produit.photo ? (
                      <div className="h-32 relative overflow-hidden bg-zinc-950">
                        <img
                          src={produit.photo.startsWith("data:image") ? produit.photo : `http://${window.location.hostname}:3000${produit.photo}`}
                          alt={produit.nom}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        {produit.bestseller && (
                          <span className="absolute top-2 left-2 flex items-center gap-1 bg-brand-500 text-black text-[10px] font-black px-2 py-1 rounded-full shadow-md">
                            <Star size={10} fill="#000" /> BEST
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="h-32 bg-zinc-950 flex items-center justify-center relative shadow-inner">
                        <GlassWater size={36} className="text-zinc-700" />
                        {produit.bestseller && (
                          <span className="absolute top-2 left-2 flex items-center gap-1 bg-brand-500 text-black text-[10px] font-black px-2 py-1 rounded-full shadow-md">
                            <Star size={10} fill="#000" /> BEST
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-3.5 flex flex-col flex-1">
                      <p className="text-sm font-bold text-zinc-50 leading-tight line-clamp-2">{produit.nom}</p>
                      <p className="text-[11px] font-medium text-zinc-400 mt-1 line-clamp-2 flex-1">{produit.description || ""}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-black text-brand-500 drop-shadow-[0_0_2px_rgba(212,168,83,0.5)]">{formatMontant(produit.prix)}</span>

                        {!produit.dispo ? (
                          <span className="text-[10px] font-bold text-red-400 uppercase bg-red-500/10 px-1.5 py-0.5 rounded">Rupture</span>
                        ) : inCart ? (
                          <div className="flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/20 rounded-xl px-1.5 py-1">
                            <button
                              onClick={() => removeFromCart(produit.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950 text-zinc-300 hover:text-white border border-white/5 shadow-inner"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-black text-brand-500 w-4 text-center">{inCart.qte}</span>
                            <button
                              onClick={() => addToCart(produit)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-black shadow-sm"
                            >
                              <Plus size={14} className="font-bold" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(produit)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:bg-brand-500 hover:text-black hover:shadow-[0_0_10px_rgba(212,168,83,0.3)] transition-all border border-white/5"
                          >
                            <Plus size={16} className="font-bold" />
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
              className="fixed inset-0 bg-black/80 z-30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-white/10 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-w-lg mx-auto"
            >
              <div className="p-6">
                <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6 shadow-inner" />

                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-black text-zinc-50">Mon Panier <span className="text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-lg text-sm ml-2">{cartCount}</span></h3>
                  <button
                    onClick={() => { setCart([]); setCartOpen(false); }}
                    className="text-sm text-red-400 font-bold hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20"
                  >
                    Vider
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center bg-zinc-900 border border-white/5 rounded-xl text-sm font-black text-zinc-300 shadow-inner">
                          {item.qte}x
                        </div>
                        <p className="text-sm font-bold text-zinc-100">{item.nom}</p>
                      </div>
                      <p className="text-sm font-black text-brand-500">{formatMontant(item.prix * item.qte)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 bg-zinc-900/50 -mx-6 px-6 pb-2">
                  <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-black text-zinc-50">{formatMontant(cartTotal)}</span>
                </div>
                <p className="text-xs font-bold text-zinc-500 text-center mt-3 mb-4 flex items-center justify-center gap-1.5">
                  <Clock size={14} className="text-brand-500" />
                  Préparation estimée : ~10 min
                </p>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={placeOrder}
                  className="w-full h-14 rounded-xl bg-brand-500 text-black font-black text-base shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} />
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
            className="w-full h-14 flex items-center justify-between bg-brand-500 text-black font-black rounded-2xl shadow-[0_0_20px_rgba(212,168,83,0.4)] px-5 hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart size={20} />
              <span className="text-sm">Voir mon panier</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black bg-black text-brand-500 px-2 py-1 rounded-lg">{cartCount}</span>
              <span className="text-lg">{formatMontant(cartTotal)}</span>
            </div>
          </button>
        </motion.div>
      )}

    </div>
  );
}
