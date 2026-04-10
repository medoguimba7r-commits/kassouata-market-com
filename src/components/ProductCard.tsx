import { MessageCircle, Store, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  image: string;
  name: string;
  price?: string;
  seller: string;
  index: number;
}

const ProductCard = ({ image, name, price, seller, index }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
          <Heart className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-card-foreground truncate">{name}</h3>
        {price && (
          <p className="text-secondary font-bold mt-1">{price}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">{seller}</p>
        <div className="flex gap-2 mt-3">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <MessageCircle className="w-3.5 h-3.5" />
            Contacter
          </button>
          <button className="flex items-center justify-center p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Store className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
