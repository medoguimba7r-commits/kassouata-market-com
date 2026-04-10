import { Search } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import ProductCard from "@/components/ProductCard";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

const allProducts = [
  { image: product1, name: "Sac en Cuir Artisanal", price: "25 000 FCFA", seller: "Boutique Amina" },
  { image: product2, name: "Tissu Wax Premium", price: "15 000 FCFA", seller: "Mode Niamey" },
  { image: product3, name: "Bijoux Traditionnels", price: "8 000 FCFA", seller: "Créations Fatou" },
  { image: product4, name: "Beurre de Karité Bio", price: "5 000 FCFA", seller: "Nature Niger" },
  { image: product5, name: "Sculpture Bois Déco", price: "35 000 FCFA", seller: "Art Sahel" },
  { image: product6, name: "Panier Tressé Main", price: "12 000 FCFA", seller: "Artisan Zinder" },
];

const Marketplace = () => {
  const [search, setSearch] = useState("");

  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container">
          <h1 className="font-heading font-bold text-3xl text-foreground mb-6">Marketplace</h1>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="mb-6">
            <CategoryBar />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p, i) => (
              <ProductCard key={i} {...p} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              Aucun produit trouvé pour "{search}"
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
