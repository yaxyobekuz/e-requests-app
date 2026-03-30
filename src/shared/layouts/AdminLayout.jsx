import {
  Tags,
  Users,
  Wrench,
  MapPin,
  Settings,
  FileText,
  Briefcase,
  UserCircle,
  FolderKanban,
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  SlidersHorizontal,
} from "lucide-react";

// Utils
import { cn } from "../utils/cn";

// Images
import { logo } from "@/shared/assets/images";

// API
import { authAPI } from "@/features/auth/api";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { NavLink, Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      {/* Sidebar */}
      <Sidebar />

      {/* Outlet(Main) */}
      <main className="flex-1 min-h-screen relative z-10">
        <Outlet />
      </main>

      {/* Background Patterns */}
      <BackgroundPatterns />
    </div>
  );
};

const Sidebar = () => {
  const { data: user = {} } = useQuery({
    queryKey: ["auth", "me"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => authAPI.getMe().then((res) => res.data),
  });

  const isOwner = user.role === "owner";
  const permissions = user.permissions || {};
  const canManageAdmins = isOwner || user.canManageAdmins === true;

  const hasModuleAccess = (module) => {
    if (isOwner) return true;
    if (user.role !== "admin") return false;
    return permissions[module]?.access !== "off";
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { to: "/statistics", label: "Statistika", icon: BarChart3, show: true },
    { isDivider: true, show: true },
    {
      to: "/requests",
      label: "Murojaatlar",
      icon: FileText,
      show: hasModuleAccess("requests"),
    },
    {
      to: "/service-reports",
      label: "Xizmat arizalari",
      icon: AlertTriangle,
      show: hasModuleAccess("services"),
    },
    {
      to: "/msk/orders",
      label: "MSK buyurtmalar",
      icon: FolderKanban,
      show: hasModuleAccess("msk"),
    },
    { isDivider: true, show: true },
    { to: "/admins", label: "Adminlar", icon: Users, show: canManageAdmins },
  ];

  return (
    <div className="relative w-64 h-auto">
      <aside className="flex flex-col w-full h-svh sticky top-0 left-0 z-20 bg-white/60 backdrop-blur-xl border-r border-white/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 py-3 border-b">
          <img
            width={32}
            height={32}
            src={logo}
            alt="e-Murojaat logo"
            className="size-8"
          />
          <p className="font-bold text-lg">e-Murojaat</p>
        </div>

        {/* Main (Nav items) */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems
            .filter((item) => item.show)
            .map((item, idx) => {
              if (item.isDivider) {
                return (
                  <hr
                    key={`divider-${idx}`}
                    className="mx-2 border-t border-gray-200"
                  />
                );
              }

              return (
                <NavItem
                  to={item.to}
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  end={item.to !== "/regions"}
                />
              );
            })}
        </nav>

        {/* Footer */}
        <SidebarFooter user={user} />
      </aside>
    </div>
  );
};

const SidebarFooter = ({ user }) => {
  return (
    <div className="p-3 border-t">
      {/* Profil */}
      <NavItem
        to="/profile"
        icon={UserCircle}
        label={user.alias || user.firstName || "Admin"}
      />
    </div>
  );
};

const NavItem = ({ to, label, end = true, ...rest }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-600 hover:bg-gray-50",
      )
    }
  >
    {({ isActive }) => (
      <>
        <rest.icon
          strokeWidth={1.5}
          className={cn(
            "size-5 transition-all duration-300",
            isActive
              ? "text-blue-600 scale-110 rotate-0"
              : "text-gray-400 scale-90 rotate-[360deg]",
          )}
        />
        {label}
      </>
    )}
  </NavLink>
);

const BackgroundPatterns = () => (
  <>
    <div className="fixed inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
    <div className="fixed left-0 right-0 top-[-10%] z-0 m-auto h-[300px] w-[300px] rounded-full bg-blue-500 opacity-20 blur-[100px]" />
    <div className="fixed bottom-[-10%] left-[-10%] z-0 h-[300px] w-[300px] rounded-full bg-indigo-500 opacity-20 blur-[100px]" />
    <div className="fixed top-[20%] right-[-5%] z-0 h-[250px] w-[250px] rounded-full bg-purple-500 opacity-20 blur-[100px]" />
  </>
);

export default AdminLayout;
