import { useState } from "react";
import { toast } from "sonner";
import { profileAPI } from "../../api";
import Button from "@/shared/components/ui/button/Button";
import InputPwd from "@/shared/components/ui/input/InputPwd";

/**
 * Joriy foydalanuvchining parolini o'zgartirish tab komponenti.
 * @returns {JSX.Element}
 */
const ProfilePasswordTab = () => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Yangi parollar mos kelmadi");
      return;
    }
    setSaving(true);
    try {
      await profileAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Parol muvaffaqiyatli o'zgartirildi!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold">Parolni o'zgartirish</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Joriy parol</label>
          <InputPwd
            value={form.currentPassword}
            onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
            placeholder="Joriy parolni kiriting"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Yangi parol</label>
          <InputPwd
            value={form.newPassword}
            onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
            placeholder="Yangi parolni kiriting"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Yangi parolni tasdiqlang</label>
          <InputPwd
            value={form.confirmPassword}
            onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            placeholder="Yangi parolni qayta kiriting"
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving || !form.currentPassword || !form.newPassword || !form.confirmPassword}
          >
            {saving ? "O'zgartirilmoqda..." : "Parolni o'zgartirish"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePasswordTab;
