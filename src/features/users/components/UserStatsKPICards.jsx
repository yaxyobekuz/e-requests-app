import { useEffect, useRef, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Home,
  Building2,
  House,
} from "lucide-react";

// Data
import { DEMOGRAPHICS_KPI_CONFIG } from "../data/users-stats.data";

// Components
import Card from "@/shared/components/ui/Card";

const ICONS = {
  Users:     <Users     className="size-5" strokeWidth={1.5} />,
  UserCheck: <UserCheck className="size-5" strokeWidth={1.5} />,
  UserX:     <UserX     className="size-5" strokeWidth={1.5} />,
  Home:      <Home      className="size-5" strokeWidth={1.5} />,
  House:     <House     className="size-5" strokeWidth={1.5} />,
  Building2: <Building2 className="size-5" strokeWidth={1.5} />,
};

/**
 * rAF-animatsiyali son ko'rsatuvchi komponent.
 *
 * @param {{ target: number }} props
 * @returns {JSX.Element}
 */
const AnimatedNumber = ({ target }) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target === undefined || target === null) return;
    let start = null;
    const duration = 800;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(target * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return <span>{display.toLocaleString("uz-UZ")}</span>;
};

const COLOR_MAP = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-600"   },
  green:  { bg: "bg-green-50",  text: "text-green-600"  },
  red:    { bg: "bg-red-50",    text: "text-red-600"    },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
  orange: { bg: "bg-orange-50", text: "text-orange-600" },
  sky:    { bg: "bg-sky-50",    text: "text-sky-600"    },
};

/**
 * Demografik statistika KPI kartalar paneli.
 * 2-ustunli grid (sm: 3-ustun, lg: 6-ustun) — DEMOGRAPHICS_KPI_CONFIG bo'yicha.
 *
 * @param {{ summary: object|undefined, isLoading: boolean }} props
 * @returns {JSX.Element}
 */
const UserStatsKPICards = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {DEMOGRAPHICS_KPI_CONFIG.map((cfg) => (
          <Card key={cfg.key} className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="space-y-2 min-w-0">
              <div className="h-6 w-14 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {DEMOGRAPHICS_KPI_CONFIG.map((cfg) => {
        const colors = COLOR_MAP[cfg.color] || COLOR_MAP.blue;
        return (
          <Card key={cfg.key} className="flex items-center gap-3">
            <div
              className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg} ${colors.text}`}
            >
              {ICONS[cfg.icon]}
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900 leading-tight">
                <AnimatedNumber target={summary?.[cfg.key] ?? 0} />
              </p>
              <p className="text-xs text-gray-500 leading-snug mt-0.5">
                {cfg.label}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default UserStatsKPICards;
