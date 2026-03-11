/**
 * Profil sahifasi tab konfiguratsiyasi
 */
export const PROFILE_TABS = [
  { path: "malumotlar", label: "Ma'lumotlar" },
  { path: "ruxsatlar", label: "Ruxsatlar" },
  { path: "parol", label: "Parolni o'zgartirish" },
];

export const ACCESS_LABELS = {
  off: "O'chirilgan",
  read: "Faqat ko'rish",
  manage: "Boshqarish",
};

export const ACCESS_COLORS = {
  off: "bg-gray-100 text-gray-600",
  read: "bg-blue-50 text-blue-700",
  manage: "bg-green-50 text-green-700",
};

export const REGION_TYPE_LABELS = {
  region: "Viloyat",
  district: "Tuman",
  neighborhood: "Mahalla",
  street: "Ko'cha",
};
