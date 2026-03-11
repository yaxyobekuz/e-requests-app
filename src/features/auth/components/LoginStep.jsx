import { useState } from "react";
import { toast } from "sonner";
import { authAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import { telegramLogo } from "@/shared/assets/icons";

const LoginStep = ({
  phone,
  password,
  onChange,
  onSuccess,
  onTelegramClick,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return toast.error("Parolni kiriting");
    setLoading(true);
    try {
      const { data } = await authAPI.login({
        phone: `+${phone.replace(/\D/g, "")}`,
        password,
      });
      onSuccess(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Kirishda xatolik yuz berdi",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramClick = () => onTelegramClick();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <InputField
        required
        label="Parol"
        type="password"
        name="password"
        onChange={onChange}
      />

      <Button
        disabled={loading}
        className="w-full flex justify-center items-center gap-2"
      >
        Tizimga kirish {loading && "..."}
      </Button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">yoki</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleTelegramClick}
        className="w-full text-primary hover:bg-white hover:border-primary hover:text-primary"
      >
        <img
          width={20}
          height={20}
          src={telegramLogo}
          className="size-5"
          alt="Telegram logo"
        />
        Telegram orqali kirish
      </Button>
    </form>
  );
};

export default LoginStep;
