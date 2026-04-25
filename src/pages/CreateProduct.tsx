import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Camera, X, ImagePlus, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import RichTextEditor from "@/components/RichTextEditor";
import { useQuery } from "@tanstack/react-query";
import { PRODUCT_CATEGORIES, ProductCategory, getCategoryLabel } from "@/lib/categories";

const CreateProduct = () => {
  const { user } = useAuth();
  const { t, language } = useSettings();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id: editId } = useParams<{ id: string }>();
  const isEdit = Boolean(editId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);

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

  // Load existing product when editing
  useEffect(() => {
    const loadProduct = async () => {
      if (!isEdit || !editId || !user) return;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", editId)
        .maybeSingle();
      if (error || !data) {
        toast({ title: t("productNotFound"), variant: "destructive" });
        navigate("/dashboard");
        return;
      }
      if (data.user_id !== user.id) {
        navigate("/dashboard");
        return;
      }
      setName(data.name);
      setDescription(data.description || "");
      setPrice(data.price ? String(data.price) : "");
      setCategory((data.category as ProductCategory) || "");
      setContactWhatsapp(data.contact_whatsapp || "");
      setContactPhone(data.contact_phone || "");
      setExistingImages(data.images || []);
      setLoadingProduct(false);
    };
    loadProduct();
  }, [isEdit, editId, user, navigate, toast, t]);

  if (!shop && !isEdit) {
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

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const totalImagesCount = existingImages.length + newImages.length;

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (totalImagesCount + files.length > 5) {
      toast({ title: t("maxPhotos"), variant: "destructive" });
      return;
    }
    const updated = [...newImages, ...files].slice(0, 5 - existingImages.length);
    setNewImages(updated);
    setNewPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const removeNewImage = (index: number) => {
    const updated = newImages.filter((_, i) => i !== index);
    setNewImages(updated);
    setNewPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (totalImagesCount === 0) {
      toast({ title: t("addAtLeastPhoto"), variant: "destructive" });
      return;
    }
    if (!category) {
      toast({ title: t("selectCategory"), variant: "destructive" });
      return;
    }
    setSubmitting(true);

    try {
      // Upload any new images
      const uploadedUrls: string[] = [];
      for (const file of newImages) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }

      const finalImages = [...existingImages, ...uploadedUrls];

      if (isEdit && editId) {
        const { error } = await supabase
          .from("products")
          .update({
            name: name.trim(),
            description: description.trim() || null,
            price: price ? parseInt(price) : null,
            category,
            images: finalImages,
            contact_whatsapp: contactWhatsapp.trim() || null,
            contact_phone: contactPhone.trim() || null,
          })
          .eq("id", editId);
        if (error) throw error;
        toast({ title: t("productUpdated") });
      } else {
        if (!shop) throw new Error("Shop required");
        const { error } = await supabase.from("products").insert({
          shop_id: shop.id,
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          price: price ? parseInt(price) : null,
          category,
          images: finalImages,
          contact_whatsapp: contactWhatsapp.trim() || null,
          contact_phone: contactPhone.trim() || null,
        });
        if (error) throw error;
        toast({ title: t("productPublished") });
      }

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
          <h1 className="font-heading font-bold text-3xl text-foreground mb-6">
            {isEdit ? t("editProduct") : t("publishProduct")}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <label className="block text-sm font-medium text-foreground mb-3">
                <Camera className="w-4 h-4 inline mr-1" /> {t("photos")} *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {existingImages.map((src, i) => (
                  <div key={`existing-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {newPreviews.map((src, i) => (
                  <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {totalImagesCount < 5 && (
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
              disabled={submitting || !name.trim() || totalImagesCount === 0 || !category}
              className="w-full gradient-primary py-3 rounded-xl font-heading font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting
                ? isEdit
                  ? t("saving")
                  : t("publishing")
                : isEdit
                  ? t("saveChanges")
                  : t("publishProductBtn")}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateProduct;
