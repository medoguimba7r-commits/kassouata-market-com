import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";
export type Language = "fr" | "en" | "ar";

type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  home: { fr: "Accueil", en: "Home", ar: "الرئيسية" },
  marketplace: { fr: "Marketplace", en: "Marketplace", ar: "السوق" },
  messages: { fr: "Messages", en: "Messages", ar: "الرسائل" },
  myShop: { fr: "Ma Boutique", en: "My Shop", ar: "متجري" },
  login: { fr: "Connexion", en: "Login", ar: "تسجيل الدخول" },
  logout: { fr: "Déconnexion", en: "Logout", ar: "تسجيل الخروج" },
  settings: { fr: "Paramètres", en: "Settings", ar: "الإعدادات" },
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
  about: { fr: "À propos", en: "About", ar: "حول" },
  aboutDeveloper: { fr: "À propos du développeur", en: "About the developer", ar: "عن المطور" },
  developerName: { fr: "Développeur : MHD", en: "Developer: MHD", ar: "المطور: MHD" },
  vision: {
    fr: "Vision : marketing digital africain moderne",
    en: "Vision: modern African digital marketing",
    ar: "الرؤية: التسويق الرقمي الأفريقي الحديث",
  },
};

interface SettingsContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: keyof typeof translations) => string;
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
  const t = (key: keyof typeof translations) => translations[key]?.[language] || String(key);

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
