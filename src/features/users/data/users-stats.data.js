/**
 * KPI card konfiguratsiyasi — UserStatsKPICards komponentida ishlatiladi.
 */
export const DEMOGRAPHICS_KPI_CONFIG = [
  {
    key: "totalUsers",
    label: "Jami foydalanuvchilar",
    color: "blue",
    icon: "Users",
  },
  {
    key: "activeUsers",
    label: "Faol foydalanuvchilar",
    color: "green",
    icon: "UserCheck",
  },
  {
    key: "inactiveUsers",
    label: "Nofaol foydalanuvchilar",
    color: "red",
    icon: "UserX",
  },
  {
    key: "totalHouseholds",
    label: "Jami xonadonlar",
    color: "purple",
    icon: "Home",
  },
  {
    key: "privateHouseholds",
    label: "Hovli/Uy xonadonlar",
    color: "orange",
    icon: "House",
  },
  {
    key: "apartmentHouseholds",
    label: "Ko'p qavatli xonadonlar",
    color: "sky",
    icon: "Building2",
  },
];

/**
 * Jadval ustun konfiguratsiyasi — UserDemographicsTable komponentida ishlatiladi.
 */
export const DEMOGRAPHICS_TABLE_COLUMNS = [
  { key: "index", label: "#", align: "left" },
  { key: "name", label: "Hudud nomi", align: "left" },
  { key: "totalUsers", label: "Jami", align: "center" },
  { key: "activeUsers", label: "Faol", align: "center" },
  { key: "inactiveUsers", label: "Nofaol", align: "center" },
  { key: "totalHouseholds", label: "Xonadonlar", align: "center" },
  { key: "privateHouseholds", label: "Hovli/Uy", align: "center" },
  { key: "apartmentHouseholds", label: "Ko'p qavatli", align: "center" },
  { key: "activityRate", label: "Faollik %", align: "center" },
];

/**
 * Recharts uchun xonadon turlari ranglari.
 */
export const HOUSEHOLD_COLORS = {
  private: "#F97316",
  apartment: "#3B82F6",
};
