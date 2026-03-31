export const ALL_VALUE = "__all__";

/** Filter options for house type dropdown */
export const HOUSE_TYPE_OPTIONS = [
  { value: ALL_VALUE, label: "Barcha uy turlari" },
  { value: "private", label: "Hovli/Uy" },
  { value: "apartment", label: "Ko'p qavatli" },
];

/** Filter options for active status dropdown */
export const ACTIVE_OPTIONS = [
  { value: ALL_VALUE, label: "Barcha holatlar" },
  { value: "true", label: "Faol" },
  { value: "false", label: "Nofaol" },
];

/** Human-readable labels for houseType values */
export const HOUSE_TYPE_LABELS = {
  private: "Hovli/Uy",
  apartment: "Ko'p qavatli",
};

/** Tailwind badge classes for houseType values */
export const HOUSE_TYPE_COLORS = {
  private: "bg-orange-100 text-orange-700",
  apartment: "bg-blue-100 text-blue-700",
};
