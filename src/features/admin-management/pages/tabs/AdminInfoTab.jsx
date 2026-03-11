import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, UserCheck } from "lucide-react";
import { Switch } from "@/shared/components/shadcn/switch";
import { adminsAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import InputPwd from "@/shared/components/ui/input/InputPwd";

const AdminInfoTab = () => {
  const currentUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const isCurrentUserOwner = currentUser.role === "owner";
  const isDelegatedManager = !isCurrentUserOwner && currentUser.canManageAdmins === true;
  const { admin } = useOutletContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [delegationSaving, setDelegationSaving] = useState(false);

  const [form, setForm] = useState({
    alias: admin.alias || "",
    firstName: admin.firstName || "",
    lastName: admin.lastName || "",
    isActive: admin.isActive !== false,
    password: "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      await adminsAPI.update(admin._id, data);
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin yangilandi!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Adminni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await adminsAPI.delete(admin._id);
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin o'chirildi!");
      navigate("/admins");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelegationToggle = async (checked) => {
    setDelegationSaving(true);
    try {
      await adminsAPI.updateDelegation(admin._id, { canManageAdmins: checked });
      queryClient.invalidateQueries({ queryKey: ["admins", admin._id] });
      toast.success(checked ? "Delegatsiya yoqildi!" : "Delegatsiya o'chirildi!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setDelegationSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold">Asosiy ma'lumotlar</h3>
        {admin.adminRole && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Lavozim:</span>
            <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-medium">
              {admin.adminRole.name}
            </span>
            {admin.adminRole.description && (
              <span className="text-xs text-gray-400">{admin.adminRole.description}</span>
            )}
          </div>
        )}
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
        <div>
          <label className="block text-sm font-medium mb-1">Yangi parol (ixtiyoriy)</label>
          <InputPwd
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="Bo'sh qoldiring agar o'zgartirmasa"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={form.isActive}
            onCheckedChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
          />
          <span className="text-sm">Faol</span>
        </div>
      </div>

      {/* Tayinlovchi */}
      {admin.createdBy && (
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Tayinlovchi (kim tomonidan yaratilgan)</p>
              <p className="font-medium text-sm truncate">
                {admin.createdBy.alias || admin.createdBy.firstName || "—"}
              </p>
              <p className="text-xs text-gray-400">{admin.createdBy.phone}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delegatsiya (owner yoki delegatsiya huquqi bor admin ko'radi) */}
      {(isCurrentUserOwner || isDelegatedManager) && (
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Admin yaratish huquqi</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Bu admin o'z ruxsatlari doirasida boshqa adminlar yarata oladi
              </p>
            </div>
            <Switch
              checked={!!admin.canManageAdmins}
              onCheckedChange={handleDelegationToggle}
              disabled={delegationSaving}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          onClick={handleDelete}
          variant="ghost"
          className="flex items-center gap-2 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
          Adminni o'chirish
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
};

export default AdminInfoTab;
