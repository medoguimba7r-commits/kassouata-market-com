import { useState } from "react";
import { Menu, X, Search, MessageCircle, Store, User, LogOut, LogIn, Settings as SettingsIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useSettings();

  const navItems = [
    { to: "/", label: t("home"), icon: Store },
    { to: "/marketplace", label: t("marketplace"), icon: Search },
    ...(user
      ? [
          { to: "/messages", label: t("messages"), icon: MessageCircle },
          { to: "/dashboard", label: t("myShop"), icon: User },
        ]
      : []),
    { to: "/settings", label: t("settings"), icon: SettingsIcon },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Kassouata" className="h-10 w-10 rounded-lg" />
          <span className="font-heading font-bold text-xl text-gradient">Kassouata</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t("logout")}
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium gradient-primary text-primary-foreground"
            >
              <LogIn className="w-4 h-4" />
              {t("login")}
            </Link>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-muted">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    location.pathname === item.to
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  {t("logout")}
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium gradient-primary text-primary-foreground"
                >
                  <LogIn className="w-5 h-5" />
                  {t("login")}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
