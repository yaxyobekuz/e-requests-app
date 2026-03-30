// Icons
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

// React
import { useState } from "react";

// API
import { statsAPI } from "../api";

// Data
import {
  REGION_SORT_OPTIONS,
  REGION_MODULE_OPTIONS,
} from "../data/statistics.data";

// Components
import Card from "@/shared/components/ui/Card";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

const MODULE_COLORS = {
  Murojaatlar: "#3B82F6",
  "Xizmat arizalari": "#F59E0B",
  "MSK buyurtmalar": "#EC4899",
};

const RegionTooltip = ({ active, payload, label }) => {
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

const RegionBreakdown = ({ filters }) => {
  const [sortBy, setSortBy] = useState("total");
  const [moduleFilter, setModuleFilter] = useState("");

  const { data: regions = [], isLoading } = useQuery({
    queryKey: ["stats", "by-region", filters],
    queryFn: () => statsAPI.getByRegion(filters).then((r) => r.data),
    refetchInterval: 60_000,
  });

  const { data: districts = [], isLoading: districtsLoading } = useQuery({
    queryKey: ["stats", "by-district", filters.regionId, filters],
    queryFn: () =>
      statsAPI.getByDistrict(filters.regionId, filters).then((r) => r.data),
    enabled: !!filters.regionId,
    refetchInterval: 60_000,
  });

  const { data: neighborhoods = [], isLoading: neighborhoodsLoading } = useQuery({
    queryKey: ["stats", "by-neighborhood", filters.districtId, filters],
    queryFn: () =>
      statsAPI.getByNeighborhood(filters.districtId, filters).then((r) => r.data),
    enabled: !!filters.districtId,
    refetchInterval: 60_000,
  });

  const buildChartData = (data, sort) =>
    [...data]
      .sort((a, b) => b[sort] - a[sort])
      .map((r) => ({
        name: r.name,
        Murojaatlar: r.requests,
        "Xizmat arizalari": r.services,
        "MSK buyurtmalar": r.msk,
      }));

  const chartData = buildChartData(regions, sortBy);
  const districtChartData = buildChartData(districts, sortBy);
  const neighborhoodChartData = buildChartData(neighborhoods, sortBy);

  const moduleKeys = moduleFilter
    ? [
        moduleFilter === "requests"
          ? "Murojaatlar"
          : moduleFilter === "services"
            ? "Xizmat arizalari"
            : "MSK buyurtmalar",
      ]
    : ["Murojaatlar", "Xizmat arizalari", "MSK buyurtmalar"];

  const renderChart = (data, keys) => {
    const chartHeight = Math.max(320, data.length * 36 + 60);
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
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
          <Tooltip content={<RegionTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
          {keys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={MODULE_COLORS[key]}
              radius={idx === keys.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderTable = (data, nameLabel) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 pr-4 text-gray-500 font-medium">
              {nameLabel}
            </th>
            {(!moduleFilter || moduleFilter === "requests") && (
              <th className="text-center py-2 px-2 text-blue-600 font-medium">
                Murojaatlar
              </th>
            )}
            {(!moduleFilter || moduleFilter === "services") && (
              <th className="text-center py-2 px-2 text-yellow-600 font-medium">
                Xizmatlar
              </th>
            )}
            {(!moduleFilter || moduleFilter === "msk") && (
              <th className="text-center py-2 px-2 text-pink-600 font-medium">
                MSK
              </th>
            )}
            <th className="text-center py-2 pl-2 text-gray-500 font-semibold">
              Jami
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row) => {
            const total =
              (moduleFilter === "requests" || !moduleFilter
                ? row.Murojaatlar
                : 0) +
              (moduleFilter === "services" || !moduleFilter
                ? row["Xizmat arizalari"]
                : 0) +
              (moduleFilter === "msk" || !moduleFilter
                ? row["MSK buyurtmalar"]
                : 0);
            return (
              <tr key={row.name}>
                <td className="py-2 pr-4 text-gray-800 font-medium">
                  {row.name}
                </td>
                {(!moduleFilter || moduleFilter === "requests") && (
                  <td className="py-2 px-2 text-center text-gray-700">
                    {row.Murojaatlar}
                  </td>
                )}
                {(!moduleFilter || moduleFilter === "services") && (
                  <td className="py-2 px-2 text-center text-gray-700">
                    {row["Xizmat arizalari"]}
                  </td>
                )}
                {(!moduleFilter || moduleFilter === "msk") && (
                  <td className="py-2 px-2 text-center text-gray-700">
                    {row["MSK buyurtmalar"]}
                  </td>
                )}
                <td className="py-2 pl-2 text-center font-semibold text-gray-900">
                  {total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />
      </Card>
    );
  }

  if (regions.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-400 text-center py-16">
          Ma'lumot topilmadi
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex gap-4">
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {REGION_MODULE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {REGION_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} bo'yicha tartiblash
            </option>
          ))}
        </select>
      </div>

      {/* Region chart */}
      <Card title="Viloyatlar bo'yicha taqqoslama" className="space-y-4">
        {renderChart(chartData, moduleKeys)}
      </Card>

      {/* Region table */}
      <Card title="Batafsil jadval" className="space-y-4">
        {renderTable(chartData, "Viloyat")}
      </Card>

      {/* District breakdown (appears when a region is selected on the map) */}
      {filters.regionId && (
        <>
          <Card title="Tumanlar bo'yicha taqqoslama" className="space-y-4">
            {districtsLoading ? (
              <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ) : districtChartData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">
                Tuman ma'lumotlari topilmadi
              </p>
            ) : (
              renderChart(districtChartData, moduleKeys)
            )}
          </Card>

          {!districtsLoading && districtChartData.length > 0 && (
            <Card title="Tumanlar jadvali" className="space-y-4">
              {renderTable(districtChartData, "Tuman")}
            </Card>
          )}
        </>
      )}

      {/* Neighborhood breakdown (appears when a district is selected) */}
      {filters.districtId && (
        <>
          <Card title="Mahallalar bo'yicha taqqoslama" className="space-y-4">
            {neighborhoodsLoading ? (
              <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ) : neighborhoodChartData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">
                Mahalla ma'lumotlari topilmadi
              </p>
            ) : (
              renderChart(neighborhoodChartData, moduleKeys)
            )}
          </Card>

          {!neighborhoodsLoading && neighborhoodChartData.length > 0 && (
            <Card title="Mahallalar jadvali" className="space-y-4">
              {renderTable(neighborhoodChartData, "Mahalla")}
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default RegionBreakdown;
