import { NavLink, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Wrench,
  AlertTriangle,
  MapPin,
  LogOut,
  FolderKanban,
  Tags,
  SlidersHorizontal,
  Briefcase,
  UserCircle,
} from "lucide-react";
import { logo } from "@/shared/assets/images";
import Button from "@/shared/components/ui/button/Button";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const isOwner = user.role === "owner";
  const canManageAdmins = isOwner || user.canManageAdmins === true;
  const permissions = user.permissions || {};

  const hasModuleAccess = (module) => {
    if (isOwner) return true;
    if (user.role !== "admin") return false;
    return permissions[module]?.access !== "off";
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
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
    { to: "/admin-roles", label: "Lavozimlar", icon: Briefcase, show: isOwner },
    { to: "/services", label: "Servislar", icon: Settings, show: isOwner },
    {
      to: "/request-types",
      label: "Murojaat turlari",
      icon: Tags,
      show: isOwner,
    },
    {
      to: "/msk/categories",
      label: "MSK kategoriyalar",
      icon: Wrench,
      show: isOwner,
    },
    { to: "/regions", label: "Hududlar", icon: MapPin, show: isOwner },
    {
      to: "/settings",
      label: "Sozlamalar",
      icon: SlidersHorizontal,
      show: isOwner,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen sticky inset-y-0 left-0 bg-white border-r flex flex-col">
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
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to !== "/regions"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
      </nav>

      <div className="p-3 border-t space-y-1">
        {/* Profil */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
            }`
          }
        >
          <UserCircle className="w-4 h-4 flex-shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-medium leading-tight">
              {user.alias || user.firstName || "Admin"}
            </p>
            <p className="text-xs text-gray-400 capitalize leading-tight">{user.role}</p>
          </div>
        </NavLink>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="flex items-center gap-3 w-full text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </Button>
      </div>
    </aside>
  );
};

export default AdminLayout;
