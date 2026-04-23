import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Camera, X, ImagePlus, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import RichTextEditor from "@/components/RichTextEditor";
import { useQuery } from "@tanstack/react-query";
import { PRODUCT_CATEGORIES, getCategoryLabel, ProductCategory } from "@/lib/categories";

const CreateProduct = () => {
  const { user } = useAuth();
  const { t, language } = useSettings();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: shop } = useQuery({
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

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-12">
          <div className="container text-center py-20">
            <p className="text-muted-foreground mb-4">{t("needCreateShopFirst")}</p>
            <button
              onClick={() => navigate("/create-shop")}
              className="gradient-primary px-6 py-3 rounded-xl font-heading font-semibold text-primary-foreground"
            >
              {t("createMyShop")}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast({ title: t("maxPhotos"), variant: "destructive" });
      return;
    }
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);
    setPreviews(newImages.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newImages.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !shop || images.length === 0) {
      toast({ title: t("addAtLeastPhoto"), variant: "destructive" });
      return;
    }
    if (!category) {
      toast({ title: t("selectCategory"), variant: "destructive" });
      return;
    }
    setSubmitting(true);

    try {
      const imageUrls: string[] = [];
      for (const file of images) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      const { error } = await supabase.from("products").insert({
        shop_id: shop.id,
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        price: price ? parseInt(price) : null,
        category,
        images: imageUrls,
        contact_whatsapp: contactWhatsapp.trim() || null,
        contact_phone: contactPhone.trim() || null,
      });
      if (error) throw error;

      toast({ title: t("productPublished") });
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
          <h1 className="font-heading font-bold text-3xl text-foreground mb-6">{t("publishProduct")}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <label className="block text-sm font-medium text-foreground mb-3">
                <Camera className="w-4 h-4 inline mr-1" /> {t("photos")} *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                    <ImagePlus className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">{t("addPhoto")}</span>
                    <input type="file" accept="image/*" onChange={handleImageAdd} className="hidden" multiple />
                  </label>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t("productName")} *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("exProductName")}
                  required
                  maxLength={150}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <Tag className="w-4 h-4 inline mr-1" /> {t("category")} *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRODUCT_CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                        category === c
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {getCategoryLabel(c, language)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t("description")}</label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder={t("describeProductRich")}
                />
                <p className="text-xs text-muted-foreground mt-1">{t("describeHelp")}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t("priceFcfa")}</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={t("exPrice")}
                  min={0}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
              <label className="block text-sm font-medium text-foreground">{t("sellerContact")}</label>
              <input
                type="text"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                placeholder={t("whatsappNumber")}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder={t("phoneNumber")}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !name.trim() || images.length === 0 || !category}
              className="w-full gradient-primary py-3 rounded-xl font-heading font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? t("publishing") : t("publishProductBtn")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateProduct;
