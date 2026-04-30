import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, Store, Package, MessageCircle, Trash2, Eye, EyeOff, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Tab = "stats" | "users" | "shops" | "products" | "messages";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const [tab, setTab] = useState<Tab>("stats");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: shops = [] } = useQuery({
    queryKey: ["admin-shops"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shops").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: messagesCount = 0 } = useQuery({
    queryKey: ["admin-messages-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("messages").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: isAdmin,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["admin-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: isAdmin && tab === "messages",
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Produit supprimé" });
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("products").update({ is_published: published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const deleteShop = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shops").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-shops"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Boutique supprimée" });
    },
  });

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const stats = [
    { icon: Users, label: "Utilisateurs", value: profiles.length, color: "text-primary" },
    { icon: Store, label: "Boutiques", value: shops.length, color: "text-secondary" },
    { icon: Package, label: "Produits", value: products.length, color: "text-accent" },
    { icon: MessageCircle, label: "Messages", value: messagesCount, color: "text-primary" },
  ];

  const tabs: { id: Tab; label: string; icon: typeof Shield }[] = [
    { id: "stats", label: "Statistiques", icon: BarChart3 },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "shops", label: "Boutiques", icon: Store },
    { id: "products", label: "Produits", icon: Package },
    { id: "messages", label: "Messages", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">Tableau de contrôle</h1>
              <p className="text-sm text-muted-foreground">Administration de Kassouata</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {tab === "stats" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-card rounded-xl border border-border p-5">
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <div className="font-heading font-bold text-3xl text-card-foreground">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-2">
              {profiles.map((p) => (
                <div key={p.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {p.avatar_url && <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-card-foreground truncate">{p.display_name || "Sans nom"}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {p.phone || p.whatsapp || "Aucun contact"}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "shops" && (
            <div className="space-y-2">
              {shops.map((s) => (
                <div key={s.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {s.logo_url && <img src={s.logo_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-card-foreground truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.description || "—"}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer la boutique "${s.name}" ?`)) deleteShop.mutate(s.id);
                    }}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "products" && (
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-card-foreground truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.price ? `${p.price.toLocaleString()} FCFA` : "Prix non défini"}
                      {!p.is_published && " • Masqué"} • {p.views_count || 0} vues
                    </div>
                  </div>
                  <button
                    onClick={() => togglePublish.mutate({ id: p.id, published: !p.is_published })}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title={p.is_published ? "Masquer" : "Publier"}
                  >
                    {p.is_published ? (
                      <Eye className="w-4 h-4 text-secondary" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer "${p.name}" ?`)) deleteProduct.mutate(p.id);
                    }}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "messages" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">{messagesCount} messages au total • 50 conversations récentes</p>
              {conversations.map((c) => (
                <div key={c.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="text-sm font-medium text-card-foreground">Conversation #{c.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Mis à jour : {new Date(c.updated_at).toLocaleString()}
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

export default Admin;
