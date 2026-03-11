import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminsAPI } from "@/shared/api";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import { Plus } from "lucide-react";
import Button from "@/shared/components/ui/button/Button";
import CreateAdminForm from "../components/CreateAdminForm";

const REGION_TYPE_LABELS = { region: "Viloyat", district: "Tuman", neighborhood: "Mahalla", street: "Ko'cha" };

const AdminsPage = () => {
  const dispatch = useDispatch();

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: () => adminsAPI.getAll().then((res) => res.data),
  });

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

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tahallus</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Ism</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Lavozim</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Telefon</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Hududlar</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Holat</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {admins.map((admin) => (
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
        {admins.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">Adminlar yo'q</div>
        )}
      </div>

      <ModalWrapper name="createAdmin" title="Yangi admin yaratish">
        <CreateAdminForm />
      </ModalWrapper>
    </div>
  );
};

export default AdminsPage;

