// React
import { useEffect, useRef } from "react";

// Utils
import { cn } from "@/shared/utils/cn";

// Icons
import { ArrowLeft } from "lucide-react";

// API
import { regionsAPI } from "@/shared/api";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Data
import uzbekistanRegions, {
  getRegionByLabel,
  getDistrictByLabel,
} from "./map/data/uzbekistan.data";
import andijanDistricts from "./map/data/andijan.data";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Card from "@/shared/components/ui/Card";
import UzbekistanMap from "./map/UzbekistanMap";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";

/**
 * Region → District → Neighborhood picker with interactive SVG maps.
 * Supports locking levels for admins with assignedRegion.
 *
 * @param {{
 *   className?: string,
 *   onRegionChange?: Function,
 *   onDistrictChange?: Function,
 *   onNeighborhoodChange?: Function,
 *   lockedLevels?: { region?: boolean, district?: boolean, neighborhood?: boolean },
 *   initialRegionId?: string|null,
 *   initialDistrictId?: string|null,
 *   initialNeighborhoodId?: string|null,
 * }} props
 */
const RegionDistrictPicker = ({
  className,
  onRegionChange,
  onDistrictChange,
  onNeighborhoodChange,
  lockedLevels = {},
  initialRegionId = null,
  initialDistrictId = null,
  initialNeighborhoodId = null,
}) => {
  const {
    selectedRegion,
    selectedRegionId,
    selectedDistrict,
    selectedDistrictId,
    selectedNeighborhood,
    selectedNeighborhoodId,
    setFields,
  } = useObjectState({
    selectedRegion: null,
    selectedRegionId: null,
    selectedDistrict: null,
    selectedDistrictId: null,
    selectedNeighborhood: null,
    selectedNeighborhoodId: null,
  });

  const { data: regionsList = [] } = useQuery({
    queryKey: ["regions", "list", "region"],
    queryFn: () => regionsAPI.getAll({ type: "region" }).then((r) => r.data),
  });

  const { data: districtsList = [] } = useQuery({
    queryKey: ["regions", "list", "district", selectedRegionId],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "district", parent: selectedRegionId })
        .then((r) => r.data),
    enabled: !!selectedRegionId,
  });

  const { data: neighborhoodsList = [] } = useQuery({
    queryKey: ["regions", "list", "neighborhood", selectedDistrictId],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "neighborhood", parent: selectedDistrictId })
        .then((r) => r.data),
    enabled: !!selectedDistrictId,
  });

  // --- Auto-select initial values for locked admins ---
  // regionInitialized: tracks whether we've set the initial region
  const regionInitializedRef = useRef(false);
  // districtInitialized: tracks whether we've set the initial district
  const districtInitializedRef = useRef(false);
  // neighborhoodInitialized: tracks whether we've set the initial neighborhood
  const neighborhoodInitializedRef = useRef(false);

  // Step 1: auto-select region when regionsList loads
  useEffect(() => {
    if (regionInitializedRef.current) return;
    if (!initialRegionId || regionsList.length === 0) return;

    const region = regionsList.find((r) => r._id === initialRegionId);
    if (!region) return;

    regionInitializedRef.current = true;
    setFields({
      selectedRegion: region.name,
      selectedRegionId: region._id,
      selectedDistrict: null,
      selectedDistrictId: null,
      selectedNeighborhood: null,
      selectedNeighborhoodId: null,
    });
    onRegionChange?.(region._id, region.name);
  }, [regionsList, initialRegionId]);

  // Step 2: auto-select district when districtsList loads (after region was set)
  useEffect(() => {
    if (districtInitializedRef.current) return;
    if (!initialDistrictId || districtsList.length === 0) return;

    const district = districtsList.find((d) => d._id === initialDistrictId);
    if (!district) return;

    districtInitializedRef.current = true;
    setFields({
      selectedDistrict: district.name,
      selectedDistrictId: district._id,
      selectedNeighborhood: null,
      selectedNeighborhoodId: null,
    });
    onDistrictChange?.(district._id, district.name);
  }, [districtsList, initialDistrictId]);

  // Step 3: auto-select neighborhood when neighborhoodsList loads (after district was set)
  useEffect(() => {
    if (neighborhoodInitializedRef.current) return;
    if (!initialNeighborhoodId || neighborhoodsList.length === 0) return;

    const neighborhood = neighborhoodsList.find(
      (n) => n._id === initialNeighborhoodId,
    );
    if (!neighborhood) return;

    neighborhoodInitializedRef.current = true;
    setFields({
      selectedNeighborhood: neighborhood.name,
      selectedNeighborhoodId: neighborhood._id,
    });
    onNeighborhoodChange?.(neighborhood._id, neighborhood.name);
  }, [neighborhoodsList, initialNeighborhoodId]);

  const RegionMapComponent =
    getRegionByLabel(selectedRegion)?.component ||
    uzbekistanRegions[0].component;

  const districtEntry = getDistrictByLabel(selectedRegion, selectedDistrict);
  const DistrictMapComponent =
    districtEntry?.component || andijanDistricts[0].component;

  const selectRegion = (regionId, regionName) => {
    setFields({
      selectedRegion: regionName,
      selectedRegionId: regionId,
      selectedDistrict: null,
      selectedDistrictId: null,
      selectedNeighborhood: null,
      selectedNeighborhoodId: null,
    });
    onRegionChange?.(regionId, regionName);
    onDistrictChange?.(null, null);
    onNeighborhoodChange?.(null, null);
  };

  const selectDistrict = (districtId, districtName) => {
    setFields({
      selectedDistrict: districtName,
      selectedDistrictId: districtId,
      selectedNeighborhood: null,
      selectedNeighborhoodId: null,
    });
    onDistrictChange?.(districtId, districtName);
    onNeighborhoodChange?.(null, null);
  };

  const selectNeighborhood = (neighborhoodId, neighborhoodName) => {
    setFields({
      selectedNeighborhood: neighborhoodName,
      selectedNeighborhoodId: neighborhoodId,
    });
    onNeighborhoodChange?.(neighborhoodId, neighborhoodName);
  };

  const handleMapRegionClick = (label) => {
    if (lockedLevels.region) return;
    const region = regionsList.find(
      (r) => r.name.trim().toLowerCase() === label?.trim().toLowerCase(),
    );
    selectRegion(region?._id || null, label);
  };

  const handleMapDistrictClick = (label) => {
    if (lockedLevels.district) return;
    const district = districtsList.find(
      (d) => d.name.trim().toLowerCase() === label?.trim().toLowerCase(),
    );
    selectDistrict(district?._id || null, label);
  };

  const handleMapNeighborhoodClick = (label) => {
    if (lockedLevels.neighborhood) return;
    const neighborhood = neighborhoodsList.find(
      (n) => n.name.trim().toLowerCase() === label?.trim().toLowerCase(),
    );
    selectNeighborhood(neighborhood?._id || null, label);
  };

  const handleSelectRegion = (regionId) => {
    if (lockedLevels.region) return;
    const region = regionsList.find((r) => r._id === regionId);
    if (!region) return;
    selectRegion(region._id, region.name);
  };

  const handleSelectDistrict = (districtId) => {
    if (lockedLevels.district) return;
    const district = districtsList.find((d) => d._id === districtId);
    if (!district) return;
    selectDistrict(district._id, district.name);
  };

  const handleSelectNeighborhood = (neighborhoodId) => {
    if (lockedLevels.neighborhood) return;
    const neighborhood = neighborhoodsList.find(
      (n) => n._id === neighborhoodId,
    );
    if (!neighborhood) return;
    selectNeighborhood(neighborhood._id, neighborhood.name);
  };

  const handleBackToUzbekistan = () => {
    if (lockedLevels.region) return;
    setFields({
      selectedRegion: null,
      selectedRegionId: null,
      selectedDistrict: null,
      selectedDistrictId: null,
      selectedNeighborhood: null,
      selectedNeighborhoodId: null,
    });
    onRegionChange?.(null, null);
    onDistrictChange?.(null, null);
    onNeighborhoodChange?.(null, null);
  };

  const handleBackToDistricts = () => {
    if (lockedLevels.district) return;
    setFields({
      selectedDistrict: null,
      selectedDistrictId: null,
      selectedNeighborhood: null,
      selectedNeighborhoodId: null,
    });
    onDistrictChange?.(null, null);
    onNeighborhoodChange?.(null, null);
  };

  const isDistrictMapVisible = !!(selectedDistrict && DistrictMapComponent);

  const showBackButton =
    selectedRegion &&
    !(isDistrictMapVisible ? lockedLevels.district : lockedLevels.region);

  return (
    <div className={className}>
      {/* Selects */}
      <div className="flex items-center gap-4 mb-4">
        <Select
          className="flex-1"
          onChange={handleSelectRegion}
          value={selectedRegionId || ""}
          placeholder="Viloyatni tanlang"
          disabled={lockedLevels.region}
          triggerClassName="rounded-2xl border-none"
          options={regionsList.map((region) => ({
            value: region._id,
            label: region.name,
          }))}
        />

        <Select
          className="flex-1"
          disabled={!selectedRegionId || lockedLevels.district}
          placeholder="Tumanni tanlang"
          onChange={handleSelectDistrict}
          value={selectedDistrictId || ""}
          triggerClassName="rounded-2xl border-none"
          options={districtsList.map((district) => ({
            value: district._id,
            label: district.name,
          }))}
        />

        <Select
          className="flex-1"
          disabled={!selectedDistrictId || lockedLevels.neighborhood}
          placeholder="Mahallani tanlang"
          onChange={handleSelectNeighborhood}
          value={selectedNeighborhoodId || ""}
          triggerClassName="rounded-2xl border-none"
          options={neighborhoodsList.map((n) => ({
            value: n._id,
            label: n.name,
          }))}
        />
      </div>

      <Card className="relative">
        {/* Uzbekistan map */}
        <UzbekistanMap
          value={selectedRegion}
          className={cn(
            "w-full h-auto aspect-square origin-bottom transition-all duration-500",
            selectedRegion
              ? "scale-0 opacity-0 pointer-events-none"
              : "scale-100 opacity-100",
          )}
          onChange={handleMapRegionClick}
        />

        {/* Regional (district-level) map */}
        <div
          className={cn(
            "absolute inset-0 w-full h-auto aspect-square origin-top transition-all duration-500",
            selectedRegion && !isDistrictMapVisible
              ? "scale-100"
              : "scale-0 opacity-0 pointer-events-none",
          )}
        >
          <RegionMapComponent
            value={selectedDistrict}
            onChange={handleMapDistrictClick}
            className="w-full h-auto aspect-square"
          />
        </div>

        {/* District sub-map (neighborhood-level) */}
        {DistrictMapComponent && (
          <div
            className={cn(
              "absolute inset-0 w-full h-auto aspect-square origin-bottom transition-all duration-500",
              isDistrictMapVisible
                ? "scale-100"
                : "scale-0 opacity-0 pointer-events-none",
            )}
          >
            <DistrictMapComponent
              value={selectedNeighborhood}
              onChange={handleMapNeighborhoodClick}
              className="w-full h-auto aspect-square"
            />
          </div>
        )}

        {/* Back button */}
        {showBackButton && (
          <Button
            onClick={
              isDistrictMapVisible
                ? handleBackToDistricts
                : handleBackToUzbekistan
            }
            className="absolute top-5 left-5 animate-in fade-in duration-300"
          >
            <ArrowLeft strokeWidth={1.5} />
            {isDistrictMapVisible
              ? `${selectedRegion?.split(" ")[0]} xaritasiga qaytish`
              : "O'zbekiston xaritasiga qaytish"}
          </Button>
        )}
      </Card>
    </div>
  );
};

export default RegionDistrictPicker;
