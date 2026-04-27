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
  images?: string[];
  name: string;
  description?: string | null;
  price?: string;
  seller: string;
  sellerId: string;
  index: number;
}

// Mosaic layout for up to 5 images, separated by very subtle (almost invisible) gaps.
const ImageMosaic = ({ images, name }: { images: string[]; name: string }) => {
  const imgs = images.slice(0, 5);
  const count = imgs.length;

  // Tiny gap acts as the "invisible" separator line between tiles.
  const gap = "gap-[1px] bg-border/30";
  const imgClass = "w-full h-full object-cover";

  if (count <= 1) {
    return (
      <img
        src={imgs[0]}
        alt={name}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    );
  }

  if (count === 2) {
    return (
      <div className={`grid grid-cols-2 w-full h-full ${gap}`}>
        {imgs.map((src, i) => (
          <img key={i} src={src} alt={`${name} ${i + 1}`} loading="lazy" className={imgClass} />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className={`grid grid-cols-2 grid-rows-2 w-full h-full ${gap}`}>
        <img src={imgs[0]} alt={`${name} 1`} loading="lazy" className={`${imgClass} row-span-2`} />
        <img src={imgs[1]} alt={`${name} 2`} loading="lazy" className={imgClass} />
        <img src={imgs[2]} alt={`${name} 3`} loading="lazy" className={imgClass} />
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className={`grid grid-cols-2 grid-rows-2 w-full h-full ${gap}`}>
        {imgs.map((src, i) => (
          <img key={i} src={src} alt={`${name} ${i + 1}`} loading="lazy" className={imgClass} />
        ))}
      </div>
    );
  }

  // 5 images: 1 large left, 4 small stacked on right (2x2)
  return (
    <div className={`grid grid-cols-3 grid-rows-2 w-full h-full ${gap}`}>
      <img src={imgs[0]} alt={`${name} 1`} loading="lazy" className={`${imgClass} col-span-2 row-span-2`} />
      <img src={imgs[1]} alt={`${name} 2`} loading="lazy" className={imgClass} />
      <img src={imgs[2]} alt={`${name} 3`} loading="lazy" className={imgClass} />
      <img src={imgs[3]} alt={`${name} 4`} loading="lazy" className={imgClass} />
      <img src={imgs[4]} alt={`${name} 5`} loading="lazy" className={imgClass} />
    </div>
  );
};

// Strip HTML tags from rich text description for safe preview display
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const ProductCard = ({ id, image, images, name, description, price, seller, sellerId, index }: ProductCardProps) => {
  const allImages = (images && images.length > 0) ? images : (image ? [image] : []);
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

    // Lazily fetch WhatsApp contact (only authenticated users can read it via RLS).
    try {
      const { data: productRow } = await supabase
        .from("products")
        .select("contact_whatsapp")
        .eq("id", id)
        .maybeSingle();

      if (productRow?.contact_whatsapp) {
        window.open(`https://wa.me/${productRow.contact_whatsapp}`, "_blank");
        return;
      }
    } catch {
      // Fall through to conversation flow if contact lookup fails.
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
      <div className="relative aspect-square overflow-hidden bg-muted">
        {allImages.length > 0 ? (
          <ImageMosaic images={allImages} name={name} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
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
        {description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {stripHtml(description)}
          </p>
        )}
        <p className="text-xs text-muted-foreground/80 mt-1.5 italic truncate">{seller}</p>
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
