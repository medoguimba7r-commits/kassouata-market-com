import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, MessageCircle, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";

interface ShopSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: string | null;
  sellerId: string;
}

const stripHtml = (html: string): string =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const buildWhatsappUrl = (num: string, productName: string, imageUrl?: string) => {
  const cleaned = num.replace(/[^\d+]/g, "");
  const text = `Bonjour, je suis intéressé(e) par votre produit: ${productName}${imageUrl ? `\n${imageUrl}` : ""}`;
  return `https://wa.me/${cleaned.replace(/^\+/, "")}?text=${encodeURIComponent(text)}`;
};

const ShopSheet = ({ open, onOpenChange, shopId, sellerId }: ShopSheetProps) => {
  const { user } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: shop } = useQuery({
    queryKey: ["shop-sheet", shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("id", shopId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!shopId && open,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["shop-sheet-products", shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_public")
        .select("*")
        .eq("shop_id", shopId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!shopId && open,
  });

  const startConversation = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (user.id === sellerId) {
      toast({ title: t("ownProduct") });
      return;
    }
    try {
      const p1 = user.id < sellerId ? user.id : sellerId;
      const p2 = user.id < sellerId ? sellerId : user.id;
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("participant_1", p1)
        .eq("participant_2", p2)
        .maybeSingle();
      if (!existing) {
        await supabase.from("conversations").insert({ participant_1: p1, participant_2: p2 });
      }
      navigate("/messages");
    } catch {
      toast({ title: t("error"), variant: "destructive" });
    }
  };

  const contactWhatsapp = async (productId: string, productName: string, imageUrl?: string) => {
    try {
      if (!user) {
        navigate("/auth");
        return;
      }
      const { data } = await supabase
        .from("products")
        .select("contact_whatsapp, contact_phone")
        .eq("id", productId)
        .maybeSingle();
      const num = data?.contact_whatsapp || data?.contact_phone;
      if (!num) {
        toast({ title: "WhatsApp indisponible", variant: "destructive" });
        return;
      }
      window.open(buildWhatsappUrl(num, productName, imageUrl), "_blank");
    } catch {
      toast({ title: t("error"), variant: "destructive" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted border border-border flex items-center justify-center flex-shrink-0">
              {shop?.logo_url ? (
                <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="text-left min-w-0">
              <SheetTitle className="truncate">{shop?.name || "Boutique"}</SheetTitle>
              {shop?.description && (
                <p className="text-xs text-muted-foreground truncate">{shop.description}</p>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t("noPublishedProduct")}</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((p: any) => (
                <div key={p.id} className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
                  <div className="aspect-square bg-muted">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col">
                    <h3 className="text-sm font-semibold text-card-foreground truncate">{p.name}</h3>
                    {p.price && (
                      <p className="text-secondary font-bold text-sm mt-0.5">
                        {p.price.toLocaleString()} FCFA
                      </p>
                    )}
                    {p.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                        {stripHtml(p.description)}
                      </p>
                    )}
                    <button
                      onClick={() => contactWhatsapp(p.id, p.name, p.images?.[0])}
                      className="mt-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      <Phone className="w-3 h-3" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-background">
          <button
            onClick={startConversation}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-5 h-5" />
            Envoyer un message au vendeur
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShopSheet;
