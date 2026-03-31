import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// API
import { usersAPI } from "../api";
import { regionsAPI } from "@/shared/api";
import { authAPI } from "@/features/auth/api";

// Data
import {
  ALL_VALUE,
  HOUSE_TYPE_OPTIONS,
  ACTIVE_OPTIONS,
  HOUSE_TYPE_LABELS,
  HOUSE_TYPE_COLORS,
} from "../data/users.data";

// Shared components
import Select from "@/shared/components/ui/select/Select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationButton,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/shared/components/shadcn/pagination";

const LIMIT = 50;

/**
 * Sahifalash uchun raqamlar massivini qaytaradi (ellipsis bilan).
 * @param {number} current
 * @param {number} total
 * @returns {Array<number|string>}
 */
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

/**
 * Foydalanuvchilar ro'yxati sahifasi (app panel).
 * Admin faqat o'ziga biriktirilgan hudud foydalanuvchilarini ko'radi (server tomonida filtrlanadi).
 * Owner barcha hududlar bo'yicha filtr qo'llay oladi.
 *
 * @returns {JSX.Element}
 */
const UsersPage = () => {
  const { data: user = {} } = useQuery({
    queryKey: ["auth", "me"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => authAPI.getMe().then((r) => r.data),
  });

  const isOwner = user.role === "owner";

  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [houseType, setHouseType] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);

  // Region selects faqat owner uchun aktiv
  const { data: regions = [] } = useQuery({
    queryKey: ["regions", "list", "region"],
    queryFn: () => regionsAPI.getAll({ type: "region" }).then((r) => r.data),
    enabled: isOwner,
  });

  const { data: districts = [], isLoading: districtsLoading } = useQuery({
    queryKey: ["regions", "list", "district", regionId],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "district", parent: regionId })
        .then((r) => r.data),
    enabled: isOwner && !!regionId,
  });

  const { data: neighborhoods = [], isLoading: neighborhoodsLoading } =
    useQuery({
      queryKey: ["regions", "list", "neighborhood", districtId],
      queryFn: () =>
        regionsAPI
          .getAll({ type: "neighborhood", parent: districtId })
          .then((r) => r.data),
      enabled: isOwner && !!districtId,
    });

  const filters = useMemo(
    () => ({
      regionId: isOwner ? regionId : undefined,
      districtId: isOwner ? districtId : undefined,
      neighborhoodId: isOwner ? neighborhoodId : undefined,
      houseType,
      isActive,
      page,
      limit: LIMIT,
    }),
    [isOwner, regionId, districtId, neighborhoodId, houseType, isActive, page],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["users", "list", filters],
    queryFn: () => usersAPI.getAll(filters).then((r) => r.data),
    keepPreviousData: true,
  });

  const users = data?.users || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const regionOptions = useMemo(
    () => [
      { value: ALL_VALUE, label: "Barcha viloyatlar" },
      ...regions.map((r) => ({ value: r._id, label: r.name })),
    ],
    [regions],
  );

  const districtOptions = useMemo(
    () => [
      { value: ALL_VALUE, label: "Barcha tumanlar" },
      ...districts.map((d) => ({ value: d._id, label: d.name })),
    ],
    [districts],
  );

  const neighborhoodOptions = useMemo(
    () => [
      { value: ALL_VALUE, label: "Barcha mahallalar" },
      ...neighborhoods.map((n) => ({ value: n._id, label: n.name })),
    ],
    [neighborhoods],
  );

  const handleRegionChange = (val) => {
    setRegionId(val === ALL_VALUE ? "" : val);
    setDistrictId("");
    setNeighborhoodId("");
    setPage(1);
  };

  const handleDistrictChange = (val) => {
    setDistrictId(val === ALL_VALUE ? "" : val);
    setNeighborhoodId("");
    setPage(1);
  };

  const handleNeighborhoodChange = (val) => {
    setNeighborhoodId(val === ALL_VALUE ? "" : val);
    setPage(1);
  };

  const handleFilterChange = (setter) => (val) => {
    setter(val === ALL_VALUE ? "" : val);
    setPage(1);
  };

  const clearFilters = () => {
    setRegionId("");
    setDistrictId("");
    setNeighborhoodId("");
    setHouseType("");
    setIsActive("");
    setPage(1);
  };

  const hasFilters = regionId || districtId || neighborhoodId || houseType || isActive;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Foydalanuvchilar
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tizimga ro&apos;yxatdan o&apos;tgan fuqarolar
          </p>
        </div>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
          Jami: {total.toLocaleString()}
        </span>
      </div>

      {/* Filtrlar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Hudud filtrlari faqat owner uchun */}
          {isOwner && (
            <>
              <div className="w-44">
                <Select
                  value={regionId || ALL_VALUE}
                  onChange={handleRegionChange}
                  options={regionOptions}
                  placeholder="Viloyat"
                  variant="gray"
                  size="sm"
                />
              </div>
              <div className="w-44">
                <Select
                  value={districtId || ALL_VALUE}
                  onChange={handleDistrictChange}
                  options={districtOptions}
                  placeholder="Tuman"
                  variant="gray"
                  size="sm"
                  disabled={!regionId}
                  isLoading={districtsLoading}
                />
              </div>
              <div className="w-44">
                <Select
                  value={neighborhoodId || ALL_VALUE}
                  onChange={handleNeighborhoodChange}
                  options={neighborhoodOptions}
                  placeholder="Mahalla"
                  variant="gray"
                  size="sm"
                  disabled={!districtId}
                  isLoading={neighborhoodsLoading}
                />
              </div>
            </>
          )}
          <div className="w-40">
            <Select
              value={houseType || ALL_VALUE}
              onChange={handleFilterChange(setHouseType)}
              options={HOUSE_TYPE_OPTIONS}
              placeholder="Uy turi"
              variant="gray"
              size="sm"
            />
          </div>
          <div className="w-36">
            <Select
              value={isActive || ALL_VALUE}
              onChange={handleFilterChange(setIsActive)}
              options={ACTIVE_OPTIONS}
              placeholder="Holat"
              variant="gray"
              size="sm"
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="h-9 px-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Tozalash
            </button>
          )}
        </div>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Ism Familiya
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Telefon
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Viloyat
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Tuman
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Mahalla
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Uy turi
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Holat
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Ro&apos;yxatdan o&apos;tgan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="spin-loader size-6" />
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && users.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              )}
              {!isLoading &&
                users.map((u, idx) => (
                  <UserRow
                    key={u._id}
                    user={u}
                    index={(page - 1) * LIMIT + idx + 1}
                  />
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="border-t border-gray-100 px-4 py-3">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  />
                </PaginationItem>
                {getPageNumbers(page, pages).map((num, i) => (
                  <PaginationItem key={i}>
                    {num === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationButton
                        isActive={num === page}
                        onClick={() => setPage(num)}
                      >
                        {num}
                      </PaginationButton>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Jadvalda bitta foydalanuvchi qatori.
 * @param {{ user: object, index: number }} props
 */
const UserRow = ({ user, index }) => {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
  const regionName = user.address?.region?.name || "—";
  const districtName = user.address?.district?.name || "—";
  const neighborhoodName =
    user.address?.neighborhood?.name || user.address?.neighborhoodCustom || "—";
  const ht = user.address?.houseType;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-400">{index}</td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{fullName}</td>
      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{user.phone}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{regionName}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{districtName}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{neighborhoodName}</td>
      <td className="px-4 py-3">
        {ht ? (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${HOUSE_TYPE_COLORS[ht] || "bg-gray-100 text-gray-600"}`}
          >
            {HOUSE_TYPE_LABELS[ht] || ht}
          </span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            user.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {user.isActive ? "Faol" : "Nofaol"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("uz-UZ")
          : "—"}
      </td>
    </tr>
  );
};

export default UsersPage;
