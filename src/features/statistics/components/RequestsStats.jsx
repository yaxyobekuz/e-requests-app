import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

// API
import { statsAPI } from "../api";

// Data
import {
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
  REQUEST_CATEGORY_LABELS,
  CHART_COLORS,
} from "../data/statistics.data";

// Components
import Card from "@/shared/components/ui/Card";

/**
 * ResolutionBar — shows % of resolved items as a progress bar.
 *
 * @param {{ byStatus: Array, resolvedKey?: string }} props
 * @returns {JSX.Element}
 */
const ResolutionBar = ({ byStatus = [], resolvedKey = "resolved" }) => {
  const total = byStatus.reduce((s, x) => s + x.count, 0);
  const resolved = byStatus.find((x) => x._id === resolvedKey)?.count || 0;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const statusRows = byStatus.map((s) => ({
    label: REQUEST_STATUS_LABELS[s._id] || s._id,
    count: s.count,
    color: REQUEST_STATUS_COLORS[s._id] || "#9CA3AF",
    pct: total > 0 ? Math.round((s.count / total) * 100) : 0,
  }));

  return (
    <div className="space-y-4">
      {/* Resolution rate big number */}
      <div className="text-center">
        <p className="text-4xl font-bold text-green-600">{rate}%</p>
        <p className="text-sm text-gray-500 mt-1">Hal qilinganlik darajasi</p>
        <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>

      {/* Per-status breakdown */}
      <div className="space-y-2.5 mt-4">
        {statusRows.map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full flex-shrink-0"
              style={{ background: row.color }}
            />
            <span className="text-xs text-gray-600 w-36 truncate flex-shrink-0">
              {row.label}
            </span>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${row.pct}%`, background: row.color }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700 w-7 text-right">
              {row.count}
            </span>
          </div>
        ))}
      </div>

      {total > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Jami: {total} ta murojaat
        </p>
      )}
    </div>
  );
};

/**
 * RequestsStats — analytics charts for the Murojaatlar module.
 *
 * @param {{ filters: { period: string, regionId: string|null, districtId: string|null } }} props
 * @returns {JSX.Element}
 */
const RequestsStats = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "requests", filters],
    queryFn: () => statsAPI.getRequests(filters).then((r) => r.data),
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  const trend = data?.trend || [];
  const byStatus = data?.byStatus || [];
  const byCategory = data?.byCategory || [];

  const pieData = byStatus.map((s) => ({
    name: REQUEST_STATUS_LABELS[s._id] || s._id,
    value: s.count,
    color: REQUEST_STATUS_COLORS[s._id] || "#9CA3AF",
  }));

  const categoryData = byCategory.map((c) => ({
    name: REQUEST_CATEGORY_LABELS[c._id] || c._id || "Noma'lum",
    count: c.count,
  }));

  return (
    <div className="space-y-4">
      {/* Trend area chart */}
      <Card title="Kunlik trend" className="space-y-4">
        {trend.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            Ma'lumot topilmadi
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart
              data={trend}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
                formatter={(v) => [v, "Murojaatlar"]}
                labelFormatter={(l) => `Sana: ${l}`}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={CHART_COLORS.primary}
                fill="#DBEAFE"
                strokeWidth={2}
                dot={false}
                name="Murojaatlar"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Status donut chart */}
      <Card title="Status taqsimoti" className="space-y-4">
        {pieData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            Ma'lumot topilmadi
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                paddingAngle={2}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
                formatter={(v, n) => [v, n]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Category bar chart */}
      <Card title="Kategoriya bo'yicha" className="space-y-4">
        {categoryData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            Ma'lumot topilmadi
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
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
                width={90}
                tick={{ fontSize: 11, fill: "#6B7280" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
                formatter={(v) => [v, "Soni"]}
              />
              <Bar
                dataKey="count"
                fill={CHART_COLORS.primary}
                radius={[0, 6, 6, 0]}
                name="Soni"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Resolution rate */}
      <Card title="Bajarilish darajasi" className="space-y-4">
        <ResolutionBar byStatus={byStatus} resolvedKey="resolved" />
      </Card>
    </div>
  );
};

export default RequestsStats;
