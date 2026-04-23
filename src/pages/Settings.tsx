import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Globe, Trash2, Info, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSettings, Language } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { theme, setTheme, language, setLanguage, t } = useSettings();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
  ];

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Delete shop (cascades to products via FK if configured, otherwise manual)
      await supabase.from("products").delete().eq("user_id", user.id);
      await supabase.from("shops").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("user_id", user.id);
      await signOut();
      toast({ title: t("accountDeleted"), description: t("dataDeleted") });
      navigate("/");
    } catch (error: any) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container max-w-2xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> {t("back")}
          </button>
          <h1 className="font-heading font-bold text-3xl text-foreground mb-6">{t("settings")}</h1>

          {/* Theme */}
          <section className="bg-card rounded-2xl border border-border p-5 mb-4">
            <h2 className="font-heading font-semibold text-lg text-foreground mb-3">{t("theme")}</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
                  theme === "light"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Sun className="w-5 h-5" /> {t("lightMode")}
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
                  theme === "dark"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Moon className="w-5 h-5" /> {t("darkMode")}
              </button>
            </div>
          </section>

          {/* Language */}
          <section className="bg-card rounded-2xl border border-border p-5 mb-4">
            <h2 className="font-heading font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5" /> {t("language")}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border transition-colors ${
                    language === l.code
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-2xl">{l.flag}</span>
                  <span className="text-sm font-medium">{l.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* About */}
          <section className="bg-card rounded-2xl border border-border p-5 mb-4">
            <h2 className="font-heading font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" /> {t("aboutDeveloper")}
            </h2>
            <p className="text-foreground font-medium">{t("developerName")}</p>
            <p className="text-muted-foreground text-sm mt-1">{t("platform")}</p>
            <p className="text-muted-foreground text-sm mt-1">{t("vision")}</p>
          </section>

          {/* Delete account */}
          {user && (
            <section className="bg-card rounded-2xl border border-destructive/30 p-5">
              <h2 className="font-heading font-semibold text-lg text-destructive mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> {t("deleteAccount")}
              </h2>
              <p className="text-muted-foreground text-sm mb-4">{t("deleteWarning")}</p>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-2 rounded-xl border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors font-medium"
                >
                  {t("deleteAccount")}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 font-medium disabled:opacity-50"
                  >
                    {deleting ? "..." : t("confirm")}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-muted font-medium"
                  >
                    {t("cancel")}
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
