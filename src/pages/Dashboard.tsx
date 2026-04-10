import Navbar from "@/components/Navbar";
import { Plus, Package, Eye, MessageCircle, TrendingUp } from "lucide-react";

const stats = [
  { icon: Package, label: "Produits", value: "0" },
  { icon: Eye, label: "Vues", value: "0" },
  { icon: MessageCircle, label: "Messages", value: "0" },
  { icon: TrendingUp, label: "Ventes", value: "0" },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground">Ma Boutique</h1>
              <p className="text-muted-foreground mt-1">Gérez vos produits et ventes</p>
            </div>
            <button className="gradient-primary px-5 py-2.5 rounded-xl font-heading font-semibold text-sm text-primary-foreground flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Ajouter Produit
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-xl border border-border p-5">
                <s.icon className="w-5 h-5 text-primary mb-2" />
                <div className="font-heading font-bold text-2xl text-card-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          <div className="bg-card rounded-2xl border border-border border-dashed p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-heading font-semibold text-xl text-card-foreground mb-2">
              Aucun produit publié
            </h2>
            <p className="text-muted-foreground mb-6">
              Commencez à vendre en ajoutant votre premier produit.
            </p>
            <button className="gradient-primary px-6 py-3 rounded-xl font-heading font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Publier mon premier produit
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
