import { useState } from "react";

const categories = [
  "Tout", "Mode", "Beauté", "Bijoux", "Artisanat", "Maison", "Alimentation", "Électronique"
];

const CategoryBar = () => {
  const [active, setActive] = useState("Tout");

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            active === cat
              ? "gradient-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;
