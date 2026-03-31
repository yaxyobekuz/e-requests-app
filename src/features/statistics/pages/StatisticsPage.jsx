// React
import { useState, useMemo, useEffect } from "react";

// Data
import { PERIOD_OPTIONS } from "../data/statistics.data";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// API
import { authAPI } from "@/features/auth/api";
import { regionsAPI } from "@/shared/api";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import MskStats from "../components/MskStats";
import HarvestStats from "../components/HarvestStats";
import StatsOverview from "../components/StatsOverview";
import RequestsStats from "../components/RequestsStats";
import ServicesStats from "../components/ServicesStats";
import UsersStats from "../components/UsersStats";
import UsersRegionBreakdown from "../components/UsersRegionBreakdown";
import RegionDistrictPicker from "@/shared/components/ui/RegionDistrictPicker";
import Card from "@/shared/components/ui/Card";
import { cn } from "@/shared/utils/cn";

/**
 * All possible tabs. `module` links to a permission key; null means always visible or special logic.
 */
const ALL_TABS = [
  { key: "requests", label: "Murojaatlar", module: "requests" },
  { key: "services", label: "Xizmat arizalari", module: "services" },
  { key: "msk", label: "MSK buyurtmalar", module: "msk" },
  { key: "users", label: "Foydalanuvchilar", module: null },
  { key: "tomorqa", label: "Tomorqa", module: null },
];

const StatisticsPage = () => {
  const { data: user = {} } = useQuery({
    queryKey: ["auth", "me"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => authAPI.getMe().then((r) => r.data),
  });

  const isOwner = user.role === "owner";
  const permissions = user.permissions || {};
  const canManageAdmins = isOwner || user.canManageAdmins === true;

  const assignedRegion = user.assignedRegion;
  const regionType = assignedRegion?.regionType;
  const assignedId = assignedRegion?.region?._id;

  /**
   * If admin is assigned to a district/neighborhood, fetch that region to find its parent (viloyat).
   * Only needed when regionType is "district", "neighborhood", or "street".
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

  /**
   * For district-level assignments, also fetch the district's parent (viloyat).
   * assignedRegionDoc.parent is the viloyat ID when regionType === "district".
   * For neighborhood, assignedRegionDoc.parent is the district → need one more level.
   */
  // For neighborhood/street: assignedRegionDoc.parent = district object, need district's parent (viloyat)
  const districtParentId =
    (regionType === "neighborhood" || regionType === "street")
      ? assignedRegionDoc?.parent?._id || null
      : null;

  const { data: districtParentDoc } = useQuery({
    queryKey: ["regions", "district-parent", districtParentId],
    queryFn: () => regionsAPI.getById(districtParentId).then((r) => r.data),
    enabled: !!districtParentId,
    staleTime: Infinity,
  });

  /**
   * Resolved IDs to pass as initial selection to RegionDistrictPicker.
   * - For regionType "region": initialRegionId = assignedId
   * - For regionType "district": initialRegionId = parent viloyat, initialDistrictId = assignedId
   * - For regionType "neighborhood"/"street": initialRegionId = grandparent viloyat,
   *     initialDistrictId = parent district, initialNeighborhoodId = assignedId
   */
  const initialRegionId = useMemo(() => {
    if (!assignedId || isOwner) return null;
    if (regionType === "region") return assignedId;
    // district: assignedRegionDoc.parent = viloyat object
    if (regionType === "district")
      return assignedRegionDoc?.parent?._id || null;
    // neighborhood / street: assignedRegionDoc.parent = district, districtParentDoc.parent = viloyat
    return districtParentDoc?.parent?._id || null;
  }, [assignedId, regionType, assignedRegionDoc, districtParentDoc, isOwner]);

  const initialDistrictId = useMemo(() => {
    if (!assignedId || isOwner) return null;
    if (regionType === "district") return assignedId;
    // neighborhood / street: assignedRegionDoc.parent = district object
    if (regionType === "neighborhood" || regionType === "street")
      return assignedRegionDoc?.parent?._id || null;
    return null;
  }, [assignedId, regionType, assignedRegionDoc, isOwner]);

  const initialNeighborhoodId = useMemo(() => {
    if (!assignedId || isOwner) return null;
    if (regionType === "neighborhood" || regionType === "street") return assignedId;
    return null;
  }, [assignedId, regionType, isOwner]);

  /** Which levels are locked (cannot be changed) based on the assigned region type. */
  const lockedLevels = useMemo(() => {
    if (!assignedRegion || isOwner) return {};
    switch (regionType) {
      case "region":
        return { region: true };
      case "district":
        return { region: true, district: true };
      case "neighborhood":
      case "street":
        return { region: true, district: true, neighborhood: true };
      default:
        return {};
    }
  }, [assignedRegion, regionType, isOwner]);

  /**
   * Checks if the current user has access to the given module.
   * @param {string} mod - "requests" | "services" | "msk"
   * @returns {boolean}
   */
  const hasModule = (mod) => {
    if (isOwner) return true;
    if (user.role !== "admin") return false;
    return permissions[mod]?.access !== "off";
  };

  const visibleTabs = useMemo(() => {
    return ALL_TABS.filter((tab) => {
      if (tab.module) return hasModule(tab.module);
      if (tab.key === "users") return isOwner || canManageAdmins;
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (visibleTabs.length > 0 && !activeTab) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [visibleTabs, activeTab]);

  const { period, regionId, districtId, neighborhoodId, setFields, setField } =
    useObjectState({
      period: "30",
      regionId: null,
      districtId: null,
      neighborhoodId: null,
    });

  const filters = { period, regionId, districtId, neighborhoodId };

  const handleRegionChange = (id) => {
    if (lockedLevels.region) return;
    setFields({ regionId: id || null, districtId: null, neighborhoodId: null });
  };

  const handleDistrictChange = (id) => {
    if (lockedLevels.district) return;
    setFields({ districtId: id || null, neighborhoodId: null });
  };

  const handleNeighborhoodChange = (id) => {
    if (lockedLevels.neighborhood) return;
    setField("neighborhoodId", id || null);
  };

  const accessibleModules = useMemo(() => {
    const modules = [];
    if (hasModule("requests")) modules.push("requests");
    if (hasModule("services")) modules.push("services");
    if (hasModule("msk")) modules.push("msk");
    modules.push("users");
    return modules;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Statistika</h1>

        {/* Period filter */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setField("period", opt.value)}
              className={
                period === opt.value
                  ? "px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white transition-all"
                  : "px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <StatsOverview filters={filters} accessibleModules={accessibleModules} />

      {/* Map + select region/district filter */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Col - Map selector */}
        <div className="relative size-full">
          <RegionDistrictPicker
            className="sticky top-4 inset-x-0"
            onRegionChange={handleRegionChange}
            onDistrictChange={handleDistrictChange}
            onNeighborhoodChange={handleNeighborhoodChange}
            lockedLevels={lockedLevels}
            initialRegionId={initialRegionId}
            initialDistrictId={initialDistrictId}
            initialNeighborhoodId={initialNeighborhoodId}
          />
        </div>

        {/* Right col - Tab contents */}
        <div className="relative space-y-4">
          {visibleTabs.length > 0 && (
            <Card className="flex !p-1 sticky top-4 inset-x-0 z-10">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "grow py-1.5 rounded-xl text-sm transition-colors",
                    activeTab === tab.key
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:text-primary",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </Card>
          )}

          {activeTab === "requests" && <RequestsStats filters={filters} />}
          {activeTab === "services" && <ServicesStats filters={filters} />}
          {activeTab === "msk" && <MskStats filters={filters} />}
          {activeTab === "users" && (
            <>
              <UsersStats filters={filters} />
              <UsersRegionBreakdown filters={filters} regionType={regionType} />
            </>
          )}
          {activeTab === "tomorqa" && <HarvestStats filters={filters} />}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
