import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./components/dashboard/Sidebar";
import { useAuth } from "./components/dashboard/AuthContext";
import { Toaster } from "sonner";

function App() {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Loading Support Ops Tracker...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
      <main className={`min-h-screen bg-slate-50 transition-[margin-left] duration-200 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <Outlet />
      </main>
    </>
  );
}

export default App;