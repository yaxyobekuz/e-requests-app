import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminsAPI, adminRolesAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";

/**
 * Create admin modal form component.
 * @param {Object} props - Modal form props from ModalWrapper.
 * @param {Function} props.close - Closes current modal.
 * @param {boolean} props.isLoading - Current submit loading state.
 * @param {Function} props.setIsLoading - Updates submit loading state.
 * @returns {JSX.Element} Create admin form.
 */
const CreateAdminForm = ({ close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    phone: "",
    password: "",
    firstName: "",
    lastName: "",
    alias: "",
    adminRole: "",
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => adminRolesAPI.getAll().then((res) => res.data),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = form.phone.replace(/\D/g, "");

    if (cleanPhone.length < 12) return toast.error("Telefon raqamni to'liq kiriting");
    if (!form.password) return toast.error("Parolni kiriting");
    if (!form.alias.trim()) return toast.error("Tahallus kiritilishi shart");
    if (!form.adminRole) return toast.error("Lavozim tanlanishi shart");

    setIsLoading(true);

    try {
      await adminsAPI.create({ ...form, phone: `+${cleanPhone}` });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin yaratildi!");
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Lavozim *</label>
        <select
          value={form.adminRole}
          onChange={(e) => setForm((prev) => ({ ...prev, adminRole: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">Lavozim tanlang</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <InputGroup className="gap-3">
        <InputField
          name="alias"
          label="Tahallus"
          required
          value={form.alias}
          onChange={(e) => setForm((prev) => ({ ...prev, alias: e.target.value }))}
          placeholder="admin_toshkent"
        />

        <InputGroup className="grid-cols-2 gap-3">
          <InputField
            name="firstName"
            label="Ism"
            value={form.firstName}
            onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
          />

          <InputField
            name="lastName"
            label="Familiya"
            value={form.lastName}
            onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
          />
        </InputGroup>

        <InputField
          type="tel"
          name="phone"
          label="Telefon"
          required
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
        />

        <InputField
          type="password"
          name="password"
          label="Parol"
          required
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          placeholder="Kamida 6 ta belgi"
        />
      </InputGroup>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Yaratilmoqda..." : "Yaratish"}
      </Button>
    </form>
  );
};

export default CreateAdminForm;
