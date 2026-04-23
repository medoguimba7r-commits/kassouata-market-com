import { PRODUCT_CATEGORIES, getCategoryLabel, getAllLabel, ProductCategory } from "@/lib/categories";
import { useSettings } from "@/contexts/SettingsContext";

interface CategoryBarProps {
  active?: ProductCategory | "all";
  onChange?: (cat: ProductCategory | "all") => void;
}

const CategoryBar = ({ active = "all", onChange }: CategoryBarProps) => {
  const { language } = useSettings();
  const items: Array<{ value: ProductCategory | "all"; label: string }> = [
    { value: "all", label: getAllLabel(language) },
    ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: getCategoryLabel(c, language) })),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange?.(item.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            active === item.value
              ? "gradient-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;
