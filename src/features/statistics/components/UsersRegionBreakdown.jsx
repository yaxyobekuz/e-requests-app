import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft } from "lucide-react";

// API
import { statsAPI } from "../api";

// Data
import { USER_STATUS_COLORS } from "../data/statistics.data";

// Components
import Card from "@/shared/components/ui/Card";

/**
 * Custom tooltip for user region breakdown charts.
 *
 * @param {{ active: boolean, payload: Array, label: string }} props
 * @returns {JSX.Element|null}
 */
const UserRegionTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((s, p) => s + (p.value || 0), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-3 text-sm min-w-[180px]">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((p) => (
        <div
          key={p.name}
          className="flex items-center justify-between gap-4 py-0.5"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ background: p.fill }}
            />
            <span className="text-gray-600">{p.name}</span>
          </div>
          <span className="font-medium text-gray-900">{p.value}</span>
        </div>
      ))}
      <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between">
        <span className="text-gray-500">Jami</span>
        <span className="font-bold text-gray-900">{total}</span>
      </div>
    </div>
  );
};

/**
 * UsersRegionBreakdown — region → district → neighborhood drill-down
 * for user counts with active/inactive stacked bars and summary table.
 *
 * @param {{ filters: { period: string, regionId: string|null, districtId: string|null } }} props
 * @returns {JSX.Element}
 */
const UsersRegionBreakdown = ({ filters }) => {
  const [drillRegion, setDrillRegion] = useState(null);
  const [drillDistrict, setDrillDistrict] = useState(null);

  // Level 1: All regions
  const { data: regions = [], isLoading: regionsLoading } = useQuery({
    queryKey: ["stats", "users-by-region", filters],
    queryFn: () => statsAPI.getUsersByRegion(filters).then((r) => r.data),
    refetchInterval: 60_000,
  });

  // Level 2: Districts within selected region
  const { data: districts = [], isLoading: districtsLoading } = useQuery({
    queryKey: ["stats", "users-by-district", drillRegion?._id, filters],
    queryFn: () =>
      statsAPI.getUsersByDistrict(drillRegion._id, filters).then((r) => r.data),
    enabled: !!drillRegion,
    refetchInterval: 60_000,
  });

  // Level 3: Neighborhoods within selected district
  const { data: neighborhoods = [], isLoading: neighborhoodsLoading } = useQuery({
    queryKey: ["stats", "users-by-neighborhood", drillRegion?._id, drillDistrict?._id, filters],
    queryFn: () =>
      statsAPI
        .getUsersByDistrict(drillRegion._id, { ...filters, districtId: drillDistrict._id })
        .then((r) => r.data),
    enabled: !!drillRegion && !!drillDistrict,
    refetchInterval: 60_000,
  });

  // Determine current level data
  let currentData;
  let isLoading;
  let title;
  let levelLabel;

  if (drillDistrict) {
    currentData = neighborhoods;
    isLoading = neighborhoodsLoading;
    title = `${drillRegion.name} → ${drillDistrict.name}`;
    levelLabel = "Mahalla";
  } else if (drillRegion) {
    currentData = districts;
    isLoading = districtsLoading;
    title = drillRegion.name;
    levelLabel = "Tuman";
  } else {
    currentData = regions;
    isLoading = regionsLoading;
    title = "Viloyatlar bo'yicha foydalanuvchilar";
    levelLabel = "Viloyat";
  }

  const handleBarClick = (entry) => {
    if (drillDistrict) return; // no further drill-down
    const item = currentData.find((d) => d.name === entry.name);
    if (!item) return;

    if (!drillRegion) {
      setDrillRegion(item);
    } else {
      setDrillDistrict(item);
    }
  };

  const handleBack = () => {
    if (drillDistrict) {
      setDrillDistrict(null);
    } else {
      setDrillRegion(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />
      </Card>
    );
  }

  if (currentData.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-4">
          {(drillRegion || drillDistrict) && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ChevronLeft className="size-4" />
              Orqaga
            </button>
          )}
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 text-center py-16">
          Ma'lumot topilmadi
        </p>
      </Card>
    );
  }

  const chartData = [...currentData]
    .sort((a, b) => b.total - a.total)
    .map((r) => ({
      name: r.name,
      Faol: r.active,
      Nofaol: r.inactive,
    }));

  const chartHeight = Math.max(320, chartData.length * 36 + 60);
  const canDrill = !drillDistrict;

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        {/* Header with back button */}
        <div className="flex items-center gap-2">
          {(drillRegion || drillDistrict) && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ChevronLeft className="size-4" />
              Orqaga
            </button>
          )}
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {canDrill && (
            <span className="text-xs text-gray-400 ml-auto">
              Bosing — batafsil
            </span>
          )}
        </div>

        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F3F4F6"
              horizontal={false}
            />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
            <YAxis
              type="category"
              dataKey="name"
              width={112}
              tick={{ fontSize: 11, fill: "#374151" }}
            />
            <Tooltip content={<UserRegionTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
            <Bar
              dataKey="Faol"
              stackId="a"
              fill={USER_STATUS_COLORS.active}
              radius={[0, 0, 0, 0]}
              onClick={canDrill ? (_, idx) => handleBarClick(chartData[idx]) : undefined}
              cursor={canDrill ? "pointer" : "default"}
            />
            <Bar
              dataKey="Nofaol"
              stackId="a"
              fill={USER_STATUS_COLORS.inactive}
              radius={[0, 4, 4, 0]}
              onClick={canDrill ? (_, idx) => handleBarClick(chartData[idx]) : undefined}
              cursor={canDrill ? "pointer" : "default"}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Summary table */}
      <Card title="Batafsil jadval" className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-gray-500 font-medium">
                  {levelLabel}
                </th>
                <th className="text-center py-2 px-2 text-gray-500 font-semibold">
                  Jami
                </th>
                <th className="text-center py-2 px-2 text-green-600 font-medium">
                  Faol
                </th>
                <th className="text-center py-2 px-2 text-red-600 font-medium">
                  Nofaol
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {chartData.map((row) => (
                <tr
                  key={row.name}
                  className={canDrill ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}
                  onClick={canDrill ? () => handleBarClick(row) : undefined}
                >
                  <td className="py-2 pr-4 text-gray-800 font-medium">
                    {row.name}
                  </td>
                  <td className="py-2 px-2 text-center font-semibold text-gray-900">
                    {row.Faol + row.Nofaol}
                  </td>
                  <td className="py-2 px-2 text-center text-gray-700">
                    {row.Faol}
                  </td>
                  <td className="py-2 px-2 text-center text-gray-700">
                    {row.Nofaol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UsersRegionBreakdown;
