import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";

const stats = [
  { icon: ShoppingBag, label: "Produits", value: "500+" },
  { icon: Users, label: "Vendeurs", value: "100+" },
  { icon: TrendingUp, label: "Ventes", value: "1K+" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-6"
          >
            <img src={logo} alt="Kassouata" className="h-14 w-14 rounded-xl shadow-lg" />
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium border border-accent/30">
              Le marketplace africain 🌍
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="font-heading font-extrabold text-4xl md:text-6xl leading-tight text-background mb-6"
          >
            Vendez & Achetez
            <br />
            <span className="text-accent">en toute confiance</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-background/80 mb-8 max-w-lg"
          >
            La plateforme de marketing digital pensée pour l'Afrique.
            Créez votre boutique, publiez vos produits et connectez-vous avec vos clients.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/marketplace"
              className="gradient-primary px-6 py-3 rounded-xl font-heading font-semibold text-background flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
            >
              Découvrir le Marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-xl font-heading font-semibold text-background border-2 border-background/30 hover:bg-background/10 transition-colors flex items-center gap-2"
            >
              Ouvrir ma Boutique
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex gap-8 mt-12"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-5 h-5 text-accent mx-auto mb-1" />
                <div className="font-heading font-bold text-2xl text-background">{s.value}</div>
                <div className="text-sm text-background/60">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
