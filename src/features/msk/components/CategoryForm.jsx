import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { mskAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";

/**
 * Create or edit MSK category modal form.
 * @param {Object} props - Modal form props from ModalWrapper.
 * @param {"create"|"edit"} props.mode - Form mode.
 * @param {string} [props._id] - Category id for edit mode.
 * @param {string} [props.name] - Initial category name.
 * @param {string} [props.icon] - Initial icon name.
 * @param {Function} props.close - Closes current modal.
 * @param {boolean} props.isLoading - Current submit loading state.
 * @param {Function} props.setIsLoading - Updates submit loading state.
 * @returns {JSX.Element} MSK category form.
 */
const CategoryForm = ({
  mode,
  _id,
  name = "",
  icon = "",
  close,
  isLoading,
  setIsLoading,
}) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name, icon });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Kategoriya nomini kiriting");

    setIsLoading(true);

    try {
      if (mode === "create") {
        await mskAPI.createCategory(form);
      } else {
        await mskAPI.updateCategory(_id, form);
      }

      queryClient.invalidateQueries({ queryKey: ["msk", "categories"] });
      toast.success(mode === "create" ? "Kategoriya yaratildi!" : "Kategoriya yangilandi!");
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <InputGroup className="gap-3">
        <InputField
          name="name"
          label="Nomi"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />

        <InputField
          name="icon"
          label="Icon nomi (Lucide)"
          value={form.icon}
          onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
          placeholder="Masalan: Plug, Wrench"
        />
      </InputGroup>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saqlanmoqda..." : mode === "create" ? "Yaratish" : "Saqlash"}
      </Button>
    </form>
  );
};

export default CategoryForm;
