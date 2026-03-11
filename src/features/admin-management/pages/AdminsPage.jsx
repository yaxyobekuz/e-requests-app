import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { Plus, X } from "lucide-react";
import { adminsAPI } from "@/shared/api";
import { open } from "@/features/modal/store/modal.slice";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import Button from "@/shared/components/ui/button/Button";
import CreateAdminForm from "../components/CreateAdminForm";

const REGION_TYPE_LABELS = { region: "Viloyat", district: "Tuman", neighborhood: "Mahalla", street: "Ko'cha" };

const AdminsPage = () => {
  const dispatch = useDispatch();
  const [filterRole, setFilterRole] = useState("");
  const [filterRegion, setFilterRegion] = useState("");

  const { data: allAdmins = [], isLoading } = useQuery({
    queryKey: ["admins", "tree"],
    queryFn: () => adminsAPI.getTree().then((res) => res.data),
  });

  const roles = useMemo(() => {
    const seen = new Map();
    for (const a of allAdmins) {
      if (a.adminRole && !seen.has(a.adminRole._id)) {
        seen.set(a.adminRole._id, a.adminRole);
      }
    }
    return [...seen.values()];
  }, [allAdmins]);

  const regions = useMemo(() => {
    const seen = new Map();
    for (const a of allAdmins) {
      const r = a.assignedRegion?.region;
      if (r && !seen.has(r._id)) {
        seen.set(r._id, r);
      }
    }
    return [...seen.values()];
  }, [allAdmins]);

  const filtered = useMemo(
    () =>
      allAdmins.filter((a) => {
        if (filterRole && a.adminRole?._id !== filterRole) return false;
        if (filterRegion && a.assignedRegion?.region?._id !== filterRegion) return false;
        return true;
      }),
    [allAdmins, filterRole, filterRegion],
  );

  const hasFilter = filterRole || filterRegion;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Adminlar</h1>
          <p className="text-sm text-gray-500">Adminlarni boshqarish</p>
        </div>
        <Button
          onClick={() => dispatch(open({ modal: "createAdmin" }))}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yangi admin
        </Button>
      </div>

      {/* Filtrlar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Barcha lavozimlar</option>
          {roles.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>

        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Barcha hududlar</option>
          {regions.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>

        {hasFilter && (
          <button
            onClick={() => { setFilterRole(""); setFilterRegion(""); }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="w-3.5 h-3.5" />
            Tozalash
          </button>
        )}

        <span className="text-sm text-gray-400 ml-auto">
          {filtered.length} ta admin
        </span>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tahallus</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Ism</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Lavozim</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Telefon</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Hududlar</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tayinlovchi</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Holat</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((admin) => (
              <tr key={admin._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{admin.alias}</td>
                <td className="px-4 py-3 text-sm">{admin.firstName} {admin.lastName}</td>
                <td className="px-4 py-3 text-sm">
                  {admin.adminRole?.name ? (
                    <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
                      {admin.adminRole.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{admin.phone}</td>
                <td className="px-4 py-3 text-sm">
                  {admin.assignedRegion ? (
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                      {admin.assignedRegion.region?.name || "—"}
                      <span className="text-blue-400 ml-0.5">
                        [{REGION_TYPE_LABELS[admin.assignedRegion.regionType] || admin.assignedRegion.regionType}]
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Belgilanmagan</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {admin.createdBy
                    ? admin.createdBy.alias || admin.createdBy.firstName || "—"
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${admin.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {admin.isActive ? "Faol" : "Nofaol"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/admins/${admin._id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Batafsil
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            {hasFilter ? "Filtr bo'yicha adminlar topilmadi" : "Adminlar yo'q"}
          </div>
        )}
      </div>

      <ModalWrapper name="createAdmin" title="Yangi admin yaratish">
        <CreateAdminForm />
      </ModalWrapper>
    </div>
  );
};

export default AdminsPage;
