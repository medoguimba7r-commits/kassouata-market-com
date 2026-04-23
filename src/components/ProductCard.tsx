import { MessageCircle, Store, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  price?: string;
  seller: string;
  sellerId: string;
  contactWhatsapp?: string | null;
  index: number;
}

const ProductCard = ({ id, image, name, price, seller, sellerId, contactWhatsapp, index }: ProductCardProps) => {
  const { user } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleContact = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (user.id === sellerId) {
      toast({ title: t("ownProduct") });
      return;
    }

    // If WhatsApp is available, open it
    if (contactWhatsapp) {
      window.open(`https://wa.me/${contactWhatsapp}`, "_blank");
      return;
    }

    // Otherwise create/find conversation
    try {
      const p1 = user.id < sellerId ? user.id : sellerId;
      const p2 = user.id < sellerId ? sellerId : user.id;

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("participant_1", p1)
        .eq("participant_2", p2)
        .maybeSingle();

      if (existing) {
        navigate("/messages");
      } else {
        await supabase.from("conversations").insert({
          participant_1: p1,
          participant_2: p2,
          product_id: id,
        });
        navigate("/messages");
      }
    } catch {
      toast({ title: t("error"), variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Store className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <button className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
          <Heart className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-card-foreground truncate">{name}</h3>
        {price && <p className="text-secondary font-bold mt-1">{price}</p>}
        <p className="text-sm text-muted-foreground mt-1">{seller}</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleContact}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {t("contact")}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
