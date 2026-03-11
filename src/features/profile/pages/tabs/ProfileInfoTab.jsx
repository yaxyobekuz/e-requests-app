import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin, ShieldCheck, UserCircle } from "lucide-react";
import { profileAPI } from "../../api";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import { REGION_TYPE_LABELS } from "../../data/profile.data";

/**
 * Joriy foydalanuvchining asosiy ma'lumotlarini tahrirlash tab komponenti.
 * @returns {JSX.Element}
 */
const ProfileInfoTab = () => {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    alias: user?.alias || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await profileAPI.updateMe(form);
      const stored = JSON.parse(localStorage.getItem("admin_user") || "{}");
      localStorage.setItem("admin_user", JSON.stringify({ ...stored, ...res.data }));
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      toast.success("Ma'lumotlar saqlandi!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white border rounded-xl p-5 space-y-4">
        {/* Avatar + ism + telefon */}
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-7 h-7 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">
              {user?.alias || user?.firstName || "Admin"}
            </p>
            <p className="text-sm text-gray-500">{user?.phone}</p>
          </div>
          {user?.adminRole && (
            <span className="ml-auto text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-medium flex-shrink-0">
              {user.adminRole.name}
            </span>
          )}
        </div>

        {/* Admin yaratish huquqi badge */}
        {user?.canManageAdmins && (
          <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-800 px-3 py-2 rounded-lg">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>Sizda admin yaratish huquqi mavjud</span>
          </div>
        )}

        {/* Hudud */}
        {user?.assignedRegion?.region && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>
              {REGION_TYPE_LABELS[user.assignedRegion.regionType] || "Hudud"}:{" "}
              <span className="font-medium">{user.assignedRegion.region.name}</span>
            </span>
          </div>
        )}

        <hr className="border-gray-100" />

        {/* Tahrirlash forması */}
        <div>
          <label className="block text-sm font-medium mb-1">Tahallus</label>
          <Input
            type="text"
            value={form.alias}
            onChange={(e) => setForm((p) => ({ ...p, alias: e.target.value }))}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Ism</label>
            <Input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Familiya</label>
            <Input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoTab;
