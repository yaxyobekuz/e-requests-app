// React
import { useEffect } from "react";

// Icons
import { ArrowLeft } from "lucide-react";

// Data
import { authSteps } from "../data/auth.data";

// Images
import bgImage from "../assets/backgrounds/meeting.avif";

// Components
import OtpStep from "../components/OtpStep";
import LoginStep from "../components/LoginStep";
import PhoneStep from "../components/PhoneStep";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Router
import { useNavigate, useSearchParams } from "react-router-dom";

const stepMeta = {
  phone: {
    title: "Xush kelibsiz! 👋",
    subtitle: "Davom etish uchun telefon raqamingizni kiriting",
  },
  login: {
    title: "Tizimga kirish",
    subtitle: "Parolni kiriting yoki Telegram orqali kiring",
  },
  otp: {
    title: "Telegram kodi bilan kirish",
    subtitle: "Telegram botidan olgan 5 xonali kodni kiriting",
  },
};

const backMap = { login: authSteps.phone, otp: authSteps.login };

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { phone, password, otp, setField, setFields } = useObjectState({
    otp: "",
    phone: "",
    password: "",
  });

  const step = searchParams.get("step") || authSteps.phone;

  const goToStep = (s, replace = false) => {
    setSearchParams({ step: s }, { replace });
  };

  useEffect(() => {
    if (!stepMeta[step]) goToStep(authSteps.phone, true);
  }, [step]);

  const handleChange = (e) => setField(e.target.name, e.target.value);

  const handleBack = () => {
    const backStep = backMap[step];
    if (backStep) {
      setFields({ otp: "", password: "" });
      goToStep(backStep);
    }
  };

  const handleAuthSuccess = ({ token, user }) => {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(user));
    navigate("/dashboard");
  };

  const meta = stepMeta[step] || stepMeta[authSteps.phone];
  const hasBack = !!backMap[step];

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
      {/* Left side: branding */}
      <img src={bgImage} className="hidden w-1/2 object-cover lg:block" />

      {/* Right side: form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:shadow-none sm:bg-transparent border border-slate-100 sm:border-none p-8 sm:p-0">
          {hasBack && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-1.5 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Orqaga
            </Button>
          )}

          <div className="text-center sm:text-left mb-8">
            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              {meta.title}
            </h2>

            {/* Subtitle */}
            <p className="text-slate-500 text-sm">{meta.subtitle}</p>
          </div>

          {step === authSteps.phone && (
            <PhoneStep
              phone={phone}
              onChange={handleChange}
              onSuccess={() => goToStep(authSteps.login)}
            />
          )}

          {step === authSteps.login && (
            <LoginStep
              phone={phone}
              password={password}
              onChange={handleChange}
              onSuccess={handleAuthSuccess}
              onTelegramClick={() => goToStep(authSteps.otp)}
            />
          )}

          {step === authSteps.otp && (
            <OtpStep
              phone={phone}
              otp={otp}
              onChange={handleChange}
              onSuccess={handleAuthSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
