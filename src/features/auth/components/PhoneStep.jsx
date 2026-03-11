// Sonner
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

const PhoneStep = ({ phone, onChange, onSuccess }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, "");

    if (clean.length < 12) {
      return toast.error("Telefon raqamni to'liq kiriting");
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <InputField
        required
        type="tel"
        name="phone"
        onChange={onChange}
        defaultValue={phone}
        label="Telefon raqam"
      />

      <Button type="submit" className="w-full">
        Davom etish
      </Button>
    </form>
  );
};

export default PhoneStep;
