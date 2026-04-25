import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";
export type Language = "fr" | "en" | "ar";

type Translations = Record<string, Record<Language, string>>;

const translations = {
  // Navigation
  home: { fr: "Accueil", en: "Home", ar: "الرئيسية" },
  marketplace: { fr: "Marketplace", en: "Marketplace", ar: "السوق" },
  messages: { fr: "Messages", en: "Messages", ar: "الرسائل" },
  myShop: { fr: "Ma Boutique", en: "My Shop", ar: "متجري" },
  login: { fr: "Connexion", en: "Login", ar: "تسجيل الدخول" },
  logout: { fr: "Déconnexion", en: "Logout", ar: "تسجيل الخروج" },
  settings: { fr: "Paramètres", en: "Settings", ar: "الإعدادات" },

  // Settings
  theme: { fr: "Thème", en: "Theme", ar: "المظهر" },
  language: { fr: "Langue", en: "Language", ar: "اللغة" },
  lightMode: { fr: "Mode clair", en: "Light mode", ar: "الوضع الفاتح" },
  darkMode: { fr: "Mode sombre", en: "Dark mode", ar: "الوضع الداكن" },
  deleteAccount: { fr: "Supprimer le compte", en: "Delete account", ar: "حذف الحساب" },
  deleteWarning: {
    fr: "La suppression est définitive. Votre boutique et vos produits seront supprimés.",
    en: "Deletion is permanent. Your shop and products will be deleted.",
    ar: "الحذف نهائي. سيتم حذف متجرك ومنتجاتك.",
  },
  confirm: { fr: "Confirmer", en: "Confirm", ar: "تأكيد" },
  cancel: { fr: "Annuler", en: "Cancel", ar: "إلغاء" },
  back: { fr: "Retour", en: "Back", ar: "رجوع" },
  about: { fr: "À propos", en: "About", ar: "حول" },
  aboutDeveloper: { fr: "À propos du développeur", en: "About the developer", ar: "عن المطور" },
  developerName: { fr: "Développeur : MHD", en: "Developer: MHD", ar: "المطور: MHD" },
  platform: { fr: "Plateforme : Kassouata", en: "Platform: Kassouata", ar: "المنصة: كاسواتا" },
  vision: {
    fr: "Vision : marketing digital africain moderne",
    en: "Vision: modern African digital marketing",
    ar: "الرؤية: التسويق الرقمي الأفريقي الحديث",
  },
  accountDeleted: { fr: "Compte supprimé", en: "Account deleted", ar: "تم حذف الحساب" },
  dataDeleted: { fr: "Vos données ont été supprimées.", en: "Your data has been deleted.", ar: "تم حذف بياناتك." },
  error: { fr: "Erreur", en: "Error", ar: "خطأ" },

  // Hero
  heroBadge: { fr: "Le marketplace africain 🌍", en: "The African marketplace 🌍", ar: "السوق الأفريقي 🌍" },
  heroTitle1: { fr: "Vendez & Achetez", en: "Sell & Buy", ar: "بِع واشترِ" },
  heroTitle2: { fr: "en toute confiance", en: "with full confidence", ar: "بكل ثقة" },
  heroDesc: {
    fr: "La plateforme de marketing digital pensée pour l'Afrique. Créez votre boutique, publiez vos produits et connectez-vous avec vos clients.",
    en: "The digital marketing platform built for Africa. Create your shop, publish your products and connect with your customers.",
    ar: "منصة التسويق الرقمي المصممة لأفريقيا. أنشئ متجرك، انشر منتجاتك وتواصل مع عملائك.",
  },
  discoverMarketplace: { fr: "Découvrir le Marketplace", en: "Explore the Marketplace", ar: "اكتشف السوق" },
  openShop: { fr: "Ouvrir ma Boutique", en: "Open my Shop", ar: "افتح متجري" },
  statProducts: { fr: "Produits", en: "Products", ar: "المنتجات" },
  statSellers: { fr: "Vendeurs", en: "Sellers", ar: "البائعون" },
  statSales: { fr: "Ventes", en: "Sales", ar: "المبيعات" },

  // Index
  recentProducts: { fr: "Produits Récents", en: "Recent Products", ar: "منتجات حديثة" },
  recentDesc: { fr: "Découvrez les dernières publications", en: "Discover the latest listings", ar: "اكتشف أحدث المنشورات" },
  loading: { fr: "Chargement...", en: "Loading...", ar: "جار التحميل..." },
  noProductsYet: { fr: "Aucun produit disponible pour le moment.", en: "No products available yet.", ar: "لا توجد منتجات متاحة بعد." },
  beFirst: { fr: "Soyez le premier à publier !", en: "Be the first to publish!", ar: "كن أول من ينشر!" },
  footerText: {
    fr: "© 2026 Kassouata — Marketing digital africain moderne par",
    en: "© 2026 Kassouata — Modern African digital marketing by",
    ar: "© 2026 كاسواتا — تسويق رقمي أفريقي حديث بواسطة",
  },

  // Marketplace
  searchProduct: { fr: "Rechercher un produit...", en: "Search a product...", ar: "ابحث عن منتج..." },
  noProductFor: { fr: "Aucun produit trouvé pour", en: "No product found for", ar: "لم يتم العثور على منتج لـ" },
  beFirstPublish: { fr: "Soyez le premier à publier un produit !", en: "Be the first to publish a product!", ar: "كن أول من ينشر منتجًا!" },

  // Auth
  welcomeOn: { fr: "Bienvenue sur", en: "Welcome to", ar: "مرحبًا بك في" },
  signInToAccount: { fr: "Connectez-vous à votre compte", en: "Sign in to your account", ar: "سجل الدخول إلى حسابك" },
  createSellerAccount: { fr: "Créez votre compte vendeur", en: "Create your seller account", ar: "أنشئ حساب البائع الخاص بك" },
  continueWithGoogle: { fr: "Continuer avec Google", en: "Continue with Google", ar: "المتابعة باستخدام Google" },
  or: { fr: "ou", en: "or", ar: "أو" },
  fullName: { fr: "Nom complet", en: "Full name", ar: "الاسم الكامل" },
  email: { fr: "Email", en: "Email", ar: "البريد الإلكتروني" },
  password: { fr: "Mot de passe", en: "Password", ar: "كلمة المرور" },
  signIn: { fr: "Se connecter", en: "Sign in", ar: "تسجيل الدخول" },
  createMyAccount: { fr: "Créer mon compte", en: "Create my account", ar: "أنشئ حسابي" },
  loadingShort: { fr: "Chargement...", en: "Loading...", ar: "جار التحميل..." },
  noAccountYet: { fr: "Pas encore de compte ?", en: "No account yet?", ar: "ليس لديك حساب بعد؟" },
  alreadyAccount: { fr: "Déjà un compte ?", en: "Already have an account?", ar: "هل لديك حساب بالفعل؟" },
  signUp: { fr: "S'inscrire", en: "Sign up", ar: "اشترك" },
  accountCreated: { fr: "Compte créé !", en: "Account created!", ar: "تم إنشاء الحساب!" },
  checkEmailConfirm: {
    fr: "Vérifiez votre email pour confirmer votre compte.",
    en: "Check your email to confirm your account.",
    ar: "تحقق من بريدك الإلكتروني لتأكيد حسابك.",
  },

  // Create shop
  createMyShop: { fr: "Créer ma Boutique", en: "Create my Shop", ar: "أنشئ متجري" },
  giveShopName: {
    fr: "Donnez un nom à votre boutique pour commencer à vendre",
    en: "Give your shop a name to start selling",
    ar: "أعطِ متجرك اسمًا لبدء البيع",
  },
  shopName: { fr: "Nom de la boutique", en: "Shop name", ar: "اسم المتجر" },
  exShopName: { fr: "Ex: Boutique Amina", en: "Ex: Amina Shop", ar: "مثال: متجر أمينة" },
  shopLogo: { fr: "Logo de la boutique", en: "Shop logo", ar: "شعار المتجر" },
  addLogo: { fr: "Ajouter un logo", en: "Add a logo", ar: "أضف شعارًا" },
  changeLogo: { fr: "Changer le logo", en: "Change logo", ar: "تغيير الشعار" },
  description: { fr: "Description", en: "Description", ar: "الوصف" },
  optional: { fr: "optionnel", en: "optional", ar: "اختياري" },
  describeShop: { fr: "Décrivez votre boutique...", en: "Describe your shop...", ar: "صف متجرك..." },
  creating: { fr: "Création...", en: "Creating...", ar: "جار الإنشاء..." },
  shopCreated: { fr: "Boutique créée !", en: "Shop created!", ar: "تم إنشاء المتجر!" },
  canPublishNow: {
    fr: "Vous pouvez maintenant publier des produits.",
    en: "You can now publish products.",
    ar: "يمكنك الآن نشر المنتجات.",
  },

  // Dashboard
  manageShop: { fr: "Gérez vos produits et ventes", en: "Manage your products and sales", ar: "إدارة منتجاتك ومبيعاتك" },
  add: { fr: "Ajouter", en: "Add", ar: "إضافة" },
  views: { fr: "Vues", en: "Views", ar: "المشاهدات" },
  published: { fr: "Publiés", en: "Published", ar: "منشورة" },
  noPublishedProduct: { fr: "Aucun produit publié", en: "No product published", ar: "لا يوجد منتج منشور" },
  startSelling: {
    fr: "Commencez à vendre en ajoutant votre premier produit.",
    en: "Start selling by adding your first product.",
    ar: "ابدأ البيع بإضافة منتجك الأول.",
  },
  publishFirstProduct: { fr: "Publier mon premier produit", en: "Publish my first product", ar: "انشر منتجي الأول" },
  createYourShop: { fr: "Créez votre boutique", en: "Create your shop", ar: "أنشئ متجرك" },
  toPublishNeedShop: {
    fr: "Pour publier des produits, vous devez d'abord créer votre boutique.",
    en: "To publish products, you must first create your shop.",
    ar: "لنشر المنتجات، يجب عليك أولاً إنشاء متجرك.",
  },
  priceUndefined: { fr: "Prix non défini", en: "Price not set", ar: "السعر غير محدد" },
  notPublished: { fr: "Non publié", en: "Not published", ar: "غير منشور" },
  hide: { fr: "Masquer", en: "Hide", ar: "إخفاء" },
  publish: { fr: "Publier", en: "Publish", ar: "نشر" },
  delete: { fr: "Supprimer", en: "Delete", ar: "حذف" },
  productDeleted: { fr: "Produit supprimé", en: "Product deleted", ar: "تم حذف المنتج" },

  // Create product
  publishProduct: { fr: "Publier un produit", en: "Publish a product", ar: "نشر منتج" },
  needCreateShopFirst: {
    fr: "Vous devez d'abord créer une boutique.",
    en: "You must first create a shop.",
    ar: "يجب عليك أولاً إنشاء متجر.",
  },
  photos: { fr: "Photos (1 à 5)", en: "Photos (1 to 5)", ar: "الصور (من 1 إلى 5)" },
  addPhoto: { fr: "Ajouter", en: "Add", ar: "إضافة" },
  maxPhotos: { fr: "Maximum 5 photos", en: "Maximum 5 photos", ar: "بحد أقصى 5 صور" },
  addAtLeastPhoto: { fr: "Ajoutez au moins une photo", en: "Add at least one photo", ar: "أضف صورة واحدة على الأقل" },
  productName: { fr: "Nom du produit", en: "Product name", ar: "اسم المنتج" },
  exProductName: { fr: "Ex: Sac en cuir artisanal", en: "Ex: Handcrafted leather bag", ar: "مثال: حقيبة جلدية يدوية" },
  category: { fr: "Catégorie", en: "Category", ar: "الفئة" },
  selectCategory: { fr: "Choisir une catégorie", en: "Select a category", ar: "اختر فئة" },
  describeProductRich: {
    fr: "Décrivez votre produit (couleur, police, gras, italique, barré, alignement...)",
    en: "Describe your product (color, font, bold, italic, strikethrough, alignment...)",
    ar: "صف منتجك (اللون، الخط، عريض، مائل، يتوسطه خط، المحاذاة...)",
  },
  describeHelp: {
    fr: "Mettez en forme votre texte : couleurs, polices, gras, italique, barré, alignement.",
    en: "Format your text: colors, fonts, bold, italic, strikethrough, alignment.",
    ar: "نسّق نصك: ألوان، خطوط، عريض، مائل، يتوسطه خط، محاذاة.",
  },
  priceFcfa: { fr: "Prix (FCFA) — optionnel", en: "Price (FCFA) — optional", ar: "السعر (فرنك) — اختياري" },
  exPrice: { fr: "Ex: 25000", en: "Ex: 25000", ar: "مثال: 25000" },
  sellerContact: { fr: "Contact vendeur", en: "Seller contact", ar: "اتصال البائع" },
  whatsappNumber: { fr: "Numéro WhatsApp", en: "WhatsApp number", ar: "رقم واتساب" },
  phoneNumber: { fr: "Numéro téléphone", en: "Phone number", ar: "رقم الهاتف" },
  publishing: { fr: "Publication...", en: "Publishing...", ar: "جار النشر..." },
  publishProductBtn: { fr: "🚀 Publier le produit", en: "🚀 Publish the product", ar: "🚀 انشر المنتج" },
  productPublished: { fr: "Produit publié !", en: "Product published!", ar: "تم نشر المنتج!" },
  editProduct: { fr: "Modifier le produit", en: "Edit product", ar: "تعديل المنتج" },
  saveChanges: { fr: "💾 Enregistrer les modifications", en: "💾 Save changes", ar: "💾 حفظ التغييرات" },
  saving: { fr: "Enregistrement...", en: "Saving...", ar: "جاري الحفظ..." },
  productUpdated: { fr: "Produit mis à jour !", en: "Product updated!", ar: "تم تحديث المنتج!" },
  edit: { fr: "Modifier", en: "Edit", ar: "تعديل" },
  productNotFound: { fr: "Produit introuvable", en: "Product not found", ar: "المنتج غير موجود" },

  // Product card
  contact: { fr: "Contacter", en: "Contact", ar: "اتصال" },
  ownProduct: { fr: "C'est votre propre produit", en: "This is your own product", ar: "هذا منتجك الخاص" },

  // Messages
  noConversation: { fr: "Aucune conversation", en: "No conversation", ar: "لا توجد محادثة" },
  contactSellerStart: {
    fr: "Contactez un vendeur sur le marketplace pour démarrer.",
    en: "Contact a seller in the marketplace to start.",
    ar: "اتصل ببائع في السوق للبدء.",
  },
  writeMessage: { fr: "Écrire un message...", en: "Write a message...", ar: "اكتب رسالة..." },
  selectConversation: { fr: "Sélectionnez une conversation", en: "Select a conversation", ar: "اختر محادثة" },
} satisfies Translations;

type TranslationKey = keyof typeof translations;

interface SettingsContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("kassouata-theme") as Theme) || "light";
  });
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "fr";
    return (localStorage.getItem("kassouata-lang") as Language) || "fr";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("kassouata-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    localStorage.setItem("kassouata-lang", language);
  }, [language]);

  const setTheme = (t: Theme) => setThemeState(t);
  const setLanguage = (l: Language) => setLanguageState(l);
  const t = (key: TranslationKey) => translations[key]?.[language] || String(key);

  return (
    <SettingsContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
