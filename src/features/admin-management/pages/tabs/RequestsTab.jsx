import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requestTypesAPI, adminsAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import ModulePermissionCard from "../../components/ModulePermissionCard";
import { buildPermissionsPayload } from "../../utils/permissions.util";

/**
 * Admin murojaat turlari ruxsatlarini tahrirlash tab komponenti.
 * @returns {JSX.Element}
 */
const RequestsTab = () => {
  const currentUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const isCurrentUserOwner = currentUser.role === "owner";
  const isDelegatedManager = !isCurrentUserOwner && currentUser.canManageAdmins === true;

  const { admin } = useOutletContext();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: requestTypes = [] } = useQuery({
    queryKey: ["requestTypes"],
    queryFn: () => requestTypesAPI.getAll().then((r) => r.data),
  });

  const [access, setAccess] = useState(admin.permissions?.requests?.access ?? "off");
  const [allowedTypes, setAllowedTypes] = useState(
    (admin.permissions?.requests?.allowedTypes || []).map((t) => t._id || t)
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const permissions = buildPermissionsPayload(admin, "requests", { access, allowedTypes });
      await adminsAPI.updatePermissions(admin._id, { permissions });
      queryClient.invalidateQueries({ queryKey: ["admins", admin._id] });
      toast.success("Murojaat ruxsatlari saqlandi!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const callerAccess = isDelegatedManager ? (currentUser.permissions?.requests?.access ?? "off") : undefined;
  const callerAllowedIds = isDelegatedManager ? (currentUser.permissions?.requests?.allowedTypes || []) : undefined;

  return (
    <div className="max-w-2xl space-y-6">
      <ModulePermissionCard
        title="Murojaatlar"
        access={access}
        onAccessChange={setAccess}
        items={requestTypes}
        selectedIds={allowedTypes}
        onSelectedChange={setAllowedTypes}
        itemLabel="Murojaat turlari"
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

export default RequestsTab;
