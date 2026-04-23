import { Search } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import ProductCard from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/contexts/SettingsContext";
import { ProductCategory } from "@/lib/categories";

const Marketplace = () => {
  const { t } = useSettings();
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<ProductCategory | "all">("all");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["marketplace-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, shops(name)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === "all" || p.category === activeCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container">
          <h1 className="font-heading font-bold text-3xl text-foreground mb-6">{t("marketplace")}</h1>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("searchProduct")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="mb-6">
            <CategoryBar active={activeCat} onChange={setActiveCat} />
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">{t("loading")}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-2">
                {search ? `${t("noProductFor")} "${search}"` : t("noProductsYet")}
              </p>
              <p className="text-sm text-muted-foreground">{t("beFirstPublish")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  image={p.images[0] || ""}
                  name={p.name}
                  price={p.price ? `${p.price.toLocaleString()} FCFA` : undefined}
                  seller={p.shops?.name || "Vendeur"}
                  sellerId={p.user_id}
                  contactWhatsapp={p.contact_whatsapp}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
