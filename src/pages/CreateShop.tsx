import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Store, ImagePlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const CreateShop = () => {
  const { user } = useAuth();
  const { t } = useSettings();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("error"), description: "Max 5MB", variant: "destructive" });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      let logo_url: string | null = null;

      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `${user.id}/shop-logo-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, logoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        logo_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("shops").insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        logo_url,
      });
      if (error) throw error;
      toast({ title: t("shopCreated"), description: t("canPublishNow") });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-foreground">{t("createMyShop")}</h1>
            <p className="text-muted-foreground mt-2">{t("giveShopName")}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4">
            {/* Shop logo */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("shopLogo")} ({t("optional")})
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-border bg-background flex items-center justify-center flex-shrink-0">
                  {logoPreview ? (
                    <>
                      <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <Store className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <label className="flex-1 cursor-pointer px-4 py-3 rounded-xl border border-border bg-background hover:bg-muted transition-colors text-center text-sm font-medium text-foreground flex items-center justify-center gap-2">
                  <ImagePlus className="w-4 h-4" />
                  {logoPreview ? t("changeLogo") : t("addLogo")}
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("shopName")} *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("exShopName")}
                required
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("description")} ({t("optional")})
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("describeShop")}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full gradient-primary py-3 rounded-xl font-heading font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? t("creating") : t("createMyShop")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateShop;
