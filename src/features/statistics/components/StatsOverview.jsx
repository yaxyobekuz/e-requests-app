import { useMemo, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Files, FileText, FolderKanban, Users } from "lucide-react";

// API
import { statsAPI } from "../api";

// Data
import { KPI_CONFIG } from "../data/statistics.data";

// Components
import Card from "@/shared/components/ui/Card";

const ICONS = {
  requests: <FileText className="size-5" strokeWidth={1.5} />,
  services: <Files className="size-5" strokeWidth={1.5} />,
  msk:      <FolderKanban className="size-5" strokeWidth={1.5} />,
  users:    <Users className="size-5" strokeWidth={1.5} />,
};

/**
 * Animated counter that rAF-interpolates from 0 to target over ~800ms.
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
      // ease-out quad
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

/**
 * StatsOverview — animated KPI cards filtered by accessible modules.
 *
 * @param {{ filters: object, accessibleModules?: string[] }} props
 * @returns {JSX.Element}
 */
const StatsOverview = ({ filters, accessibleModules }) => {
  const visibleCards = useMemo(() => {
    if (!accessibleModules || accessibleModules.length === 0) return KPI_CONFIG;
    return KPI_CONFIG.filter((cfg) => accessibleModules.includes(cfg.key));
  }, [accessibleModules]);

  const lgCols = visibleCards.length >= 4 ? "lg:grid-cols-4" :
    visibleCards.length === 3 ? "lg:grid-cols-3" :
    visibleCards.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-1";

  const { data, isLoading } = useQuery({
    queryKey: ["stats", "overview", filters],
    queryFn: () => statsAPI.getOverview(filters).then((r) => r.data),
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 gap-4 mb-6 ${lgCols}`}>
        {visibleCards.map((cfg) => (
          <Card key={cfg.key} className="flex items-center gap-4">
            <div className="size-10 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-4 mb-6 ${lgCols}`}>
      {visibleCards.map((cfg) => (
        <Card key={cfg.key} className="flex items-center gap-4">
          <div
            className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.iconColor}`}
          >
            {ICONS[cfg.key]}
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedNumber target={data?.[cfg.key] ?? 0} />
            </p>
            <p className="text-sm text-gray-500">{cfg.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
