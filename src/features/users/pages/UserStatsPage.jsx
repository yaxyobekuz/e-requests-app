// React
import { useMemo } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { authAPI } from "@/features/auth/api";
import { regionsAPI } from "@/shared/api";
import { statsAPI } from "@/features/statistics/api";

// Feature components
import UserStatsKPICards from "../components/UserStatsKPICards";
import UserDemographicsTable from "../components/UserDemographicsTable";

/**
 * Foydalanuvchilar demografik statistikasi sahifasi (app panel).
 * Admin o'ziga biriktirilgan hududdan pastroq darajalarnigina ko'ra oladi.
 * Owner barcha hududlarni ko'ra oladi.
 *
 * @returns {JSX.Element}
 */
const UserStatsPage = () => {
  const { data: user = {} } = useQuery({
    queryKey: ["auth", "me"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => authAPI.getMe().then((r) => r.data),
  });

  const isOwner = user.role === "owner";
  const assignedRegion = user.assignedRegion;
  const regionType = assignedRegion?.regionType;
  const assignedId = assignedRegion?.region?._id;

  /**
   * Tuman/mahalla/ko'cha darajasidagi admin uchun parent hududni topish.
   * StatisticsPage.jsx dagi bir xil mantiq.
   */
  const needsParentFetch =
    !isOwner &&
    assignedId &&
    (regionType === "district" ||
      regionType === "neighborhood" ||
      regionType === "street");

  const { data: assignedRegionDoc } = useQuery({
    queryKey: ["regions", "assigned-doc", assignedId],
    queryFn: () => regionsAPI.getById(assignedId).then((r) => r.data),
    enabled: !!needsParentFetch,
    staleTime: Infinity,
  });

  // Mahalla/ko'cha uchun tuman parentining viloyatini topish
  const districtParentId =
    regionType === "neighborhood" || regionType === "street"
      ? assignedRegionDoc?.parent?._id || null
      : null;

  const { data: districtParentDoc } = useQuery({
    queryKey: ["regions", "district-parent", districtParentId],
    queryFn: () => regionsAPI.getById(districtParentId).then((r) => r.data),
    enabled: !!districtParentId,
    staleTime: Infinity,
  });

  /**
   * Admin biriktirilgan hududga mos boshlang'ich drill yo'li.
   * Bu yo'l UserDemographicsTable ga seed sifatida uzatiladi.
   * Owner uchun bo'sh (viloyatlardan boshlanadi).
   */
  const seedPath = useMemo(() => {
    if (isOwner || !assignedId || !regionType) return [];

    if (regionType === "region") {
      // Viloyat: bir qadamli yo'l
      const name = assignedRegion?.region?.name || "";
      return [{ id: assignedId, name }];
    }

    if (regionType === "district") {
      // Tuman: viloyat → tuman
      const viloyatId = assignedRegionDoc?.parent?._id;
      const viloyatName = assignedRegionDoc?.parent?.name || "";
      if (!viloyatId) return [];
      return [
        { id: String(viloyatId), name: viloyatName },
        { id: assignedId, name: assignedRegion?.region?.name || "" },
      ];
    }

    if (regionType === "neighborhood" || regionType === "street") {
      // Mahalla/ko'cha: viloyat → tuman → mahalla
      const districtId = assignedRegionDoc?.parent?._id;
      const districtName = assignedRegionDoc?.parent?.name || "";
      const viloyatId = districtParentDoc?.parent?._id;
      const viloyatName = districtParentDoc?.parent?.name || "";
      if (!viloyatId || !districtId) return [];
      return [
        { id: String(viloyatId), name: viloyatName },
        { id: String(districtId), name: districtName },
        { id: assignedId, name: assignedRegion?.region?.name || "" },
      ];
    }

    return [];
  }, [
    isOwner,
    assignedId,
    regionType,
    assignedRegion,
    assignedRegionDoc,
    districtParentDoc,
  ]);

  /**
   * Admin breadcrumb'da seedPath uzunligidan past daraja ko'rsata olmasligi uchun
   * lockedMinDepth = seedPath.length.
   * Owner: 0 (hech qanday lock yo'q).
   */
  const lockedMinDepth = isOwner ? 0 : seedPath.length;

  /**
   * KPI summary uchun query params: admin assigned hududiga mos.
   */
  const summaryParams = useMemo(() => {
    if (isOwner) return {};
    if (!assignedId) return {};

    const p = {};
    if (regionType === "region") {
      p.regionId = assignedId;
    } else if (regionType === "district") {
      const viloyatId = assignedRegionDoc?.parent?._id;
      if (viloyatId) p.regionId = String(viloyatId);
      p.districtId = assignedId;
    } else if (regionType === "neighborhood" || regionType === "street") {
      const districtId = assignedRegionDoc?.parent?._id;
      const viloyatId = districtParentDoc?.parent?._id;
      if (viloyatId) p.regionId = String(viloyatId);
      if (districtId) p.districtId = String(districtId);
      p.neighborhoodId = assignedId;
    }
    return p;
  }, [
    isOwner,
    assignedId,
    regionType,
    assignedRegionDoc,
    districtParentDoc,
  ]);

  const { data: demographicsData, isLoading: summaryLoading } = useQuery({
    queryKey: ["users", "demographics", "summary", summaryParams],
    queryFn: () =>
      statsAPI.getUserDemographics(summaryParams).then((r) => r.data),
    keepPreviousData: true,
    // Faqat summaryParams tayyor bo'lganda so'rov yuborish
    enabled:
      isOwner ||
      (!!assignedId && (seedPath.length > 0 || regionType === "region")),
  });

  // Sahifa tayyorligi: owner uchun darhol; admin uchun seedPath hisoblanmaguncha kutish
  const isReady =
    isOwner ||
    !assignedId ||
    seedPath.length > 0 ||
    (regionType === "region" && !!assignedId);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Foydalanuvchilar statistikasi
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Aholi, xonadonlar va faollik ko&apos;rsatkichlari
        </p>
      </div>

      {!isReady ? (
        // Hududlar yuklanguncha skeleton
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="size-10 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="space-y-2">
                <div className="h-6 w-14 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* KPI kartalar */}
          <UserStatsKPICards
            summary={demographicsData?.summary}
            isLoading={summaryLoading}
          />

          {/* Jadval va chart */}
          <UserDemographicsTable
            lockedMinDepth={lockedMinDepth}
            seedPath={seedPath}
          />
        </>
      )}
    </div>
  );
};

export default UserStatsPage;
