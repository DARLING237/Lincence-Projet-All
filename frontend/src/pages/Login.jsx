import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const user = useAppStore((s) => s.user);

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/staff", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mot_de_passe: password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Identifiants incorrects");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      login(data.user);

      if (data.first_login) {
        navigate("/change-password", { replace: true });
      } else {
        const role = data.user.role;
        navigate(role === "admin" ? "/admin" : "/staff", { replace: true });
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0C0A09]">
      {/* Left — Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center px-16"
      >
        {/* Animated background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1714] via-[#231F1B] to-[#0C0A09]" />
        <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] rounded-full bg-[#D4A853]/5 blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-[#D4A853]/8 blur-[100px]" />
        {/* Decorative lines */}
        <div className="absolute top-0 right-20 w-px h-full bg-gradient-to-b from-transparent via-[#D4A853]/10 to-transparent" />
        <div className="absolute bottom-0 left-20 w-px h-48 bg-gradient-to-t from-transparent via-[#D4A853]/15 to-transparent" />

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#D4A853]/20 bg-[#D4A853]/10 backdrop-blur-sm">
              <span className="text-[#D4A853] text-2xl font-display font-bold">B</span>
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-[#E2D8CC]">BarResto</h1>
              <p className="text-sm text-lounge-300 -mt-0.5">Manager</p>
            </div>
          </div>

          <h2 className="font-display text-5xl font-bold text-[#F0EBE3] leading-[1.15] mb-6">
            Pilotez votre<br />
            bar avec<br />
            <span className="text-[#D4A853]">élégance</span>
          </h2>
          <p className="text-base text-lounge-300 mt-8 max-w-md leading-relaxed">
            Commandes, stock, finances et personnel — tout converge en un seul espace.
            Pensé pour les bars d'Afrique.
          </p>

          {/* Stats */}
          <div className="mt-14 flex gap-10">
            {[
              { num: "3", label: "Rôles" },
              { num: "8", label: "Modules" },
              { num: "24/7", label: "Disponible" },
            ].map((stat) => (
              <div key={stat.label} className="relative">
                <p className="text-3xl font-display font-bold text-[#D4A853]">{stat.num}</p>
                <p className="text-xs text-lounge-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Right — Login Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-12 lg:mb-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl border border-[#D4A853]/20 bg-[#D4A853]/10 lg:hidden">
              <span className="text-[#D4A853] text-xl font-display font-bold">B</span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[#F0EBE3]">Connexion</h1>
              <p className="text-sm text-lounge-300">Accédez à votre espace</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
            >
              <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-lounge-200 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lounge-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="h-12 w-full rounded-xl border border-lounge-600/50 bg-lounge-900/50 pl-11 pr-4 text-sm text-lounge-100 placeholder:text-lounge-500 focus:border-[#D4A853]/40 focus:outline-none focus:ring-1 focus:ring-[#D4A853]/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-lounge-200 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lounge-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-lounge-600/50 bg-lounge-900/50 pl-11 pr-12 text-sm text-lounge-100 placeholder:text-lounge-500 focus:border-[#D4A853]/40 focus:outline-none focus:ring-1 focus:ring-[#D4A853]/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-lounge-400 hover:text-lounge-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#C49742] text-lounge-950 font-bold text-sm hover:from-[#DDBA6A] hover:to-[#D4A853] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#D4A853]/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                  </svg>
                  Connexion...
                </span>
              ) : "Se connecter"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}