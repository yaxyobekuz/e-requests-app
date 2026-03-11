import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { servicesAPI, adminsAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import ModulePermissionCard from "../../components/ModulePermissionCard";
import { buildPermissionsPayload } from "../../utils/permissions.util";

/**
 * Admin servis ruxsatlarini tahrirlash tab komponenti.
 * @returns {JSX.Element}
 */
const ServicesTab = () => {
  const currentUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const isCurrentUserOwner = currentUser.role === "owner";
  const isDelegatedManager = !isCurrentUserOwner && currentUser.canManageAdmins === true;

  const { admin } = useOutletContext();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesAPI.getAll().then((r) => r.data),
  });

  const [access, setAccess] = useState(admin.permissions?.services?.access ?? "off");
  const [allowedTypes, setAllowedTypes] = useState(
    (admin.permissions?.services?.allowedTypes || []).map((t) => t._id || t)
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const permissions = buildPermissionsPayload(admin, "services", { access, allowedTypes });
      await adminsAPI.updatePermissions(admin._id, { permissions });
      queryClient.invalidateQueries({ queryKey: ["admins", admin._id] });
      toast.success("Servis ruxsatlari saqlandi!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const callerAccess = isDelegatedManager ? (currentUser.permissions?.services?.access ?? "off") : undefined;
  const callerAllowedIds = isDelegatedManager ? (currentUser.permissions?.services?.allowedTypes || []) : undefined;

  return (
    <div className="max-w-2xl space-y-6">
      <ModulePermissionCard
        title="Xizmat arizalari"
        access={access}
        onAccessChange={setAccess}
        items={services}
        selectedIds={allowedTypes}
        onSelectedChange={setAllowedTypes}
        itemLabel="Servislar"
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

export default ServicesTab;
