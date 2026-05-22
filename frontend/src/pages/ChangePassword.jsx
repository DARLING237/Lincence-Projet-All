import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { Lock, Eye, EyeOff, AlertCircle, Check, Key, UtensilsCrossed, ArrowRight, Loader2 } from "lucide-react";

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
    <div className="min-h-[100dvh] flex bg-zinc-950 font-sans">
      {/* Left — Branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-brand-500 relative overflow-hidden flex-col justify-center px-16"
      >
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-black/10 shadow-inner" />
        <div className="absolute bottom-36 left-16 w-48 h-48 rounded-full bg-black/15 shadow-inner" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/20 shadow-sm border border-black/10">
              <Key size={28} className="text-black font-bold" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-black tracking-tight">Sécurité</h1>
              <p className="text-sm font-bold text-black/60 uppercase tracking-widest mt-1">Première connexion</p>
            </div>
          </div>
          <h2 className="text-5xl font-black text-black leading-tight mb-6">
            Protégez votre<br />compte
          </h2>
          <p className="text-lg font-medium text-black/80 max-w-md leading-relaxed">
            Votre compte a été créé avec un mot de passe temporaire.
            Changez-le maintenant pour sécuriser votre espace de travail.
          </p>
        </motion.div>
      </motion.div>

      {/* Right — Change Password Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16"
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-4 mb-10 lg:mb-14"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 shadow-[0_0_15px_rgba(212,168,83,0.3)] border border-brand-500/20">
              <Key size={24} className="text-black font-bold" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-50 tracking-tight">Changer le mot de passe</h1>
              <p className="text-sm font-medium text-zinc-400 mt-1">Bienvenue <span className="font-bold text-zinc-200">{user?.prenom}</span>, sécurisez votre compte</p>
            </div>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/20 border border-brand-500/30 mb-6 shadow-inner">
                <Check size={40} className="text-brand-500" />
              </div>
              <h3 className="text-xl font-black text-zinc-50 mb-2">Mot de passe modifié !</h3>
              <p className="text-sm font-medium text-zinc-400">Redirection vers la page de connexion...</p>
              <div className="mt-8 flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                 <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </motion.div>
          ) : (
            <>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-8 rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-4 shadow-lg backdrop-blur-md"
                >
                  <AlertCircle size={20} className="text-red-400 shrink-0" />
                  <p className="text-sm font-bold text-red-400">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User info */}
                <div className="rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-white/5 px-5 py-4 flex items-center gap-4 shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20 shadow-inner">
                    <UtensilsCrossed size={20} className="text-brand-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-black text-zinc-50 truncate">{user?.prenom} {user?.nom}</p>
                    <p className="text-xs font-medium text-zinc-400 truncate mt-0.5">{user?.email || "Pas d'email"}</p>
                  </div>
                  <ArrowRight size={20} className="text-zinc-600" />
                </div>

                {/* Ancien mot de passe */}
                <div>
                  <label className="block text-sm font-bold text-zinc-300 mb-2">Mot de passe actuel</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand-500 transition-colors" />
                    <input
                      type={showOld ? "text" : "password"}
                      value={ancien}
                      onChange={(e) => setAncien(e.target.value)}
                      required
                      placeholder="Mot de passe temporaire"
                      className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 pl-12 pr-12 text-sm font-bold text-zinc-50 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all shadow-inner"
                    />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                      {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-bold text-zinc-300 mb-2">Nouveau mot de passe</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand-500 transition-colors" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={nouveau}
                      onChange={(e) => setNouveau(e.target.value)}
                      required
                      placeholder="Minimum 6 caractères"
                      minLength={6}
                      className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 pl-12 pr-12 text-sm font-bold text-zinc-50 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all shadow-inner"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirmation */}
                <div>
                  <label className="block text-sm font-bold text-zinc-300 mb-2">Confirmer le mot de passe</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand-500 transition-colors" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      placeholder="Retapez le mot de passe"
                      className={`h-12 w-full rounded-xl border bg-zinc-950 pl-12 pr-4 text-sm font-bold text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all shadow-inner ${
                        confirm && nouveau !== confirm
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50"
                          : "border-white/10 focus:border-brand-500 focus:ring-brand-500/50"
                      }`}
                    />
                  </div>
                  {confirm && nouveau !== confirm && (
                    <p className="text-xs font-bold text-red-400 mt-2">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || nouveau !== confirm || nouveau.length < 6}
                    className="w-full h-12 rounded-xl bg-brand-500 text-black font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_20px_rgba(212,168,83,0.5)]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin h-5 w-5" />
                        Modification...
                      </span>
                    ) : (
                      "Changer le mot de passe"
                    )}
                  </motion.button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    localStorage.removeItem("token");
                    navigate("/login", { replace: true });
                  }}
                  className="w-full h-10 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-900/50 hover:bg-zinc-800"
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
