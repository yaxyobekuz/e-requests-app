import { Link } from "react-router-dom";
import {
  FileText,
  AlertTriangle,
  Package,
  Users,
} from "lucide-react";

const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
const canManageAdmins = user.canManageAdmins === true;

/**
 * Quick link card
 * @param {string} to - Link manzili
 * @param {string} title - Karta sarlavhasi
 * @param {string} description - Karta tavsifi
 * @param {React.ReactNode} icon - Icon komponenti
 * @param {string} color - Tailwind rang klasslari
 */
const QuickLinkCard = ({ to, title, description, icon, color }) => (
  <Link
    to={to}
    className="bg-white rounded-2xl border p-6 hover:shadow-lg transition-shadow"
  >
    <div className="flex items-start gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  </Link>
);

const DashboardPage = () => {
  const permissions = user.permissions || {};

  const hasModuleAccess = (module) => {
    if (user.role !== "admin") return false;
    return permissions[module]?.access !== "off";
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Xush kelibsiz, {user.firstName || user.alias || "Admin"}!
        </h1>
        <p className="text-gray-500 mt-2">Tayinlangan hudud boshqaruvi</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hasModuleAccess("requests") && (
          <QuickLinkCard
            to="/requests"
            title="Murojaatlar"
            description="Fuqarolarning murojaatlarini ko'rish va boshqarish"
            icon={<FileText className="w-6 h-6" />}
            color="bg-blue-50 text-blue-600"
          />
        )}

        {hasModuleAccess("services") && (
          <QuickLinkCard
            to="/service-reports"
            title="Xizmat arizalari"
            description="Kommunal xizmatlar bo'yicha muammolar"
            icon={<AlertTriangle className="w-6 h-6" />}
            color="bg-orange-50 text-orange-600"
          />
        )}

        {hasModuleAccess("msk") && (
          <QuickLinkCard
            to="/msk/orders"
            title="MSK buyurtmalar"
            description="Mahalla shaxmat klubi buyurtmalarini boshqarish"
            icon={<Package className="w-6 h-6" />}
            color="bg-purple-50 text-purple-600"
          />
        )}

        {canManageAdmins && (
          <QuickLinkCard
            to="/admins"
            title="Adminlar"
            description="Tizim adminlarini boshqarish"
            icon={<Users className="w-6 h-6" />}
            color="bg-green-50 text-green-600"
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
