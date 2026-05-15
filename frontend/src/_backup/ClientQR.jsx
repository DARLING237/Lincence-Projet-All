import { useState, useEffect } from "react";
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
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

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
  const [error, setError] = useState(null);

  const categories = ["Tout", "Best-sellers", "Boissons"];

  // Charger les produits au montage
  useEffect(() => {
    fetch(`${API_URL}/menu/produits`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          // Filtrer uniquement les disponibles
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

  const filterCategory = (p) => {
    if (selectedCategory === "Tout") return true;
    if (selectedCategory === "Best-sellers") return p.bestseller;
    if (selectedCategory === "Boissons") return p.type_poste === "bar";
    return p.categorie === selectedCategory;
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

      // Construire le payload
      const payload = {
        items: cart.map((item) => ({
          produit_menu_id: item.id,
          quantite: item.qte,
          prix_unitaire: item.prix,
          type_poste: item.type_poste,
        })),
        source: "qr_client",
        note: `Commande table ${tableId}`,
      };

      // Envoyer la commande au serveur
      const res = await fetch(`${API_URL}/commandes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setOrderNumber(data.commandesId);
        setOrderPlaced(true);
        setOrderStep("submitted");

        // Progression réelle du statut
        setTimeout(() => setOrderStep("preparing"), 5000);
        setTimeout(() => setOrderStep("ready"), 15000);

        setCart([]);
        setCartOpen(false);
      } else {
        setError(data.message || "Impossible de passer la commande");
      }
    } catch (err) {
      setError("Erreur de connexion. Réessayez.");
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#FDF6F0] flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
          <QrCode size={20} className="text-emerald-600" />
          <div>
            <p className="text-sm font-bold text-gray-900">Table {tableId}</p>
            <p className="text-xs text-gray-400">Commande #{orderNumber || "..."}</p>
          </div>
        </div>

        {/* Order Status Progress */}
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
                              ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30"
                              : "bg-emerald-500"
                            : "bg-gray-200"
                        }`}
                      >
                        <s.icon
                          size={22}
                          className={done ? "text-white" : "text-gray-400"}
                        />
                      </motion.div>
                      <span className={`text-xs font-medium ${done ? "text-emerald-700" : "text-gray-400"}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < 2 && (
                      <div className={`w-16 h-1 rounded-full mx-2 ${
                        currentStep > i ? "bg-emerald-500" : "bg-gray-200"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active order details */}
          {orderStep === "ready" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center"
            >
              <Check size={48} className="mx-auto text-emerald-600 mb-3" />
              <h3 className="text-lg font-bold text-emerald-900 mb-1">Votre commande est prête !</h3>
              <p className="text-sm text-emerald-600">Le serveur vous l'apporte dans un instant</p>
            </motion.div>
          )}

          {orderStep === "preparing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center"
            >
              <FlaskConical size={48} className="mx-auto text-amber-600 mb-3" />
              <h3 className="text-lg font-bold text-amber-900 mb-1">En préparation...</h3>
              <p className="text-sm text-amber-600">Notre équipe prépare votre commande</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Clock size={14} className="text-amber-500 animate-pulse" />
                <span className="text-sm font-medium text-amber-700">~10 min</span>
              </div>
            </motion.div>
          )}

          <button
            onClick={() => {
              setOrderPlaced(false);
              setOrderStep(null);
              setCartOpen(false);
            }}
            className="mt-8 w-full py-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 bg-white"
          >
            Commander autre chose
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6F0] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error && produits.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF6F0] flex flex-col items-center justify-center p-6">
        <p className="text-sm text-red-600 text-center mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6F0] flex flex-col">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-20 bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <Utensils size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">BarResto</p>
              <p className="text-xs text-gray-400">Table {tableId}</p>
            </div>
          </div>

          {/* Cart Button */}
          {cart.length > 0 && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setCartOpen(!cartOpen)}
              className="relative flex items-center gap-1.5 h-10 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/20"
            >
              <ShoppingCart size={16} />
              <span>{formatMontant(cartTotal)}</span>
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-600 shadow">
                {cartCount}
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="px-4 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 mx-4 mt-3 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-amber-500" />
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Bienvenue</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Notre Carte</h2>
        <p className="text-xs text-gray-500 mt-0.5">Commandez directement depuis votre table</p>
      </div>

      {/* ── Category Filter ── */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat === "Boissons" && <GlassWater size={12} className="inline mr-1 -mt-0.5" />}
              {cat === "Best-sellers" && <Star size={12} className="inline mr-1 -mt-0.5" />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Products Grid ── */}
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
                  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${!produit.dispo ? "pointer-events-none" : ""}`}>
                    {/* Product Image */}
                    {produit.photo ? (
                      <div className="h-28 relative overflow-hidden bg-gray-100">
                        <img
                          src={produit.photo.startsWith("data:image") ? produit.photo : `http://${window.location.hostname}:3000${produit.photo}`}
                          alt={produit.nom}
                          className="h-full w-full object-cover"
                        />
                        {produit.bestseller && (
                          <span className="absolute top-2 left-2 flex items-center gap-0.5 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                            <Star size={8} fill="white" /> Best
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="h-28 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                        <GlassWater size={32} className="text-gray-300" />
                        {produit.bestseller && (
                          <span className="absolute top-2 left-2 flex items-center gap-0.5 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            <Star size={8} fill="white" /> Best
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{produit.nom}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{produit.desc}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-gray-900">{formatMontant(produit.prix)}</span>

                        {!produit.dispo ? (
                          <span className="text-[10px] text-red-500 font-medium">Indisponible</span>
                        ) : inCart ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => removeFromCart(produit.id)}
                              className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-50 text-red-600"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-bold text-gray-900 w-4 text-center">{inCart.qte}</span>
                            <button
                              onClick={() => addToCart(produit)}
                              className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(produit)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
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

      {/* ── Cart Slide-up Panel ── */}
      <AnimatePresence>
        {cartOpen && cart.length > 0 && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/30 z-30"
            />
            {/* Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-2xl max-w-lg mx-auto"
            >
              <div className="p-5">
                {/* Drag handle */}
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Mon Panier ({cartCount})</h3>
                  <button
                    onClick={() => { setCart([]); setCartOpen(false); }}
                    className="text-xs text-red-500 font-medium hover:text-red-600"
                  >
                    Vider
                  </button>
                </div>

                <div className="space-y-3 max-h-52 overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                          {item.qte}×
                        </div>
                        <p className="text-sm font-medium text-gray-900">{item.nom}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatMontant(item.prix * item.qte)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatMontant(cartTotal)}</span>
                </div>

                <p className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1.5">
                  <Clock size={12} />
                  Préparation estimée : ~10 min
                </p>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={placeOrder}
                  className="w-full h-12 mt-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
                >
                  Commander — {formatMontant(cartTotal)}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom Cart Button ── */}
      {!cartOpen && cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-20"
        >
          <button
            onClick={() => setCartOpen(true)}
            className="w-full h-14 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl shadow-xl shadow-emerald-500/30 px-5"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              <span>Voir mon panier</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium bg-white/20 px-2 py-0.5 rounded-full">{cartCount}</span>
              <span className="font-bold">{formatMontant(cartTotal)}</span>
            </div>
          </button>
        </motion.div>
      )}
    </div>
  );
}
