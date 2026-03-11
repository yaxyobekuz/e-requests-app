// Sonner
import { toast } from "sonner";

// React
import { useState } from "react";

// API
import { authAPI } from "@/shared/api";

// Data
import { botLink } from "../data/auth.data";

// Images
import { telegramLogo } from "@/shared/assets/icons";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

const OtpStep = ({ phone, otp, onChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 5) return;
    setLoading(true);

    try {
      const { data } = await authAPI.loginWithOtp({
        phone: `+${phone.replace(/\D/g, "")}`,
        code: otp,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Button
        asChild
        type="button"
        variant="outline"
        className="w-full text-primary hover:bg-white hover:border-primary hover:text-primary"
      >
        <a href={botLink} target="_blank" rel="noreferrer">
          <img
            width={20}
            height={20}
            src={telegramLogo}
            className="size-5"
            alt="Telegram logo"
          />
          Telegram
        </a>
      </Button>

      <InputField
        required
        type="otp"
        name="otp"
        label="Tasdiqlash kodi"
        onComplete={(value) => onChange({ target: { name: "otp", value } })}
        description="Telegram botiga o'ting, /start buyrug'ini yuboring. Bot sizga 5 xonali kod yuboradi."
      />

      <Button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center gap-2"
      >
        Tizimga kirish {loading && "..."}
      </Button>
    </form>
  );
};

export default OtpStep;
