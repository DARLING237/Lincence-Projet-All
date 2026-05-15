import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Armchair, ClipboardList, Utensils, GlassWater,
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
    { to: "/staff/bar", icon: GlassWater, label: "Bar" },
  ];

  return (
    <div className="min-h-screen bg-[#0C0A09]">
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed left-0 top-0 z-40 h-screen bg-[#1A1714] border-r border-[#D4A853]/8 flex flex-col"
      >
        <div className="flex h-[72px] items-center justify-between px-4 border-b border-[#D4A853]/8">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D4A853]/30 bg-[#D4A853]/10">
                  <Utensils size={16} className="text-[#D4A853]" />
                </div>
                <div>
                  <p className="text-sm font-display font-bold text-[#E2D8CC]">BarResto</p>
                  <p className="text-[10px] text-[#D4A853]/60 -mt-0.5">Staff</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lounge-400 hover:text-[#D4A853]/60 hover:bg-white/5 transition-colors">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/staff"}>
              {({ isActive }) => (
                <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/10"
                    : "text-lounge-400 hover:text-lounge-200 hover:bg-white/5"
                }`}>
                  <item.icon size={17} className={`shrink-0 ${isActive ? "text-[#D4A853]" : "text-lounge-500"}`} />
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

        <div className="border-t border-[#D4A853]/8 p-3">
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-2 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D4A853]/20 bg-[#D4A853]/10 text-xs font-bold text-[#D4A853]">
                  {user?.avatar || "S"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#E2D8CC] truncate">{user?.prenom} {user?.nom}</p>
                  <p className="text-[10px] text-lounge-400">{user?.poste}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-lounge-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut size={16} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
                  D&eacute;connexion
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
      >
        <main className="min-h-screen"><Outlet /></main>
      </motion.div>
    </div>
  );
}