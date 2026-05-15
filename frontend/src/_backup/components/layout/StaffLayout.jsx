import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Armchair,
  ClipboardList,
  Utensils,
  GlassWater,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

export function StaffLayout() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Mon Tableau", to: "/staff", icon: LayoutDashboard },
    { label: "Salles & Tables", to: "/staff/tables", icon: Armchair },
    { label: "Commandes", to: "/staff/commandes", icon: ClipboardList },
    { label: "Bar Display", to: "/staff/bar", icon: GlassWater },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 flex flex-col"
      >
        {/* Logo */}
        <div className="flex h-[72px] items-center justify-between px-4 border-b border-gray-100">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
                  <Utensils size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">BarResto</p>
                  <p className="text-[10px] text-emerald-600/70 -mt-0.5">Staff</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/staff"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <item.icon size={18} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 p-3">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-2 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">
                  {user?.avatar || "S"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{user?.prenom} {user?.nom}</p>
                  <p className="text-[10px] text-gray-400">{user?.poste}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
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

      {/* Main */}
      <motion.div
        initial={false}
        animate={{ marginLeft: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <main className="min-h-screen">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}
