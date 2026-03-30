// Icons
import {
  Pie,
  Bar,
  Cell,
  Area,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  PieChart,
  BarChart,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// API
import { statsAPI } from "../api";

// Data
import {
  CHART_COLORS,
  SERVICE_STATUS_COLORS,
  SERVICE_STATUS_LABELS,
} from "../data/statistics.data";

// Components
import Card from "@/shared/components/ui/Card";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

const ResolutionBar = ({ byStatus = [] }) => {
  const total = byStatus.reduce((s, x) => s + x.count, 0);
  const confirmed = byStatus.find((x) => x._id === "confirmed")?.count || 0;
  const rate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  const statusRows = byStatus.map((s) => ({
    label: SERVICE_STATUS_LABELS[s._id] || s._id,
    count: s.count,
    color: SERVICE_STATUS_COLORS[s._id] || "#9CA3AF",
    pct: total > 0 ? Math.round((s.count / total) * 100) : 0,
  }));

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-4xl font-bold text-green-600">{rate}%</p>
        <p className="text-sm text-gray-500 mt-1">Tasdiqlangan arizalar</p>
        <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>
      <div className="space-y-2.5">
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
          Jami: {total} ta ariza
        </p>
      )}
    </div>
  );
};

const ServicesStats = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "services", filters],
    queryFn: () => statsAPI.getServices(filters).then((r) => r.data),
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
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
  const byService = data?.byService || [];

  const pieData = byStatus.map((s) => ({
    name: SERVICE_STATUS_LABELS[s._id] || s._id,
    value: s.count,
    color: SERVICE_STATUS_COLORS[s._id] || "#9CA3AF",
  }));

  const serviceData = byService.map((s) => ({
    name: s.serviceName || "Noma'lum",
    count: s.count,
  }));

  return (
    <div className="space-y-4">
      {/* Trend */}
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
                formatter={(v) => [v, "Arizalar"]}
                labelFormatter={(l) => `Sana: ${l}`}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={CHART_COLORS.accent}
                fill="#FEF3C7"
                strokeWidth={2}
                dot={false}
                name="Arizalar"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Status donut */}
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

      {/* Top services bar */}
      <Card title="Top xizmatlar" className="space-y-4">
        {serviceData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            Ma'lumot topilmadi
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={serviceData}
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
                width={110}
                tick={{ fontSize: 10, fill: "#6B7280" }}
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
                fill={CHART_COLORS.accent}
                radius={[0, 6, 6, 0]}
                name="Soni"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Resolution rate */}
      <Card title="Bajarilish darajasi" className="space-y-4">
        <ResolutionBar byStatus={byStatus} />
      </Card>
    </div>
  );
};

export default ServicesStats;
