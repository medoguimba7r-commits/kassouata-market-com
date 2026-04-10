import HeroSection from "@/components/HeroSection";
import CategoryBar from "@/components/CategoryBar";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

const products = [
  { image: product1, name: "Sac en Cuir Artisanal", price: "25 000 FCFA", seller: "Boutique Amina" },
  { image: product2, name: "Tissu Wax Premium", price: "15 000 FCFA", seller: "Mode Niamey" },
  { image: product3, name: "Bijoux Traditionnels", price: "8 000 FCFA", seller: "Créations Fatou" },
  { image: product4, name: "Beurre de Karité Bio", price: "5 000 FCFA", seller: "Nature Niger" },
  { image: product5, name: "Sculpture Bois Déco", price: "35 000 FCFA", seller: "Art Sahel" },
  { image: product6, name: "Panier Tressé Main", price: "12 000 FCFA", seller: "Artisan Zinder" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />

        {/* Products Section */}
        <section className="container py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                Produits Populaires
              </h2>
              <p className="text-muted-foreground mt-1">Découvrez les meilleures offres du moment</p>
            </div>
            <CategoryBar />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p, i) => (
              <ProductCard key={i} {...p} index={i} />
            ))}
          </div>
        </section>

        {/* Footer */}
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
