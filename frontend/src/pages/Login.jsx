import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppStore } from "../store/appStore";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";

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
    <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-zinc-950 text-zinc-50 font-body selection:bg-brand-500/20 selection:text-brand-500">
      {/* Left — Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center px-16"
      >
        {/* Animated background layers */}
        <div className="absolute inset-0 bg-zinc-950" />
        <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] rounded-full bg-brand-500/5 blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-brand-500/10 blur-[100px]" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-md shadow-[0_0_15px_rgba(212,168,83,0.15)]">
              <Shield size={24} className="text-brand-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white">BarResto</h1>
              <p className="text-sm font-medium text-zinc-400 tracking-widest uppercase">System</p>
            </div>
          </div>

          <h2 className="font-display text-5xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Pilotez votre <br />
            établissement <br />
            avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">précision</span>
          </h2>
          <p className="text-lg text-zinc-400 mt-6 max-w-md leading-relaxed">
            Une interface repensée pour vous offrir le contrôle absolu sur vos commandes, votre stock et vos finances.
          </p>

          {/* Stats */}
          <div className="mt-14 flex gap-12">
            {[
              { num: "3", label: "Rôles" },
              { num: "8", label: "Modules" },
              { num: "24/7", label: "Disponible" },
            ].map((stat) => (
              <div key={stat.label} className="relative">
                <p className="text-3xl font-display font-bold text-white">{stat.num}</p>
                <p className="text-sm text-zinc-500 mt-1 font-medium">{stat.label}</p>
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
        className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16 relative"
      >
        <div className="absolute inset-0 lg:hidden bg-zinc-950">
           <div className="absolute top-1/4 -right-20 w-[300px] h-[300px] rounded-full bg-brand-500/10 blur-[100px]" />
        </div>
        
        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-4 mb-10 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-md shadow-[0_0_15px_rgba(212,168,83,0.15)]">
              <Shield size={20} className="text-brand-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white">BarResto</h1>
              <p className="text-xs font-medium text-zinc-400 tracking-widest uppercase">System</p>
            </div>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold text-white tracking-tight">Connexion</h2>
            <p className="text-zinc-400 mt-1">Accédez à votre tableau de bord</p>
          </div>
          
          <div className="mb-8 lg:hidden">
            <h2 className="text-2xl font-bold text-white tracking-tight">Bienvenue</h2>
            <p className="text-zinc-400 mt-1">Connectez-vous pour continuer</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-sm text-red-400 font-medium"
            >
              <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Adresse e-mail</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nom@exemple.com"
                  className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Mot de passe</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-11 pr-12 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-brand-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 rounded-lg bg-brand-500 text-black font-bold text-sm hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(212,168,83,0.3)] hover:shadow-[0_0_25px_rgba(212,168,83,0.5)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                  </svg>
                  Connexion en cours...
                </span>
              ) : "Se connecter"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}