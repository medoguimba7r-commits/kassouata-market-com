import HeroSection from "@/components/HeroSection";
import CategoryBar from "@/components/CategoryBar";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["home-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, shops(name)")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />

        <section className="container py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                Produits Récents
              </h2>
              <p className="text-muted-foreground mt-1">Découvrez les dernières publications</p>
            </div>
            <CategoryBar />
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Chargement...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Aucun produit disponible pour le moment.</p>
              <p className="text-sm text-muted-foreground mt-1">Soyez le premier à publier !</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((p, i) => (
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
        </section>

        <footer className="border-t border-border py-8">
          <div className="container text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 Kassouata — Marketing digital africain moderne par <span className="font-semibold text-foreground">MHD</span>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
