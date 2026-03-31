import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { profileAPI } from "../api";
import { PROFILE_TABS } from "../data/profile.data";
import Button from "@/shared/components/ui/button/Button";

/**
 * Profil sahifasi — layout (header + tab navigatsiya + Outlet).
 * Joriy foydalanuvchi ma'lumotlarini fetch qilib, barcha tab komponentlariga context orqali uzatadi.
 * @returns {JSX.Element}
 */
const ProfilePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/login");
  };

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileAPI.getMe().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profil</h1>
          <p className="text-sm text-gray-500 mt-1">
            Shaxsiy ma'lumotlaringiz va ruxsatlaringiz
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="text-red-600 border-red-200 hover:bg-red-50 gap-2 flex-shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b overflow-x-auto">
        {PROFILE_TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* Tab Content */}
      <Outlet context={{ user }} key={user?._id} />
    </div>
  );
};

export default ProfilePage;
