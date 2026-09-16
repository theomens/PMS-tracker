import { NavLink, useNavigate } from "react-router-dom";
import { Activity, BarChart3, ChevronDown, ChevronsLeft, ClipboardList, Home, LogOut, Settings, ShieldCheck, User } from "lucide-react";
import { useAuth } from "./AuthContext";

interface SidebarLink {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const links: SidebarLink[] = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Activities", path: "/activities", icon: Activity },
  { label: "Daily Log", path: "/daily-log", icon: ClipboardList },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-950 text-slate-300 transition-[width] duration-200 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
          <ShieldCheck size={22} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold tracking-wide text-white">PSM</h1>
            <p className="truncate text-[11px] text-slate-500">Support Team</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className="absolute -right-3 top-17 cursor-pointer flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-400 shadow-md transition-colors hover:bg-slate-800 hover:text-white"
      >
        <ChevronsLeft
          size={14}
          className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
        />
      </button>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Workspace
          </p>
        )}

        {links.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={19} strokeWidth={isActive ? 2.4 : 2} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}

        <div className="my-6 border-t border-white/10" />

        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Account
          </p>
        )}

        <NavLink
          to="/profile"
          title={collapsed ? "Profile" : undefined}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
              collapsed ? "justify-center" : ""
            } ${isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`
          }
        >
          <User size={19} className="shrink-0" />
          {!collapsed && "Profile"}
        </NavLink>

        <NavLink
          to="/settings"
          title={collapsed ? "Settings" : undefined}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
              collapsed ? "justify-center" : ""
            } ${isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`
          }
        >
          <Settings size={19} className="shrink-0" />
          {!collapsed && "Settings"}
        </NavLink>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div
          className={`flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
            {user ? getInitials(user.name) : "--"}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name ?? "Not signed in"}
                </p>
                <p className="truncate text-[11px] text-slate-500">{user?.email ?? ""}</p>
              </div>
              <button
                type="button"
                aria-label="Open profile menu"
                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronDown size={16} />
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          title={collapsed ? "Sign out" : undefined}
          className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </aside>
  );
}
