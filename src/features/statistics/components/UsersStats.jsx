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
  USER_STATUS_COLORS,
  USER_STATUS_LABELS,
  CHART_COLORS,
} from "../data/statistics.data";

// Components
import Card from "@/shared/components/ui/Card";

/**
 * UsersStats — analytics charts for the Foydalanuvchilar module.
 * Shows: registration trend, active/inactive ratio, by-region breakdown, top active users.
 *
 * @param {{ filters: { period: string, regionId: string|null, districtId: string|null } }} props
 * @returns {JSX.Element}
 */
const UsersStats = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "users", filters],
    queryFn: () => statsAPI.getUsers(filters).then((r) => r.data),
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
  const byStatus = data?.byStatus || { active: 0, inactive: 0, total: 0 };
  const byRegion = data?.byRegion || [];
  const topActive = data?.topActive || [];

  const pieData = [
    {
      name: USER_STATUS_LABELS.active,
      value: byStatus.active,
      color: USER_STATUS_COLORS.active,
    },
    {
      name: USER_STATUS_LABELS.inactive,
      value: byStatus.inactive,
      color: USER_STATUS_COLORS.inactive,
    },
  ].filter((d) => d.value > 0);

  const regionData = [...byRegion]
    .sort((a, b) => b.total - a.total)
    .map((r) => ({
      name: r.regionName,
      Faol: r.active,
      Nofaol: r.inactive,
    }));

  const regionChartHeight = Math.max(280, regionData.length * 36 + 60);

  return (
    <div className="space-y-4">
      {/* Registration trend */}
      <Card title="Ro'yxatdan o'tish trendi" className="space-y-4">
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
                formatter={(v) => [v, "Foydalanuvchilar"]}
                labelFormatter={(l) => `Sana: ${l}`}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={CHART_COLORS.purple}
                fill="#EDE9FE"
                strokeWidth={2}
                dot={false}
                name="Foydalanuvchilar"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Active / Inactive ratio */}
      <Card title="Faol va nofaol foydalanuvchilar" className="space-y-4">
        {byStatus.total === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            Ma'lumot topilmadi
          </p>
        ) : (
          <div className="flex flex-col items-center">
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

            {/* Summary numbers */}
            <div className="flex items-center gap-6 mt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{byStatus.active}</p>
                <p className="text-xs text-gray-500">Faol</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{byStatus.inactive}</p>
                <p className="text-xs text-gray-500">Nofaol</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{byStatus.total}</p>
                <p className="text-xs text-gray-500">Jami</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Users by region */}
      <Card title="Hududlar bo'yicha foydalanuvchilar" className="space-y-4">
        {regionData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            Ma'lumot topilmadi
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={regionChartHeight}>
            <BarChart
              data={regionData}
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
                dataKey="Faol"
                stackId="a"
                fill={USER_STATUS_COLORS.active}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="Nofaol"
                stackId="a"
                fill={USER_STATUS_COLORS.inactive}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Top active users */}
      <Card title="Eng faol foydalanuvchilar" className="space-y-4">
        {topActive.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            Ma'lumot topilmadi
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">
                    #
                  </th>
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">
                    Foydalanuvchi
                  </th>
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">
                    Hudud
                  </th>
                  <th className="text-center py-2 px-2 text-blue-600 font-medium">
                    Murojaatlar
                  </th>
                  <th className="text-center py-2 px-2 text-yellow-600 font-medium">
                    Xizmatlar
                  </th>
                  <th className="text-center py-2 px-2 text-pink-600 font-medium">
                    MSK
                  </th>
                  <th className="text-center py-2 pl-2 text-gray-500 font-semibold">
                    Jami
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topActive.map((user, idx) => (
                  <tr key={user.userId}>
                    <td className="py-2 pr-4 text-gray-400">{idx + 1}</td>
                    <td className="py-2 pr-4 text-gray-800 font-medium">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-2 pr-4 text-gray-500">{user.regionName}</td>
                    <td className="py-2 px-2 text-center text-gray-700">
                      {user.requests}
                    </td>
                    <td className="py-2 px-2 text-center text-gray-700">
                      {user.services}
                    </td>
                    <td className="py-2 px-2 text-center text-gray-700">
                      {user.msk}
                    </td>
                    <td className="py-2 pl-2 text-center font-semibold text-gray-900">
                      {user.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UsersStats;
