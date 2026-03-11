import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { serviceReportsAPI, servicesAPI, settingsAPI } from "@/shared/api";
import { SERVICE_REPORT_STATUSES } from "@/shared/data/request-statuses";
import { formatUzDate } from "@/shared/utils/formatDate";
import { buildDeadlineBadge, getDeadlineBadgeClass } from "@/shared/utils/deadline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadcn/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationButton,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/shared/components/shadcn/pagination";

const ServiceReportsPage = () => {
  const [filters, setFilters] = useState({
    serviceId: "",
    status: "",
    deadlineStatus: "",
    page: 1,
  });

  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsAPI.get().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const deadlineDays = settingsData?.deadlineDays ?? 15;

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesAPI.getAll().then((res) => res.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-service-reports", filters, deadlineDays],
    queryFn: () =>
      serviceReportsAPI.getAll({ ...filters, deadlineDays }).then((res) => res.data),
  });

  const reports = data?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Xizmat arizalari</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Select
          value={filters.serviceId || "all"}
          onValueChange={(val) =>
            setFilters((p) => ({
              ...p,
              serviceId: val === "all" ? "" : val,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-48 border rounded-lg text-sm bg-white">
            <SelectValue placeholder="Barcha servislar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha servislar</SelectItem>
            {services.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || "all"}
          onValueChange={(val) =>
            setFilters((p) => ({
              ...p,
              status: val === "all" ? "" : val,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-48 border rounded-lg text-sm bg-white">
            <SelectValue placeholder="Barcha statuslar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha statuslar</SelectItem>
            {Object.entries(SERVICE_REPORT_STATUSES).map(([key, val]) => (
              <SelectItem key={key} value={key}>
                {val.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.deadlineStatus || "all"}
          onValueChange={(val) =>
            setFilters((p) => ({
              ...p,
              deadlineStatus: val === "all" ? "" : val,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-56 border rounded-lg text-sm bg-white">
            <SelectValue placeholder="Ijro muddati holati" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha muddatlar</SelectItem>
            <SelectItem value="overdue">Muddati o'tgan</SelectItem>
            <SelectItem value="approaching">Muddati yaqinlashmoqda</SelectItem>
            <SelectItem value="ok">Muddati ok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Servis
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Fuqaro
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Ijro muddati
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Sana
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">
                Amal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reports.map((report) => {
              const status = SERVICE_REPORT_STATUSES[report.status] || {};
              const { label: deadlineLabel, badgeType } = buildDeadlineBadge(
                report.createdAt,
                report.status,
                deadlineDays
              );
              return (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    {report.service?.name}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {report.user?.firstName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getDeadlineBadgeClass(badgeType)}`}
                    >
                      {deadlineLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatUzDate(report.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/service-reports/${report._id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Batafsil
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {reports.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            Reportlar topilmadi
          </div>
        )}
      </div>

      {data && data.pages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                disabled={filters.page === 1}
              />
            </PaginationItem>
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((page) => {
              const current = filters.page;
              const total = data.pages;
              const showPage =
                page === 1 ||
                page === total ||
                (page >= current - 2 && page <= current + 2);
              const showStartEllipsis = page === 2 && current > 4;
              const showEndEllipsis = page === total - 1 && current < total - 3;
              if (showStartEllipsis || showEndEllipsis) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              if (!showPage) return null;
              return (
                <PaginationItem key={page}>
                  <PaginationButton
                    isActive={page === current}
                    onClick={() => setFilters((p) => ({ ...p, page }))}
                  >
                    {page}
                  </PaginationButton>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                disabled={filters.page === data.pages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ServiceReportsPage;

