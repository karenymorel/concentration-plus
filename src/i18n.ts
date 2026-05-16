import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./lang/en.json";
import translationES from "./lang/es.json";

const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
};

// — de i18n al react-i18next
i18n.use(initReactI18next).init({ resources, lng: "en", interpolation: { escapeValue: false } });

export default i18n;
