// API
import { adminsAPI } from "@/shared/api";

// Components
import Card from "@/shared/components/ui/Card";

// Tanstack query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Users, UserCheck, UserX, Shield } from "lucide-react";

const AdminStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["admins", "stats"],
    queryFn: () => adminsAPI.getStats().then((res) => res.data),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Adminlar statistikasi</h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Jami adminlar"
          value={stats?.total}
          icon={<Users className="w-5 h-5" />}
          iconColor="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Faol"
          value={stats?.active}
          icon={<UserCheck className="w-5 h-5" />}
          iconColor="bg-green-50 text-green-600"
        />
        <StatCard
          label="Nofaol"
          value={stats?.inactive}
          icon={<UserX className="w-5 h-5" />}
          iconColor="bg-red-50 text-red-600"
        />
        <StatCard
          label="Tahrirlash huquqi bor"
          value={stats?.withDelegation}
          icon={<Shield className="w-5 h-5" />}
          iconColor="bg-amber-50 text-amber-600"
        />
      </div>

      {stats?.byRole?.length > 0 && (
        <Card className="space-y-3.5">
          {stats.byRole.map((item) => (
            <div
              key={item.roleId || "no-role"}
              className="flex items-center gap-3"
            >
              <span className="font-medium text-sm text-gray-700 w-44 truncate flex-shrink-0">
                {item.roleName || "Lavozim belgilanmagan"}
              </span>

              <div className="flex-1 bg-gray-100 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full"
                  style={{ width: `${(item.count / stats.total) * 100}%` }}
                />
              </div>

              <span className="text-sm font-medium text-gray-900 w-6 text-right flex-shrink-0">
                {item.count}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, iconColor }) => (
  <Card className="flex items-center gap-4">
    <div
      className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}
    >
      {icon}
    </div>

    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? "0"}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </Card>
);

export default AdminStats;
