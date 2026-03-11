import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mskAPI, settingsAPI } from "@/shared/api";
import { MSK_ORDER_STATUSES } from "@/shared/data/request-statuses";
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

const MskOrdersPage = () => {
  const [filters, setFilters] = useState({
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

  const { data, isLoading } = useQuery({
    queryKey: ["admin-msk-orders", filters, deadlineDays],
    queryFn: () =>
      mskAPI.getAllOrders({ ...filters, deadlineDays }).then((res) => res.data),
  });

  const orders = data?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">MSK buyurtmalar</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
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
            {Object.entries(MSK_ORDER_STATUSES).map(([key, val]) => (
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
                Kategoriya
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
            {orders.map((order) => {
              const status = MSK_ORDER_STATUSES[order.status] || {};
              const { label: deadlineLabel, badgeType } = buildDeadlineBadge(
                order.createdAt,
                order.status,
                deadlineDays
              );
              return (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    {order.category?.name}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.contactFirstName} {order.contactLastName}
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
                    {formatUzDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/msk/orders/${order._id}`}
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
        {orders.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            Buyurtmalar topilmadi
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

export default MskOrdersPage;

