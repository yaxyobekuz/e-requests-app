import { useParams, useNavigate, NavLink, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminsAPI } from "@/shared/api";
import { ArrowLeft } from "lucide-react";
import Button from "@/shared/components/ui/button/Button";
import { TABS } from "../data/admin-management.data";

/**
 * Admin tafsilot sahifasi — layout (header + tab navigatsiya + Outlet).
 * Admin ma'lumotlarini fetch qilib, barcha tab komponentlariga context orqali uzatadi.
 * @returns {JSX.Element}
 */
const AdminDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: admin, isLoading } = useQuery({
    queryKey: ["admins", id],
    queryFn: () => adminsAPI.getById(id).then((res) => res.data),
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

  if (!admin) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Admin topilmadi</p>
        <Button onClick={() => navigate("/admins")} variant="link" className="mt-4 text-sm">
          Adminlarga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button onClick={() => navigate("/admins")} variant="ghost" className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{admin.alias || admin.firstName || "Admin"}</h1>
          <p className="text-sm text-gray-500">{admin.phone}</p>
        </div>
        <span
          className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            admin.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {admin.isActive ? "Faol" : "Nofaol"}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b overflow-x-auto">
        {TABS.map((tab) => (
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
      <Outlet context={{ admin }} key={admin._id} />
    </div>
  );
};

export default AdminDetailPage;
