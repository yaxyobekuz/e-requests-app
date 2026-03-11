// Data
import { daysUz } from "../data/days.data";

// React
import { useState, useEffect } from "react";

// API
import { authAPI } from "@/shared/api";
import Card from "@/shared/components/ui/Card";

// Tanstack query
import { useQuery } from "@tanstack/react-query";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

const TopPanel = () => {
  const { data: user = {} } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data),
  });

  // For timer
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dayName = daysUz[now.getDay()];
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return (
    <div className="flex items-start justify-between">
      {/* Left side */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Xush kelibsiz, {user.firstName}!
        </h1>

        <p className="text-gray-500">Platformaning asosiy boshqaruv paneli.</p>
      </div>

      {/* Right side (Time & Date) */}
      <Card className="text-right">
        <div className="flex items-start justify-between">
          <p className="text-sm font-semibold text-blue-600">Bugun</p>

          {/* Time */}
          <p className="text-xl font-bold text-gray-900 tabular-nums tracking-tight">
            {hours}
            <span className="animate-pulse">:</span>
            {minutes}
            <span className="text-sm text-gray-400 ml-1">{seconds}</span>
          </p>
        </div>

        {/* Date */}
        <p className="text-sm text-gray-500 mt-0.5">
          {dayName}, {formatUzDate(now)}-yil
        </p>
      </Card>
    </div>
  );
};

export default TopPanel;
