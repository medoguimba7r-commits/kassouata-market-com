import type { Language } from "@/contexts/SettingsContext";

export const PRODUCT_CATEGORIES = [
  "fashion",
  "beauty",
  "jewelry",
  "crafts",
  "home",
  "food",
  "electronics",
  "other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

const labels: Record<ProductCategory, Record<Language, string>> = {
  fashion: { fr: "Mode", en: "Fashion", ar: "الموضة" },
  beauty: { fr: "Beauté", en: "Beauty", ar: "الجمال" },
  jewelry: { fr: "Bijoux", en: "Jewelry", ar: "المجوهرات" },
  crafts: { fr: "Artisanat", en: "Crafts", ar: "الحرف اليدوية" },
  home: { fr: "Maison", en: "Home", ar: "المنزل" },
  food: { fr: "Alimentation", en: "Food", ar: "الطعام" },
  electronics: { fr: "Électronique", en: "Electronics", ar: "الإلكترونيات" },
  other: { fr: "Autre", en: "Other", ar: "أخرى" },
};

export const getCategoryLabel = (cat: string | null | undefined, lang: Language): string => {
  if (!cat) return "";
  const key = cat as ProductCategory;
  return labels[key]?.[lang] ?? cat;
};

export const getAllLabel = (lang: Language) =>
  ({ fr: "Tout", en: "All", ar: "الكل" } as const)[lang];
