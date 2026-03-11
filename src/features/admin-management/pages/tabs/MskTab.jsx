import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mskAPI, adminsAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import ModulePermissionCard from "../../components/ModulePermissionCard";
import { buildPermissionsPayload } from "../../utils/permissions.util";

/**
 * Admin MSK buyurtma ruxsatlarini tahrirlash tab komponenti.
 * @returns {JSX.Element}
 */
const MskTab = () => {
  const currentUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const isCurrentUserOwner = currentUser.role === "owner";
  const isDelegatedManager = !isCurrentUserOwner && currentUser.canManageAdmins === true;

  const { admin } = useOutletContext();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: mskCategories = [] } = useQuery({
    queryKey: ["mskCategories"],
    queryFn: () => mskAPI.getCategories().then((r) => r.data),
  });

  const [access, setAccess] = useState(admin.permissions?.msk?.access ?? "off");
  const [allowedCategories, setAllowedCategories] = useState(
    (admin.permissions?.msk?.allowedCategories || []).map((c) => c._id || c)
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const permissions = buildPermissionsPayload(admin, "msk", { access, allowedCategories });
      await adminsAPI.updatePermissions(admin._id, { permissions });
      queryClient.invalidateQueries({ queryKey: ["admins", admin._id] });
      toast.success("MSK ruxsatlari saqlandi!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const callerAccess = isDelegatedManager ? (currentUser.permissions?.msk?.access ?? "off") : undefined;
  const callerAllowedIds = isDelegatedManager ? (currentUser.permissions?.msk?.allowedCategories || []) : undefined;

  return (
    <div className="max-w-2xl space-y-6">
      <ModulePermissionCard
        title="MSK buyurtmalar"
        access={access}
        onAccessChange={setAccess}
        items={mskCategories}
        selectedIds={allowedCategories}
        onSelectedChange={setAllowedCategories}
        itemLabel="Kategoriyalar"
        showIcons
        callerAccess={callerAccess}
        callerAllowedIds={callerAllowedIds}
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
};

export default MskTab;
