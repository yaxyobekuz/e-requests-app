/**
 * Barcha modullarda (requests, service-reports, msk-orders) ishlatiladigan
 * ijro muddati utility funksiyalari.
 */

/** Yakunlangan statuslar to'plami — deadline badge ko'rsatilmaydi */
export const TERMINAL_STATUSES = new Set([
  "resolved",
  "confirmed",
  "rejected",
  "cancelled",
]);

/** Muddati yaqinlashmoqda deb hisoblanadigan kunlar (oxirgi N kun) */
const WARN_DAYS = 5;

/**
 * Ariza yaratilgan sanadan boshlab o'tgan va qolgan kunlarni hisoblaydi.
 *
 * @param {string|Date} createdAt - Ariza yaratilgan sana
 * @param {number} deadlineDays - Ijro muddati (kun)
 * @returns {{ daysElapsed: number, daysLeft: number }}
 */
export const getDeadlineInfo = (createdAt, deadlineDays) => {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const daysElapsed = Math.floor((now - created) / 86400000);
  const daysLeft = deadlineDays - daysElapsed;
  return { daysElapsed, daysLeft };
};

/**
 * Badge turi bo'yicha Tailwind CSS klassini qaytaradi.
 *
 * @param {"overdue"|"approaching"|"ok"|"done"} badgeType
 * @returns {string} Tailwind className
 */
export const getDeadlineBadgeClass = (badgeType) => {
  if (badgeType === "overdue") return "bg-red-100 text-red-700";
  if (badgeType === "approaching") return "bg-yellow-100 text-yellow-700";
  if (badgeType === "ok") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-500";
};

/**
 * Ariza uchun ijro muddati badge ma'lumotini tayyorlaydi.
 *
 * @param {string|Date} createdAt - Ariza yaratilgan sana
 * @param {string} status - Arizaning joriy statusi
 * @param {number} deadlineDays - Ijro muddati (kun)
 * @returns {{ label: string, badgeType: "overdue"|"approaching"|"ok"|"done" }}
 */
export const buildDeadlineBadge = (createdAt, status, deadlineDays) => {
  if (TERMINAL_STATUSES.has(status)) {
    return { label: "Yakunlangan", badgeType: "done" };
  }

  const { daysLeft } = getDeadlineInfo(createdAt, deadlineDays);

  if (daysLeft < 0) {
    return { label: `${Math.abs(daysLeft)} kun kechikdi`, badgeType: "overdue" };
  }

  if (daysLeft <= WARN_DAYS) {
    return { label: `${daysLeft} kun qoldi`, badgeType: "approaching" };
  }

  return { label: `${daysLeft} kun qoldi`, badgeType: "ok" };
};
