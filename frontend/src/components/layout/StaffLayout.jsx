import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Armchair, ClipboardList, Utensils,
  ChevronLeft, ChevronRight, LogOut,
} from "lucide-react";

export function StaffLayout() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  const navItems = [
    { to: "/staff", icon: LayoutDashboard, label: "Tableau" },
    { to: "/staff/tables", icon: Armchair, label: "Salles" },
    { to: "/staff/commandes", icon: ClipboardList, label: "Commandes" },
  ];

  const role = user?.role;
  if (!role || role === "admin" || role === "manager" || role === "serveur" || role === "caissier" || role === "cuisinier") {
    navItems.push({ to: "/staff/kitchen", icon: Utensils, label: "Cuisine" });
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex">
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed left-0 top-0 z-40 h-[100dvh] bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
      >
        <div className="flex h-[72px] items-center justify-between px-4 border-b border-white/5">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20 shadow-[0_0_10px_rgba(212,168,83,0.1)]">
                  <Utensils size={18} className="text-brand-500" />
                </div>
                <div>
                  <p className="text-base font-display font-bold text-zinc-50 tracking-wide">BarResto</p>
                  <p className="text-[10px] text-brand-500 uppercase tracking-widest -mt-1 font-semibold">Staff</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-white/5 transition-colors">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/staff"}>
              {({ isActive }) => (
                <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand-500/10 text-brand-500 shadow-[inset_2px_0_0_rgba(212,168,83,1)]"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                }`}>
                  <item.icon size={18} className={`shrink-0 ${isActive ? "text-brand-500" : "text-zinc-500"}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15 }} className="overflow-hidden whitespace-nowrap">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 p-4 bg-zinc-950/50">
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 mb-3 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-black font-bold text-sm shadow-[0_0_10px_rgba(212,168,83,0.3)]">
                  {user?.avatar || "S"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-100 truncate">{user?.prenom} {user?.nom}</p>
                  <p className="text-xs text-zinc-500 truncate">{user?.poste}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full justify-center rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20">
            <LogOut size={16} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate font-medium">
                  Déconnexion
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      <motion.div
        initial={false}
        animate={{ marginLeft: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex-1 flex flex-col"
      >
        <main className="flex-1 min-h-[100dvh] relative p-6 md:p-8"><Outlet /></main>
      </motion.div>
    </div>
  );
}