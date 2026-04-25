import HeroSection from "@/components/HeroSection";
import CategoryBar from "@/components/CategoryBar";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/contexts/SettingsContext";
import { useState } from "react";
import { ProductCategory } from "@/lib/categories";

const Index = () => {
  const { t } = useSettings();
  const [activeCat, setActiveCat] = useState<ProductCategory | "all">("all");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["home-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, shops(name)")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(24);
      if (error) throw error;
      return data;
    },
  });

  const filtered = (activeCat === "all" ? products : products.filter((p) => p.category === activeCat)).slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />

        <section className="container py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                {t("recentProducts")}
              </h2>
              <p className="text-muted-foreground mt-1">{t("recentDesc")}</p>
            </div>
            <CategoryBar active={activeCat} onChange={setActiveCat} />
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">{t("loading")}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">{t("noProductsYet")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("beFirst")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  image={p.images[0] || ""}
                  name={p.name}
                  description={p.description}
                  price={p.price ? `${p.price.toLocaleString()} FCFA` : undefined}
                  seller={p.shops?.name || "Vendeur"}
                  sellerId={p.user_id}
                  contactWhatsapp={p.contact_whatsapp}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="border-t border-border py-8">
          <div className="container text-center">
            <p className="text-sm text-muted-foreground">
              {t("footerText")} <span className="font-semibold text-foreground">MHD</span>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
