import { useState, useMemo, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// API
import { statsAPI } from "@/features/statistics/api";

// Data
import {
  DEMOGRAPHICS_TABLE_COLUMNS,
  HOUSEHOLD_COLORS,
} from "../data/users-stats.data";

// Components
import Card from "@/shared/components/ui/Card";

/**
 * Faollik foiziga mos Tailwind rang sinfi.
 *
 * @param {number} rate
 * @returns {string}
 */
function activityRateClass(rate) {
  if (rate >= 70) return "bg-green-100 text-green-700";
  if (rate >= 40) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

/**
 * Hududlar bo'yicha foydalanuvchilar va xonadonlar statistikasi jadvali.
 * Admin scope: lockedMinDepth belgilangan darajadan yuqoriga chiqib bo'lmaydi.
 *
 * @param {{
 *   lockedMinDepth: number,
 *   seedPath: Array<{ id: string, name: string }>,
 * }} props
 *   lockedMinDepth — admin biriktirilgan darajaning drill-path indeksi.
 *     0 = hech qanday lock (owner), 1 = viloyat lock, 2 = tuman lock, 3 = mahalla lock.
 *   seedPath — admin biriktirilgan hududga qadar boshlang'ich yo'l.
 *     Bo'sh bo'lsa, viloyatlardan boshlanadi.
 * @returns {JSX.Element}
 */
const UserDemographicsTable = ({ lockedMinDepth = 0, seedPath = [] }) => {
  // drillPath: [{ id, name }] — boshlang'ich qiymat = seedPath
  const [drillPath, setDrillPath] = useState(seedPath);

  // Seed path o'zgarganda (sahifa mount yoki prop o'zgarish) reset qilish
  // Faqat prop reference o'zgarganda ishlaydi, ya'ni faqat birinchi render da ahamiyatli
  // seedPath array doimiy referens bo'lishi uchun parent useMemo ishlatadi

  const queryParams = useMemo(() => {
    const p = {};
    if (drillPath.length >= 1) p.regionId = drillPath[0].id;
    if (drillPath.length >= 2) p.districtId = drillPath[1].id;
    if (drillPath.length >= 3) p.neighborhoodId = drillPath[2].id;
    return p;
  }, [drillPath]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["users", "demographics", "table", queryParams],
    queryFn: () => statsAPI.getUserDemographics(queryParams).then((r) => r.data),
    keepPreviousData: true,
  });

  const byLevel = data?.byLevel || [];

  // Ko'cha darajasiga yetganda (depth 3) yoki server bo'sh qaytarsa drill yo'q
  const canDrill = drillPath.length < 3;

  const handleRowClick = (row) => {
    if (!canDrill) return;
    setDrillPath((prev) => [...prev, { id: String(row._id), name: row.name }]);
  };

  // Breadcrumb elementiga bosish — lockedMinDepth dan past bo'lgan darajaga tushmaydi
  const handleBreadcrumb = (targetIdx) => {
    const safeIdx = Math.max(targetIdx, lockedMinDepth);
    setDrillPath((prev) => prev.slice(0, safeIdx));
  };

  const chartData = useMemo(
    () =>
      [...byLevel]
        .sort((a, b) => b.totalHouseholds - a.totalHouseholds)
        .map((r) => ({
          name: r.name,
          "Hovli/Uy": r.privateHouseholds,
          "Ko'p qavatli": r.apartmentHouseholds,
        })),
    [byLevel],
  );

  const chartHeight = Math.max(240, chartData.length * 36 + 60);

  // Breadcrumb labels — locked darajalar kliklanmaydi
  const breadcrumbItems = [
    { label: "Barcha viloyatlar", idx: 0 },
    ...drillPath.map((crumb, i) => ({ label: crumb.name, idx: i + 1 })),
  ];

  return (
    <div className="space-y-4">
      <Card>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm mb-4 flex-wrap">
          {breadcrumbItems.map((item, i) => {
            const isLast = i === breadcrumbItems.length - 1;
            const isLocked = item.idx < lockedMinDepth;
            return (
              <Fragment key={item.idx}>
                {i > 0 && (
                  <ChevronRight className="size-3.5 text-gray-400 flex-shrink-0" />
                )}
                <button
                  onClick={() => !isLocked && !isLast && handleBreadcrumb(item.idx)}
                  disabled={isLocked || isLast}
                  className={
                    isLast
                      ? "text-gray-900 font-medium cursor-default"
                      : isLocked
                      ? "text-gray-400 cursor-default"
                      : "text-gray-500 hover:text-blue-600 transition-colors"
                  }
                >
                  {item.label}
                </button>
              </Fragment>
            );
          })}
          {isFetching && !isLoading && (
            <span className="ml-2">
              <div className="spin-loader size-3.5 inline-block" />
            </span>
          )}
        </div>

        {/* Jadval */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {DEMOGRAPHICS_TABLE_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`py-2.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap ${
                      col.align === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
                {canDrill && <th className="py-2.5 px-3 w-8" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {DEMOGRAPHICS_TABLE_COLUMNS.map((col) => (
                      <td key={col.key} className="py-3 px-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                    {canDrill && <td className="py-3 px-3" />}
                  </tr>
                ))}

              {!isLoading && byLevel.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      DEMOGRAPHICS_TABLE_COLUMNS.length + (canDrill ? 1 : 0)
                    }
                    className="py-12 text-center text-sm text-gray-400"
                  >
                    Ma&apos;lumot topilmadi
                  </td>
                </tr>
              )}

              {!isLoading &&
                byLevel.map((row, idx) => (
                  <tr
                    key={String(row._id)}
                    onClick={() => handleRowClick(row)}
                    className={`transition-colors ${
                      canDrill
                        ? "cursor-pointer hover:bg-blue-50/50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {DEMOGRAPHICS_TABLE_COLUMNS.map((col) => {
                      if (col.key === "index") {
                        return (
                          <td key={col.key} className="py-3 px-3 text-gray-400">
                            {idx + 1}
                          </td>
                        );
                      }

                      if (col.key === "name") {
                        return (
                          <td
                            key={col.key}
                            className="py-3 px-3 font-medium text-gray-800"
                          >
                            {row.name}
                          </td>
                        );
                      }

                      if (col.key === "activityRate") {
                        return (
                          <td key={col.key} className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${activityRateClass(row.activityRate)}`}
                            >
                              {row.activityRate}%
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col.key}
                          className="py-3 px-3 text-center text-gray-700 tabular-nums"
                        >
                          {(row[col.key] ?? 0).toLocaleString("uz-UZ")}
                        </td>
                      );
                    })}
                    {canDrill && (
                      <td className="py-3 px-3 text-gray-400">
                        <ChevronRight className="size-4" />
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Xonadon turlari chart */}
      {!isLoading && chartData.length > 0 && (
        <Card title="Xonadon turlari bo'yicha taqsimot">
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
                width={130}
                tick={{ fontSize: 11, fill: "#374151" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Bar
                dataKey="Hovli/Uy"
                stackId="h"
                fill={HOUSEHOLD_COLORS.private}
                radius={[0, 0, 0, 0]}
                cursor={canDrill ? "pointer" : "default"}
                onClick={
                  canDrill
                    ? (entry) => {
                        const row = byLevel.find((r) => r.name === entry.name);
                        if (row) handleRowClick(row);
                      }
                    : undefined
                }
              />
              <Bar
                dataKey="Ko'p qavatli"
                stackId="h"
                fill={HOUSEHOLD_COLORS.apartment}
                radius={[0, 4, 4, 0]}
                cursor={canDrill ? "pointer" : "default"}
                onClick={
                  canDrill
                    ? (entry) => {
                        const row = byLevel.find((r) => r.name === entry.name);
                        if (row) handleRowClick(row);
                      }
                    : undefined
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default UserDemographicsTable;
