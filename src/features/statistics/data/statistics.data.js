/** Period filter options for the statistics page */
export const PERIOD_OPTIONS = [
  { value: "7",   label: "7 kun" },
  { value: "30",  label: "30 kun" },
  { value: "90",  label: "90 kun" },
  { value: "365", label: "1 yil" },
];

/** Recharts hex colors for request statuses */
export const REQUEST_STATUS_COLORS = {
  pending:   "#EAB308",
  in_review: "#3B82F6",
  resolved:  "#22C55E",
  rejected:  "#EF4444",
  cancelled: "#9CA3AF",
};

/** Request status Uzbek labels */
export const REQUEST_STATUS_LABELS = {
  pending:   "Kutilmoqda",
  in_review: "Ko'rib chiqilmoqda",
  resolved:  "Yechildi",
  rejected:  "Rad etildi",
  cancelled: "Bekor qilingan",
};

/** Recharts hex colors for service report statuses */
export const SERVICE_STATUS_COLORS = {
  unavailable:          "#EF4444",
  in_progress:          "#EAB308",
  pending_confirmation: "#3B82F6",
  confirmed:            "#22C55E",
  rejected:             "#F97316",
  cancelled:            "#9CA3AF",
};

/** Service report status Uzbek labels */
export const SERVICE_STATUS_LABELS = {
  unavailable:          "Mavjud emas",
  in_progress:          "Jarayonda",
  pending_confirmation: "Tasdiq kutilmoqda",
  confirmed:            "Tasdiqlandi",
  rejected:             "Rad etildi",
  cancelled:            "Bekor qilingan",
};

/** Recharts hex colors for MSK order statuses */
export const MSK_STATUS_COLORS = {
  pending:              "#EAB308",
  in_review:            "#3B82F6",
  pending_confirmation: "#6366F1",
  confirmed:            "#22C55E",
  rejected:             "#EF4444",
  cancelled:            "#9CA3AF",
};

/** MSK order status Uzbek labels */
export const MSK_STATUS_LABELS = {
  pending:              "Kutilmoqda",
  in_review:            "Ko'rib chiqilmoqda",
  pending_confirmation: "Tasdiq kutilmoqda",
  confirmed:            "Tasdiqlandi",
  rejected:             "Rad etildi",
  cancelled:            "Bekor qilingan",
};

/** KPI card config for StatsOverview */
export const KPI_CONFIG = [
  { key: "requests", label: "Murojaatlar",            iconColor: "bg-blue-50 text-blue-600" },
  { key: "services", label: "Xizmat arizalari",       iconColor: "bg-yellow-50 text-yellow-600" },
  { key: "msk",      label: "MSK buyurtmalar",        iconColor: "bg-pink-50 text-pink-600" },
  { key: "users",    label: "Faol foydalanuvchilar",  iconColor: "bg-green-50 text-green-600" },
];

/** Recharts hex colors for user statuses */
export const USER_STATUS_COLORS = {
  active:   "#22C55E",
  inactive: "#EF4444",
};

/** User status Uzbek labels */
export const USER_STATUS_LABELS = {
  active:   "Faol",
  inactive: "Nofaol",
};

/** Shared chart colors for area/bar series */
export const CHART_COLORS = {
  primary:   "#3B82F6",
  secondary: "#22C55E",
  accent:    "#F59E0B",
  purple:    "#8B5CF6",
};

/** Request category Uzbek labels */
export const REQUEST_CATEGORY_LABELS = {
  infrastructure: "Infratuzilma",
  social:         "Ijtimoiy",
  finance:        "Moliya",
};

/** Harvest season Uzbek labels */
export const HARVEST_SEASON_LABELS = {
  bahor: "Bahor",
  yoz:   "Yoz",
  kuz:   "Kuz",
  qish:  "Qish",
};

/** Harvest season select options */
export const HARVEST_SEASON_OPTIONS = [
  { value: "bahor", label: "Bahor" },
  { value: "yoz",   label: "Yoz" },
  { value: "kuz",   label: "Kuz" },
  { value: "qish",  label: "Qish" },
];

/** Region sort select options */
export const REGION_SORT_OPTIONS = [
  { value: "total",    label: "Barchasi" },
  { value: "requests", label: "Murojaatlar" },
  { value: "services", label: "Xizmatlar" },
  { value: "msk",      label: "MSK" },
];

/** Region module filter options */
export const REGION_MODULE_OPTIONS = [
  { value: "",         label: "Barchasi" },
  { value: "requests", label: "Murojaatlar" },
  { value: "services", label: "Xizmat arizalari" },
  { value: "msk",      label: "MSK buyurtmalar" },
];
