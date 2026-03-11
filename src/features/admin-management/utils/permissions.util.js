/**
 * Access darajasini raqamga aylantirish (UI uchun)
 * @param {string} access - "off" | "read" | "manage"
 * @returns {number}
 */
const getAccessRank = (access) => {
  const ranks = { off: 0, read: 1, manage: 2 };
  return ranks[access] ?? 0;
};

/**
 * Access darajasini cheklash: so'ralgan daraja yaratuvchining darajasidan oshmasligi kerak
 * @param {string} requested
 * @param {string} callerAccess
 * @returns {string}
 */
export const capAccess = (requested, callerAccess) => {
  if (getAccessRank(requested) <= getAccessRank(callerAccess)) return requested;
  return callerAccess;
};

/**
 * ID ro'yxatini cheklash: agar yaratuvchida cheklov yo'q — hamma ruxsat.
 * Aks holda faqat yaratuvchining ro'yxatidagi IDlar qoladi.
 * @param {string[]} requestedIds
 * @param {string[]} callerIds
 * @returns {string[]}
 */
export const capIdList = (requestedIds, callerIds) => {
  if (!callerIds || callerIds.length === 0) return requestedIds;
  const callerSet = new Set(callerIds.map((id) => id.toString()));
  return requestedIds.filter((id) => callerSet.has(id.toString()));
};

/**
 * Barcha modullar bo'yicha ruxsatlarni cheklash (UI rendering uchun)
 * @param {object} permissions - { requests, services, msk }
 * @param {object} callerPermissions - qayta chiqarilgan caller ruxsatlari
 * @returns {object} cheklangan ruxsatlar
 */
export const capPermissions = (permissions, callerPermissions) => {
  if (!callerPermissions) return permissions;

  const capModule = (mod, idsField, callerMod) => {
    const capped = { ...mod };
    capped.access = capAccess(mod.access || "off", callerMod?.access || "off");
    capped[idsField] = capIdList(mod[idsField] || [], callerMod?.[idsField] || []);
    return capped;
  };

  return {
    requests: capModule(
      permissions?.requests || {},
      "allowedTypes",
      callerPermissions?.requests,
    ),
    services: capModule(
      permissions?.services || {},
      "allowedTypes",
      callerPermissions?.services,
    ),
    msk: capModule(
      permissions?.msk || {},
      "allowedCategories",
      callerPermissions?.msk,
    ),
  };
};

/**
 * Berilgan access darajasi caller darajasidan yuqori ekanligini tekshirish (UI disable uchun)
 * @param {string} access
 * @param {string} callerAccess
 * @returns {boolean}
 */
export const isAccessExceedsCaller = (access, callerAccess) => {
  return getAccessRank(access) > getAccessRank(callerAccess);
};

/**
 * Backend uchun to'liq permissions payloadini tuzadi.
 * Faqat o'zgargan modul yangi ma'lumot bilan, qolgan 2 modul admin'ning mavjud qiymatlaridan olinadi.
 * @param {object} admin - Mavjud admin obyekti
 * @param {"requests"|"services"|"msk"} moduleKey - O'zgartiriladigan modul
 * @param {object} moduleData - Yangi modul ma'lumotlari ({ access, allowedTypes } yoki { access, allowedCategories })
 * @returns {object} - Backend updatePermissions uchun to'liq permissions payload
 */
export const buildPermissionsPayload = (admin, moduleKey, moduleData) => {
  const base = {
    requests: {
      access: admin.permissions?.requests?.access ?? "off",
      allowedTypes: (admin.permissions?.requests?.allowedTypes || []).map((t) => t._id || t),
    },
    services: {
      access: admin.permissions?.services?.access ?? "off",
      allowedTypes: (admin.permissions?.services?.allowedTypes || []).map((t) => t._id || t),
    },
    msk: {
      access: admin.permissions?.msk?.access ?? "off",
      allowedCategories: (admin.permissions?.msk?.allowedCategories || []).map((c) => c._id || c),
    },
  };
  return { ...base, [moduleKey]: moduleData };
};
