import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { Lock, Eye, EyeOff, AlertCircle, Check, Key, UtensilsCrossed, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

export function ChangePassword({ redirectPath }) {
  const [ancien, setAncien] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);

  // Si pas de user connecté, rediriger vers login
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (nouveau !== confirm) {
      return setError("Les mots de passe ne correspondent pas");
    }
    if (nouveau.length < 6) {
      return setError("Le mot de passe doit contenir au moins 6 caractères");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ancien_mot_de_passe: ancien, nouveau_mot_de_passe: nouveau }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Erreur lors du changement de mot de passe");
        setLoading(false);
        return;
      }

      // Succès — déconnexion forcée
      setSuccess(true);
      setTimeout(() => {
        logout();
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 relative overflow-hidden flex-col justify-center px-16"
      >
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-36 left-16 w-48 h-48 rounded-full bg-white/10" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <Key size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Sécurité</h1>
              <p className="text-sm text-white/60">Première connexion</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Protégez votre<br />compte
          </h2>
          <p className="text-lg text-white/70 mt-6 max-w-md leading-relaxed">
            Votre compte a été créé avec un mot de passe temporaire.
            Changez-le maintenant pour sécuriser votre espace.
          </p>
        </motion.div>
      </motion.div>

      {/* Right — Change Password Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full flex items-center justify-center px-8 py-16"
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3 mb-10 lg:mb-14"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500">
              <Key size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Changer le mot de passe</h1>
              <p className="text-sm text-gray-500">Bienvenue {user?.prenom}, sécurisez votre compte</p>
            </div>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                <Check size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Mot de passe modifié !</h3>
              <p className="text-sm text-gray-500">Redirection vers la page de connexion...</p>
            </motion.div>
          ) : (
            <>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email pré-rempli (juste affiché) */}
                <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                    <UtensilsCrossed size={16} className="text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.prenom} {user?.nom}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || "Pas d'email"}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </div>

                {/* Ancien mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe actuel</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showOld ? "text" : "password"}
                      value={ancien}
                      onChange={(e) => setAncien(e.target.value)}
                      required
                      placeholder="Mot de passe temporaire"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-12 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                      {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={nouveau}
                      onChange={(e) => setNouveau(e.target.value)}
                      required
                      placeholder="Minimum 6 caractères"
                      minLength={6}
                      className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-12 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirmation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      placeholder="Retapez le mot de passe"
                      className={`h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition-all ${
                        confirm && nouveau !== confirm
                          ? "border-red-300 focus:ring-red-100"
                          : "focus:border-amber-400 focus:ring-amber-100"
                      }`}
                    />
                  </div>
                  {confirm && nouveau !== confirm && (
                    <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || nouveau !== confirm || nouveau.length < 6}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/25"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                      </svg>
                      Modification...
                    </span>
                  ) : (
                    "Changer le mot de passe"
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    localStorage.removeItem("token");
                    navigate("/login", { replace: true });
                  }}
                  className="w-full h-9 rounded-lg text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Se connecter plus tard
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
