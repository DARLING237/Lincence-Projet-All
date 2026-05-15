import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "./store/appStore";
import { LoginPage } from "./pages/Login";
import { ChangePassword } from "./pages/ChangePassword";
import { AdminLayout } from "./components/layout/AdminLayout";
import { StaffLayout } from "./components/layout/StaffLayout";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StaffDashboard } from "./pages/StaffDashboard";
import { ClientQRPage } from "./pages/ClientQR";
import { Finances } from "./pages/Finances";
import { Rapports } from "./pages/Rapports";
import { Personnel } from "./pages/Personnel";
import { Stock } from "./pages/Stock";
import { MenuAdmin } from "./pages/MenuAdmin";
import { QRCodes } from "./pages/QRCodes";
import { StaffTables } from "./pages/StaffTables";
import { StaffCommandes } from "./pages/StaffCommandes";
import { StaffPlaceholder } from "./pages/StaffPlaceholders";

import { StaffBar } from "./pages/StaffBar";

// ── Route guards ──
function RequireAuth({ role, redirectPath = "/login", children }) {
  const user = useAppStore((s) => s.user);
  if (!user) return <Navigate to={redirectPath} replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/staff"} replace />;
  }
  return children;
}

function App() {
  const user = useAppStore((s) => s.user);
  const heartbeat = useAppStore((s) => s.heartbeat);
  const fetchPersonnel = useAppStore((s) => s.fetchPersonnel);

  // Heartbeat — indique que l'utilisateur est connecte
  useEffect(() => {
    if (user) {
      heartbeat();
      const interval = setInterval(heartbeat, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.id]); // ne restart que si l'utilisateur change

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Login ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* ── Admin Routes ── */}
        <Route
          path="/admin/*"
          element={
            <RequireAuth role="admin">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="finances" element={<Finances />} />
          <Route path="rapports" element={<Rapports />} />
          <Route path="personnel" element={<Personnel />} />
          <Route path="stock" element={<Stock />} />
          <Route path="menu" element={<MenuAdmin />} />
          <Route path="qrcodes" element={<QRCodes />} />
        </Route>

        {/* ── Staff Routes ── */}
        <Route
          path="/staff/*"
          element={
            <RequireAuth>
              <StaffLayout />
            </RequireAuth>
          }
        >
          <Route index element={<StaffDashboard />} />
          <Route path="tables" element={<StaffTables />} />
          <Route path="commandes" element={<StaffCommandes />} />
          <Route path="kitchen" element={<Navigate to="/staff" replace />} />
          <Route path="bar" element={<StaffBar />} />
        </Route>

        {/* ── Client QR (no auth needed) ── */}
        <Route path="/qr/:tableId" element={<ClientQRPage />} />

        {/* ── Default redirect ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
