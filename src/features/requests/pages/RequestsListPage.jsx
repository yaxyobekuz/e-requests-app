import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { requestsAPI, requestTypesAPI, settingsAPI } from "@/shared/api";
import { requestCategories } from "@/shared/data/request-categories";
import { REQUEST_STATUSES } from "@/shared/data/request-statuses";
import { formatUzDate } from "@/shared/utils/formatDate";
import {
  buildDeadlineBadge,
  getDeadlineBadgeClass,
} from "@/shared/utils/deadline";
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

const RequestsListPage = () => {
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    type: "",
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
    queryKey: ["admin-requests", filters, deadlineDays],
    queryFn: () =>
      requestsAPI.getAll({ ...filters, deadlineDays }).then((res) => res.data),
  });

  const { data: requestTypes = [] } = useQuery({
    queryKey: ["request-types"],
    queryFn: () => requestTypesAPI.getAll().then((res) => res.data),
  });

  const requests = data?.data || [];
  const totalPages = data?.pages || 1;

  const getCategoryLabel = (id) =>
    requestCategories.find((c) => c.id === id)?.label || id;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Murojaatlar</h1>
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
            {Object.entries(REQUEST_STATUSES).map(([key, val]) => (
              <SelectItem key={key} value={key}>
                {val.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category || "all"}
          onValueChange={(val) =>
            setFilters((p) => ({
              ...p,
              category: val === "all" ? "" : val,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-48 border rounded-lg text-sm bg-white">
            <SelectValue placeholder="Barcha bo'limlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha bo'limlar</SelectItem>
            {requestCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type || "all"}
          onValueChange={(val) =>
            setFilters((p) => ({
              ...p,
              type: val === "all" ? "" : val,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-48 border rounded-lg text-sm bg-white">
            <SelectValue placeholder="Barcha turlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha turlar</SelectItem>
            {requestTypes.map((t) => (
              <SelectItem key={t._id} value={t._id}>
                {t.name}
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
                Bo'lim
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                Turi
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
            {requests.map((req) => {
              const status = REQUEST_STATUSES[req.status] || {};
              const { label: deadlineLabel, badgeType } = buildDeadlineBadge(
                req.createdAt,
                req.status,
                deadlineDays,
              );
              return (
                <tr key={req._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {getCategoryLabel(req.category)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {req.type?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">{req.user?.firstName}</td>
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
                    {formatUzDate(req.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/requests/${req._id}`}
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
        {requests.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            Murojaatlar topilmadi
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                disabled={filters.page === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const current = filters.page;
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= current - 2 && page <= current + 2);
              const showStartEllipsis = page === 2 && current > 4;
              const showEndEllipsis =
                page === totalPages - 1 && current < totalPages - 3;
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
                disabled={filters.page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default RequestsListPage;
