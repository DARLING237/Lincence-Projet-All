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
      return setError("Le mot de passe doit contenir au moins 6 caracteres");
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
    <div className="min-h-screen flex bg-[#0C0A09]">
      {/* Left — Branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#D4A853] via-[#C49742] to-lounge-800 relative overflow-hidden flex-col justify-center px-16"
      >
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-lounge-950/10" />
        <div className="absolute bottom-36 left-16 w-48 h-48 rounded-full bg-lounge-950/15" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lounge-950/20">
              <Key size={28} className="text-lounge-950" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-lounge-950">Securite</h1>
              <p className="text-sm text-lounge-950/60">Premiere connexion</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-lounge-950 leading-tight mb-4">
            Protegez votre<br />compte
          </h2>
          <p className="text-lg text-lounge-950/70 mt-6 max-w-md leading-relaxed">
            Votre compte a ete cree avec un mot de passe temporaire.
            Changez-le maintenant pour securiser votre espace.
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4A853] to-[#C49742]">
              <Key size={22} className="text-lounge-950" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-lounge-100">Changer le mot de passe</h1>
              <p className="text-sm text-lounge-400">Bienvenue {user?.prenom}, securisez votre compte</p>
            </div>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D4A853]/15 mb-4">
                <Check size={32} className="text-[#D4A853]" />
              </div>
              <h3 className="text-lg font-bold text-lounge-100 mb-2">Mot de passe modifie !</h3>
              <p className="text-sm text-lounge-400">Redirection vers la page de connexion...</p>
            </motion.div>
          ) : (
            <>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* User info */}
                <div className="rounded-xl bg-[#1A1714] border border-[#D4A853]/10 px-4 py-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A853]/10">
                    <UtensilsCrossed size={16} className="text-[#D4A853]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-lounge-100 truncate">{user?.prenom} {user?.nom}</p>
                    <p className="text-xs text-lounge-400 truncate">{user?.email || "Pas d'email"}</p>
                  </div>
                  <ArrowRight size={16} className="text-lounge-500" />
                </div>

                {/* Ancien mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-lounge-300 mb-1.5">Mot de passe actuel</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-lounge-500" />
                    <input
                      type={showOld ? "text" : "password"}
                      value={ancien}
                      onChange={(e) => setAncien(e.target.value)}
                      required
                      placeholder="Mot de passe temporaire"
                      className="h-11 w-full rounded-xl border border-[#D4A853]/15 bg-[#1A1714] pl-10 pr-12 text-sm text-lounge-100 placeholder:text-lounge-500 focus:border-[#D4A853]/30 focus:outline-none focus:ring-1 focus:ring-[#D4A853]/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-lounge-500 hover:text-lounge-300 cursor-pointer">
                      {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-lounge-300 mb-1.5">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-lounge-500" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={nouveau}
                      onChange={(e) => setNouveau(e.target.value)}
                      required
                      placeholder="Minimum 6 caracteres"
                      minLength={6}
                      className="h-11 w-full rounded-xl border border-[#D4A853]/15 bg-[#1A1714] pl-10 pr-12 text-sm text-lounge-100 placeholder:text-lounge-500 focus:border-[#D4A853]/30 focus:outline-none focus:ring-1 focus:ring-[#D4A853]/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-lounge-500 hover:text-lounge-300 cursor-pointer">
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirmation */}
                <div>
                  <label className="block text-sm font-medium text-lounge-300 mb-1.5">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-lounge-500" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      placeholder="Retapez le mot de passe"
                      className={`h-11 w-full rounded-xl border border-[#D4A853]/15 bg-[#1A1714] pl-10 pr-4 text-sm text-lounge-100 focus:outline-none focus:ring-1 transition-all ${
                        confirm && nouveau !== confirm
                          ? "border-red-500/30 focus:ring-red-500/20"
                          : "focus:border-[#D4A853]/30 focus:ring-[#D4A853]/20"
                      }`}
                    />
                  </div>
                  {confirm && nouveau !== confirm && (
                    <p className="text-xs text-red-400 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || nouveau !== confirm || nouveau.length < 6}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#D4A853]/25"
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
                  className="w-full h-9 rounded-lg text-sm text-lounge-400 hover:text-lounge-200 transition-colors"
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
