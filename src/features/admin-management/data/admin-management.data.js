/** Tab navigatsiya konfiguratsiyasi */
export const TABS = [
  { path: "malumotlar", label: "Ma'lumotlar" },
  { path: "hudud-ruxsati", label: "Hudud ruxsatlari" },
  { path: "murojaat-ruxsati", label: "Murojaat ruxsatlari" },
  { path: "servis-ruxsati", label: "Servis ruxsatlari" },
  { path: "msk-ruxsati", label: "MSK buyurtma ruxsatlari" },
];

/** Hudud turi yorliqlari */
export const REGION_TYPE_LABELS = {
  region: "Viloyat",
  district: "Tuman",
  neighborhood: "Mahalla",
  street: "Ko'cha",
};

/** Ruxsat darajasi yorliqlari */
export const ACCESS_LABELS = {
  off: "O'chirilgan",
  read: "Faqat ko'rish",
  manage: "Boshqarish",
};
