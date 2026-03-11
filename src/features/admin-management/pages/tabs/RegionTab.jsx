import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminsAPI, regionsAPI } from "@/shared/api";
import Button from "@/shared/components/ui/button/Button";
import { REGION_TYPE_LABELS } from "../../data/admin-management.data";

const REGION_LEVELS = ["region", "district", "neighborhood", "street"];

/**
 * Admin hudud ruxsatini tahrirlash tab komponenti.
 * Owner uchun 4-bosqichli picker, delegated manager uchun sub-picker.
 * @returns {JSX.Element}
 */
const RegionTab = () => {
  const { admin } = useOutletContext();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const isCurrentUserOwner = currentUser.role === "owner";
  const isDelegatedManager = !isCurrentUserOwner && currentUser.canManageAdmins === true;

  const callerRegion = isDelegatedManager ? (currentUser.assignedRegion || null) : null;
  const callerRegionId = callerRegion?.region?._id || callerRegion?.region || null;
  const callerRegionType = callerRegion?.regionType || null;
  const callerLevelIdx = callerRegionType ? REGION_LEVELS.indexOf(callerRegionType) : -1;

  // Sub-picker for delegated manager (up to 3 sub-levels below caller's region)
  const [subSel, setSubSel] = useState(["", "", ""]);
  const [subInitialized, setSubInitialized] = useState(!isDelegatedManager);

  // Hudud picker (owner uchun)
  const [picker, setPicker] = useState({ regionId: "", districtId: "", neighborhoodId: "", streetId: "" });
  const [regionInitialized, setRegionInitialized] = useState(!admin.assignedRegion || isDelegatedManager);

  useEffect(() => {
    if (isDelegatedManager) return;
    const current = admin.assignedRegion;
    if (!current) return;

    const resolveChain = async () => {
      try {
        const targetId = current.region?._id || current.region;
        if (!targetId) { setRegionInitialized(true); return; }

        if (current.regionType === "region") {
          setPicker({ regionId: targetId, districtId: "", neighborhoodId: "", streetId: "" });
        } else if (current.regionType === "district") {
          const res = await regionsAPI.getById(targetId);
          const district = res.data;
          setPicker({
            regionId: district.parent?._id || district.parent || "",
            districtId: targetId,
            neighborhoodId: "",
            streetId: "",
          });
        } else if (current.regionType === "neighborhood") {
          const nhRes = await regionsAPI.getById(targetId);
          const neighborhood = nhRes.data;
          const districtId = neighborhood.parent?._id || neighborhood.parent || "";
          if (districtId) {
            const dRes = await regionsAPI.getById(districtId);
            const district = dRes.data;
            setPicker({
              regionId: district.parent?._id || district.parent || "",
              districtId,
              neighborhoodId: targetId,
              streetId: "",
            });
          }
        } else if (current.regionType === "street") {
          const stRes = await regionsAPI.getById(targetId);
          const street = stRes.data;
          const neighborhoodId = street.parent?._id || street.parent || "";
          if (neighborhoodId) {
            const nhRes = await regionsAPI.getById(neighborhoodId);
            const neighborhood = nhRes.data;
            const districtId = neighborhood.parent?._id || neighborhood.parent || "";
            if (districtId) {
              const dRes = await regionsAPI.getById(districtId);
              const district = dRes.data;
              setPicker({
                regionId: district.parent?._id || district.parent || "",
                districtId,
                neighborhoodId,
                streetId: targetId,
              });
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setRegionInitialized(true);
      }
    };

    resolveChain();
  }, [admin._id]);

  // Delegated manager sub-picker: initialize from admin's current sub-region
  useEffect(() => {
    if (!isDelegatedManager || !callerRegionId) { setSubInitialized(true); return; }
    const adminRegionId = admin.assignedRegion?.region?._id || admin.assignedRegion?.region;
    const adminRegionType = admin.assignedRegion?.regionType;
    if (!adminRegionId) { setSubInitialized(true); return; }
    const adminLevelIdx = REGION_LEVELS.indexOf(adminRegionType);
    if (adminLevelIdx <= callerLevelIdx) { setSubInitialized(true); return; }
    const depth = adminLevelIdx - callerLevelIdx;
    const resolveSubChain = async () => {
      const newSubs = ["", "", ""];
      newSubs[depth - 1] = adminRegionId;
      let curId = adminRegionId;
      for (let i = depth - 2; i >= 0; i--) {
        try {
          const res = await regionsAPI.getById(curId);
          const parentId = res.data.parent?._id || res.data.parent;
          if (!parentId) break;
          newSubs[i] = parentId;
          curId = parentId;
        } catch { break; }
      }
      setSubSel(newSubs);
      setSubInitialized(true);
    };
    resolveSubChain();
  }, [admin._id]);

  const { data: allRegions = [] } = useQuery({
    queryKey: ["regions", "region"],
    queryFn: () => regionsAPI.getAll({ type: "region" }).then((r) => r.data),
    enabled: !isDelegatedManager,
  });

  const { data: districts = [] } = useQuery({
    queryKey: ["regions", "district", picker.regionId],
    queryFn: () => regionsAPI.getAll({ type: "district", parent: picker.regionId }).then((r) => r.data),
    enabled: !isDelegatedManager && !!picker.regionId,
  });

  const { data: neighborhoods = [] } = useQuery({
    queryKey: ["regions", "neighborhood", picker.districtId],
    queryFn: () => regionsAPI.getAll({ type: "neighborhood", parent: picker.districtId }).then((r) => r.data),
    enabled: !isDelegatedManager && !!picker.districtId,
  });

  const { data: streets = [] } = useQuery({
    queryKey: ["regions", "street", picker.neighborhoodId],
    queryFn: () => regionsAPI.getAll({ type: "street", parent: picker.neighborhoodId }).then((r) => r.data),
    enabled: !isDelegatedManager && !!picker.neighborhoodId,
  });

  // Sub-level queries (delegated manager uchun)
  const { data: subLevel1Data = [] } = useQuery({
    queryKey: ["regions", REGION_LEVELS[callerLevelIdx + 1] || "none", callerRegionId],
    queryFn: () =>
      regionsAPI.getAll({ type: REGION_LEVELS[callerLevelIdx + 1], parent: callerRegionId }).then((r) => r.data),
    enabled: isDelegatedManager && callerLevelIdx >= 0 && callerLevelIdx < 3 && !!callerRegionId,
  });

  const { data: subLevel2Data = [] } = useQuery({
    queryKey: ["regions", REGION_LEVELS[callerLevelIdx + 2] || "none", subSel[0]],
    queryFn: () =>
      regionsAPI.getAll({ type: REGION_LEVELS[callerLevelIdx + 2], parent: subSel[0] }).then((r) => r.data),
    enabled: isDelegatedManager && callerLevelIdx >= 0 && callerLevelIdx < 2 && !!subSel[0],
  });

  const { data: subLevel3Data = [] } = useQuery({
    queryKey: ["regions", REGION_LEVELS[callerLevelIdx + 3] || "none", subSel[1]],
    queryFn: () =>
      regionsAPI.getAll({ type: REGION_LEVELS[callerLevelIdx + 3], parent: subSel[1] }).then((r) => r.data),
    enabled: isDelegatedManager && callerLevelIdx === 0 && !!subSel[1],
  });

  const getOwnerSelectedRegion = () => {
    if (picker.streetId) return { region: picker.streetId, regionType: "street" };
    if (picker.neighborhoodId) return { region: picker.neighborhoodId, regionType: "neighborhood" };
    if (picker.districtId) return { region: picker.districtId, regionType: "district" };
    if (picker.regionId) return { region: picker.regionId, regionType: "region" };
    return null;
  };

  const getDelegatedSelectedRegion = () => {
    for (let i = 2; i >= 0; i--) {
      if (subSel[i]) {
        return { region: subSel[i], regionType: REGION_LEVELS[callerLevelIdx + 1 + i] };
      }
    }
    return callerRegionId ? { region: callerRegionId, regionType: callerRegionType } : null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const assignedRegion = isDelegatedManager ? getDelegatedSelectedRegion() : getOwnerSelectedRegion();
      await adminsAPI.setRegion(admin._id, { assignedRegion });
      queryClient.invalidateQueries({ queryKey: ["admins", admin._id] });
      toast.success("Hudud saqlandi!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const ownerSelectedRegion = getOwnerSelectedRegion();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold">Hudud cheklovi</h3>
        <p className="text-sm text-gray-500">Admin faqat belgilangan hududdagi ma'lumotlarni ko'ra oladi</p>

        {isDelegatedManager ? (
          callerRegion ? (
            !subInitialized ? (
              <p className="text-sm text-gray-400">Yuklanmoqda...</p>
            ) : (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm flex items-center gap-2">
                  <span className="text-gray-500 flex-shrink-0">{REGION_TYPE_LABELS[callerRegionType]}:</span>
                  <span className="font-medium">{callerRegion.region?.name || "—"}</span>
                </div>

                {callerLevelIdx < 3 && (
                  <select
                    value={subSel[0]}
                    onChange={(e) => setSubSel([e.target.value, "", ""])}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">
                      {REGION_TYPE_LABELS[REGION_LEVELS[callerLevelIdx + 1]]} tanlang (ixtiyoriy)
                    </option>
                    {subLevel1Data.map((r) => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                )}

                {callerLevelIdx < 2 && subSel[0] && (
                  <select
                    value={subSel[1]}
                    onChange={(e) => setSubSel((s) => [s[0], e.target.value, ""])}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">
                      {REGION_TYPE_LABELS[REGION_LEVELS[callerLevelIdx + 2]]} tanlang (ixtiyoriy)
                    </option>
                    {subLevel2Data.map((r) => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                )}

                {callerLevelIdx < 1 && subSel[1] && (
                  <select
                    value={subSel[2]}
                    onChange={(e) => setSubSel((s) => [s[0], s[1], e.target.value])}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">
                      {REGION_TYPE_LABELS[REGION_LEVELS[callerLevelIdx + 3]]} tanlang (ixtiyoriy)
                    </option>
                    {subLevel3Data.map((r) => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                )}

                <p className="text-xs text-gray-400">Siz faqat o'z hududingiz doirasida ruxsat bera olasiz</p>
              </div>
            )
          ) : (
            <p className="text-sm text-gray-400">Sizga hudud biriktirilmagan. Hudud tayinlash imkonsiz.</p>
          )
        ) : !regionInitialized ? (
          <p className="text-sm text-gray-400">Yuklanmoqda...</p>
        ) : (
          <div className="space-y-2">
            <select
              value={picker.regionId}
              onChange={(e) =>
                setPicker({ regionId: e.target.value, districtId: "", neighborhoodId: "", streetId: "" })
              }
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Viloyat tanlang (barcha hududlar)</option>
              {allRegions.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>

            {picker.regionId && (
              <select
                value={picker.districtId}
                onChange={(e) =>
                  setPicker((p) => ({ ...p, districtId: e.target.value, neighborhoodId: "", streetId: "" }))
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Tuman tanlang (ixtiyoriy)</option>
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            )}

            {picker.districtId && (
              <select
                value={picker.neighborhoodId}
                onChange={(e) =>
                  setPicker((p) => ({ ...p, neighborhoodId: e.target.value, streetId: "" }))
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Mahalla tanlang (ixtiyoriy)</option>
                {neighborhoods.map((n) => (
                  <option key={n._id} value={n._id}>{n.name}</option>
                ))}
              </select>
            )}

            {picker.neighborhoodId && (
              <select
                value={picker.streetId}
                onChange={(e) => setPicker((p) => ({ ...p, streetId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Ko'cha tanlang (ixtiyoriy)</option>
                {streets.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            )}

            {ownerSelectedRegion && (
              <p className="text-xs text-gray-500">
                Tayinlanadi:{" "}
                <span className="font-medium">{REGION_TYPE_LABELS[ownerSelectedRegion.regionType]}</span> darajasida
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
};

export default RegionTab;
