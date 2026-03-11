import { icons } from "lucide-react";
import { Switch } from "@/shared/components/shadcn/switch";
import Button from "@/shared/components/ui/button/Button";
import { ACCESS_LABELS } from "../data/admin-management.data";

/**
 * Lucide ikonkasini nom bo'yicha render qiladi
 * @param {string} name - Lucide icon nomi
 * @param {string} className
 */
const LucideIcon = ({ name, className = "w-4 h-4" }) => {
  const IconComponent = icons[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
};

/**
 * Bitta modul (murojaatlar, servislar, MSK) ruxsatlarini boshqarish kartasi.
 * @param {string} title - Modul nomi
 * @param {"off"|"read"|"manage"} access - Joriy ruxsat darajasi
 * @param {function} onAccessChange - Ruxsat darajasi o'zgarganda chaqiriladi
 * @param {Array} items - Modul elementlari (murojaat turlari, servislar, kategoriyalar)
 * @param {string[]} selectedIds - Tanlangan element IDlari (bo'sh = hammasi ruxsat)
 * @param {function} onSelectedChange - Tanlangan IDlar o'zgarganda chaqiriladi
 * @param {string} itemLabel - Elementlar bo'limi sarlavhasi
 * @param {boolean} [showIcons=false] - Elementlar oldida ikonka ko'rsatish
 * @param {string} [callerAccess] - Delegat manager ruxsat darajasi (cheklash uchun)
 * @param {string[]} [callerAllowedIds] - Delegat manager ruxsat bergan IDlar
 * @returns {JSX.Element}
 */
const ModulePermissionCard = ({
  title,
  access,
  onAccessChange,
  items,
  selectedIds,
  onSelectedChange,
  itemLabel,
  showIcons = false,
  callerAccess,
  callerAllowedIds,
}) => {
  const isEnabled = access !== "off";
  const isManage = access === "manage";

  const isCapped = callerAccess !== undefined;
  const callerCanEnable = !isCapped || (callerAccess && callerAccess !== "off");
  const callerCanManage = !isCapped || callerAccess === "manage";

  const isItemAllowedByCaller = (itemId) => {
    if (!isCapped) return true;
    if (!callerAllowedIds || callerAllowedIds.length === 0) return true;
    return callerAllowedIds
      .map((id) => (id._id || id).toString())
      .includes(itemId.toString());
  };

  const toggleItem = (id) => {
    if (selectedIds.includes(id)) {
      onSelectedChange(selectedIds.filter((x) => x !== id));
    } else {
      onSelectedChange([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">{ACCESS_LABELS[access]}</p>
        </div>
        <Switch
          checked={isEnabled}
          disabled={isCapped && !callerCanEnable}
          onCheckedChange={(checked) => onAccessChange(checked ? "manage" : "off")}
          className="data-[state=checked]:bg-green-500"
        />
      </div>

      {isEnabled && (
        <div className="flex items-center justify-between pt-2 border-t">
          <label htmlFor={`${title}-manage`} className="text-sm text-gray-600">
            Tahrirlash ruxsati
          </label>
          <Switch
            id={`${title}-manage`}
            checked={isManage}
            disabled={isCapped && !callerCanManage}
            onCheckedChange={(checked) => onAccessChange(checked ? "manage" : "read")}
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      )}

      {isEnabled && items.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-500 mb-3">{itemLabel}</p>
          <div className="space-y-2">
            {items.map((item) => {
              const allowedByCaller = isItemAllowedByCaller(item._id);
              return (
                <div
                  key={item._id}
                  className={`flex items-center justify-between ${!allowedByCaller ? "opacity-40" : ""}`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    {showIcons && item.icon && <LucideIcon name={item.icon} className="w-4 h-4 text-gray-500" />}
                    <span>{item.name}</span>
                  </div>
                  <Switch
                    checked={selectedIds.length === 0 || selectedIds.includes(item._id)}
                    disabled={!allowedByCaller}
                    onCheckedChange={() => {
                      if (!allowedByCaller) return;
                      if (selectedIds.length === 0) {
                        const allExceptThis = items
                          .filter((i) => i._id !== item._id && isItemAllowedByCaller(i._id))
                          .map((i) => i._id);
                        onSelectedChange(allExceptThis);
                      } else {
                        toggleItem(item._id);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
          {selectedIds.length > 0 && (
            <Button
              type="button"
              onClick={() => onSelectedChange([])}
              variant="link"
              className="mt-3 text-xs"
            >
              Barchasini tanlash (cheklovni olib tashlash)
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModulePermissionCard;
