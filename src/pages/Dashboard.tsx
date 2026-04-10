import Navbar from "@/components/Navbar";
import { Plus, Package, Eye, MessageCircle, TrendingUp, Trash2, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["my-shop", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["my-products", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-messages", user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("messages")
        .select("*, conversations!inner(*)", { count: "exact", head: true })
        .neq("sender_id", user!.id)
        .eq("is_read", false)
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`, { referencedTable: "conversations" });
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      toast({ title: "Produit supprimé" });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("products").update({ is_published: published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
  });

  const totalViews = products.reduce((sum, p) => sum + (p.views_count || 0), 0);

  const stats = [
    { icon: Package, label: "Produits", value: String(products.length) },
    { icon: Eye, label: "Vues", value: String(totalViews) },
    { icon: MessageCircle, label: "Messages", value: String(unreadCount) },
    { icon: TrendingUp, label: "Publiés", value: String(products.filter((p) => p.is_published).length) },
  ];

  if (shopLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-12">
          <div className="container max-w-lg text-center py-12">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-foreground mb-2">Créez votre boutique</h1>
            <p className="text-muted-foreground mb-6">
              Pour publier des produits, vous devez d'abord créer votre boutique.
            </p>
            <button
              onClick={() => navigate("/create-shop")}
              className="gradient-primary px-6 py-3 rounded-xl font-heading font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Créer ma boutique
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground">{shop.name}</h1>
              <p className="text-muted-foreground mt-1">{shop.description || "Gérez vos produits et ventes"}</p>
            </div>
            <button
              onClick={() => navigate("/create-product")}
              className="gradient-primary px-5 py-2.5 rounded-xl font-heading font-semibold text-sm text-primary-foreground flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-xl border border-border p-5">
                <s.icon className="w-5 h-5 text-primary mb-2" />
                <div className="font-heading font-bold text-2xl text-card-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {products.length === 0 ? (
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
              <button
                onClick={() => navigate("/create-product")}
                className="gradient-primary px-6 py-3 rounded-xl font-heading font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Publier mon premier produit
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="bg-card rounded-xl border border-border p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-card-foreground truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.price ? `${product.price.toLocaleString()} FCFA` : "Prix non défini"}
                      {!product.is_published && " • Non publié"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePublishMutation.mutate({ id: product.id, published: !product.is_published })}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title={product.is_published ? "Masquer" : "Publier"}
                    >
                      {product.is_published ? (
                        <ToggleRight className="w-5 h-5 text-secondary" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(product.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
